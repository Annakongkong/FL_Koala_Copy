import json
import os
import time
from typing import List

from celery.result import AsyncResult
from flask import Blueprint, request
from flask import Response
from flask import current_app, send_file
from flask_jwt_extended import jwt_required

import app.services.execution_service as execution_service
from app.services.execution_service import execute_script, save_tmp_file, save_chunk, complete_upload, \
    get_executions_by_userid
from app.utils.common import error_resp,log
from app.utils.common import success_response, get_current_user_id

exec_bp = Blueprint("exec_bp", __name__)


@exec_bp.route("/api/execute", methods=["POST"])
@jwt_required()
def execution():
    # get user id from jwt
    user_id = get_current_user_id()
    if "multipart/form-data" not in request.content_type:
        return error_resp("Invalid content type, must be multipart/form-data", 400)
    script_id = request.form.get("script_id", "")
    has_file = request.form.get("has_file", False)
    filename = None
    if "file" in request.files:
        filename = save_tmp_file(user_id, request.files["file"])
    new_exec = execute_script(int(script_id), user_id, input_zip_path=filename)
    return success_response("Execution started successfully", new_exec)


@exec_bp.route("/api/download/<string:execution_id>", methods=["GET"])
def download_output(execution_id):
    if not execution_id:
        return error_resp("No filename specified", 400)
    base_path = current_app.config["EXECUTION_DIR"]
    return send_file(
        f"{base_path}{os.sep}{execution_id}{os.sep}output.zip", as_attachment=True
    )


@exec_bp.route("/api/download/<string:execution_id>/log", methods=["GET"])
def download_log(execution_id):
    if not execution_id:
        return error_resp("No filename specified", 400)
    base_path = current_app.config["EXECUTION_DIR"]
    return send_file(
        f"{base_path}{os.sep}{execution_id}{os.sep}script.log", as_attachment=True
    )



@exec_bp.route("/api/executions/<int:user_id>", methods=["GET"])
@jwt_required()
def get_executions_by_user_id(user_id):
    user = get_current_user_id()
    if user == user_id:
        try:
            executions = get_executions_by_userid(user_id)
            execution_data = []
            for execution in executions:
                execution_info = {
                    "execution_id": execution.id,
                    "task_id": execution.task_id,
                    "script_name": execution.script_name,
                    "startTime": execution.start_time,
                    "endTime": execution.end_time,
                    "status": execution.status,
                    "output": execution.output,
                    "script_id": execution.script_id,
                }
                execution_data.append(execution_info)

            execution_data.sort(key=lambda x: x["startTime"], reverse=True)

            return success_response(
                message="Executions fetched successfully",
                data=execution_data
            )
        except Exception as e:
            return error_resp(str(e), code=400)
    else:
        return error_resp("You are not authorized to access this resource", 401)



def sse_response(is_running, status, message, data=None)->str:
    return (
        f"data: {json.dumps({"is_running": is_running, "status": status, "message": message, "data": data}    )}\n\n"
    )

 

@exec_bp.route("/api/v2/execute", methods=["POST"])
def execution_v2():
    # get user id from jwt
    user_id = get_current_user_id()
    if "multipart/form-data" not in request.content_type:
        return error_resp("Invalid content type, must be multipart/form-data", 400)
    script_id = request.form.get("script_id", "")
    script_id = int(script_id)
    has_file = request.form.get("has_file", False)
    filename = None
    if "file" in request.files:
        filename = save_tmp_file(user_id, request.files["file"])
    new_exec_id, task_id = execution_service.init_exec(script_id, user_id, filename)
    return success_response(
        "Execution started successfully", {"exec_id": new_exec_id, "task_id": task_id}
    )


@exec_bp.route("/api/execute/status/all/<int:user_id>", methods=["GET"])
def sse_execute_status_all(user_id):

    exec_list = execution_service.get_executions_by_status_user_id(user_id, "RUNNING")

    log().info(exec_list)
    def exec_status_stream_list(exec_list2:List[dict]):
        res_list= [AsyncResult(exec_["task_id"]) for exec_ in exec_list2]

        def generate():
                # Yield initial data
            info=[{"script_id":exec_["script_id"],"script_name":exec_["script_name"],"task_id":exec_["task_id"]} for exec_,res in zip(exec_list2, res_list)]
            # yield sse_response(True, "Listening", f"{len(exec_list2)} executions are running", info)
            while True:
                time.sleep(1)
                running=[res for res in res_list if res.state=="RUNNING" or res.state=="PENDING"]
                success=[res for res in res_list if res.state=="SUCCESS"]
                failed=[res for res in res_list if res.state=="FAILED"]
                running_task_ids=[res.id for res in running]
                success_task_ids=[res.id for res in success]
                failed_task_ids=[res.id for res in failed]
                yield sse_response(True, "Listening", f"{len(running)} executions are running",{"running":running_task_ids,"success":success_task_ids,"failed":failed_task_ids})
                if len(running)==0:
                    yield sse_response(False, "Listening", f"All executions are done",{"running":running_task_ids,"success":success_task_ids,"failed":failed_task_ids})
                    break
        
        return Response(generate(), mimetype="text/event-stream")
    return exec_status_stream_list(exec_list)

@exec_bp.route("/api/execute/status", methods=["GET"])
def sse_execute_status():
    # Assume the POST body contains the script to execute.
    id = request.args.get("taskId")
    log().info(id)
    
    def exec_status_stream(task_id):
        res = AsyncResult(task_id)
        def generate():
            yield sse_response(True, res.state, "Execution is running", None)
            
            if res is None:
                yield sse_response(False, "ERROR", "Task not found", None)
                return
            # Yield initial data
            while not res.ready():
                time.sleep(1)
                if res.state == "RUNNING":
                    yield sse_response(True, res.state, "Execution is running", None)
                # pending state means the task is not yet started
            yield sse_response (False, res.state, "Execution is done", res.info)
             
        return Response(generate(), mimetype="text/event-stream")
    return exec_status_stream(id)


EXEC_STATUS = ["PENDING", "RUNNING", "SUCCESS", "FAILED", "ABORTED"]


@exec_bp.route("/api/execute", methods=["GET"])
def get_exec_by_user_status():
    user_id = get_current_user_id()
    status = request.args.get("status")
    if status not in EXEC_STATUS:
        return error_resp(f"Status should be any of {EXEC_STATUS}", 400)
    
    return success_response(
        "Executions retrieved successfully",
        execution_service.get_executions_by_status_user_id(user_id, status),
    )


@exec_bp.route("/api/execution/delete", methods=["POST"])
def del_exec_by_id():
    user_id = get_current_user_id()
    ids = request.json["exec_id"]

    return success_response(
        "Executions retrieved successfully",
        execution_service.delete_executions(ids),
    )




@exec_bp.route('/api/upload', methods=['POST'])
def upload_chunk():
    chunk = request.files.get('chunk')
    filename = request.form.get('filename')
    index = request.form.get('index')

    return save_chunk(chunk, filename, index)


@exec_bp.route('/api/upload/complete', methods=['POST'])
def complete_upload_route():
    filename = request.form.get('filename')
    nums = int(request.form.get('nums'))

    return complete_upload(filename, nums)

@exec_bp.route('/api/data_space_used', methods=['GET'])
def get_data_space_used():
    return success_response("Space used", {
        "data": execution_service.get_space_used()}
        )
