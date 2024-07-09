from flask import Blueprint, request
from flask_jwt_extended import get_jwt_identity, jwt_required
from app.services.script_service import (
    add_script,
    delete_script,
    update_script,
    list_scripts,
    get_script,
    top_5_executions,
    admin_active_script,
    admin_inactive_script,
    list_active_scripts,
    is_active_script,
    is_existed_script
)
from app.utils.common import error_resp, success_response
from app.services.user_service import get_username_by_id, get_username_by_script_id, is_admin
from app.controllers.auth_controller import admin_required

script_bp = Blueprint("script_bp", __name__)


# API endpoints
# add
@script_bp.route("/api/scripts/add", methods=["POST"])
@jwt_required()
def handle_add_script():
    user_id = get_jwt_identity()
    data = request.get_json()
    data["user_id"] = user_id

    try:
        script_id = add_script(data)
        return success_response("Script added successfully", {"id": script_id})
    except Exception as e:
        return error_resp(str(e), 400)


# Delete
@script_bp.route("/api/scripts/delete/<int:id>", methods=["DELETE"])
# @jwt_required()
def handle_delete_script(id):
    try:
        result = delete_script(id)
        if not result:
            return error_resp("Script not found.", 404)
        return success_response("Script deleted successfully")
    except Exception as e:
        return error_resp(str(e), 400)


# update
@script_bp.route("/api/scripts/update/<int:id>", methods=["PUT"])
# @jwt_required()
def handle_update_script(id):
    # return update_script(id, request.get_json())
    try:
        result = update_script(id, request.get_json())
        if result:
            return success_response("Script updated successfully")
        else:
            return error_resp("Script not found.", 404)
    except Exception as e:
        return error_resp(str(e), 400)


@script_bp.route("/api/scripts/list", methods=["GET"])
@jwt_required()
def handle_list_scripts():
    user_id = get_jwt_identity()
    admin = is_admin(user_id)
    # return all existed scripts to administrators
    if admin:
        try:
            scripts = list_scripts()
            script_data = []
            for script in scripts:
                script_info = {
                    "script_id": script.id,
                    "script_name": script.name,
                    "user_id": script.user_id if script.user_id else None,
                    "user_name": script.user.username if script.user_id else None,
                    "description": script.description,
                    "status": script.status,
                    "updated_time": script.updated_at,
                    "label": script.label,
                    "is_active": script.is_active,
                    "user_full_name": script.user.fullname,
                }
                script_data.append(script_info)

            return success_response(
                message="Scripts fetched successfully", data=script_data
            )
        except Exception as e:
            return error_resp(str(e), 404)
        # only return active scripts info to normal users
    else:
        return list_all_active()


# get
@script_bp.route("/api/scripts/get/<int:script_id>", methods=["GET"])
@jwt_required()
def handle_get_script(script_id):
    user_id = get_jwt_identity()
    admin = is_admin(user_id)
    if not is_existed_script(script_id):
        return error_resp("Script not found.", 404)
    if admin or is_active_script(script_id):
        try:
            script = get_script(script_id)
            script_data = {
                "script_id": script.id,
                "script_name": script.name,
                "user_id": script.user_id,
                "user_name": get_username_by_id(script.user_id),
                "status": script.status,
                "description": script.description,
                "instruction": script.instruction,
                "updated_time": script.updated_at,
                "created_time": script.created_at,
                "code": script.code,
                "label": script.label,
                "upload_required": script.upload_required,
                "is_active": script.is_active,
                "user_full_name": script.user.fullname,
            }
            return success_response("Script fetched successfully", script_data)
        except Exception as e:
            return error_resp("Error to fetch the script.", 404)
    else:
        return error_resp("User can not access to the script.", 404)




@script_bp.route("/api/top5/execution", methods=["GET"])
def top_execution():
    result = top_5_executions()
    if isinstance(result, list):
        script_data = []
        for script in result:
            username = get_username_by_script_id(script["script_id"])
            if not username:
                continue
            data = {
                "script_id": script["script_id"],
                "execution_count": script["execution_count"],
                "username": username,
            }
            script_data.append(data)
        return success_response(
            message="Top 5 executions retrieved successfully",
            data={"top_executions": script_data},
        )
    else:
        error_message, error_code = result
        return error_resp(error_message, error_code)


@script_bp.route("/api/scripts/active/<int:script_id>", methods=["POST"], endpoint='active_script_endpoint')
@jwt_required()
@admin_required
def active_script(script_id):
    result = admin_active_script(script_id)
    if (result==True):
        return success_response(message="Script activated successfully.")
    else:
        msg= result["message"]
        code = result["code"]
        return error_resp(msg=msg, code=code)



@script_bp.route("/api/scripts/deactive/<int:script_id>", methods=["POST"], endpoint='inactive_script_endpoint')
@jwt_required()
@admin_required
def inactive_script(script_id):
    result = admin_inactive_script(script_id)
    if result==True:
        return success_response(message="Script deactivated successfully.")
    else:
        msg = result["message"]
        code = result["code"]
        return error_resp(msg=msg, code=code)


@script_bp.route("/api/scripts/active", methods=["GET"])
def list_all_active():
    active_scripts_data = list_active_scripts()
    return success_response(message="Get all active scripts successfully", data=active_scripts_data)