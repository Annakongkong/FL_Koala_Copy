import os.path
import shutil

from app.execution_engine import ExecutionDisposable
from app.services.script_service import get_script_by_id
from flask import current_app
from app.utils.common import log
from app.utils.db import DB
from app.models import Execution
from uuid import uuid4
from datetime import datetime
import app.tasks as tasks
from app.tasks import update_exec
from app.models import Script


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in {"zip"}


def execute_script(script_id: int, user_id: int, input_zip_path=None) -> Execution:
    new_exec = save_execution(script_id, user_id)

    execute = ExecutionDisposable(current_app.config["EXECUTION_DIR"], new_exec.id)
    script = get_script_by_id(script_id)
    if not script:
        raise ValueError("Script not found")

    success, output_path = execute.run(
        script_code=script.code,
        input_zip_path=input_zip_path,
        download_output=True,
        executable_python=current_app.config["PYTHON_PATH"],
    )
    output_path = os.path.relpath(output_path, current_app.config["EXECUTION_DIR"])
    new_exec.output = output_path
    if success:
        new_exec.status = "SUCCESS"
    else:
        new_exec.status = "FAILED"

    update_execution(new_exec)
    return new_exec


def save_tmp_file(user_id, file):
    if file:
        if file.filename == "":
            raise ValueError("No file selected")
        if not allowed_file(file.filename):
            raise ValueError("File type not allowed")
        tmp_dir = os.path.join(current_app.config["TMP_DIR"], str(user_id))
        if not os.path.exists(tmp_dir):
            os.makedirs(tmp_dir)
        filename = os.path.join(tmp_dir, str(uuid4())[:8] + ".zip")

        file.save(filename)
        log().info(f"File saved to {filename}")
        return filename
    return None


def save_execution(
    script_id: int, user_id: int, input_zip_path=None, output_zip_path=None
) -> Execution:
    db = DB()
    with db.get_session() as session:
        execution = Execution(
            script_id=script_id,
            user_id=user_id,
            start_time=datetime.utcnow(),
            status="RUNNING",
        )
        session.add(execution)
        session.commit()
        return execution


def update_execution(execution):
    db = DB()
    with db.get_session() as session:
        o_execution = (
            session.query(Execution).filter(Execution.id == execution.id).first()
        )
        if not o_execution:
            raise ValueError("Execution not found")
        o_execution.status = execution.status
        o_execution.output = execution.output

        o_execution.end_time = datetime.utcnow()
        session.commit()
        return execution


def get_execution_by_id(id_) -> Execution:
    db = DB()
    with db.get_session() as session:
        execution = session.query(Execution).filter(Execution.id == id_).first()
        return execution


def get_executions_by_userid(user_id: int) -> list[Execution]:
    db = DB()
    with db.get_session() as session:
        executions = session.query(Execution).filter(Execution.user_id == user_id).all()
        return executions


def init_exec(script_id: int, user_id: int, input_zip_path=None) -> Execution:
    new_exec = save_execution(script_id, user_id)

    script = get_script_by_id(script_id)
    if not script:
        raise ValueError("Script not found")
    task = tasks.execute_script2.apply_async(
        (
            current_app.config["EXECUTION_DIR"],
            new_exec.id,
            script.code,
            input_zip_path,
            "python",
        ),
        link=update_exec.s(),
    )
    update_execution_by_dict(new_exec.id, {"task_id": task.id})

    return new_exec.id, task.id


def update_execution_by_dict(id_: int, newValue: dict) -> Execution:
    db = DB()
    with db.get_session() as session:
        execution = session.query(Execution).filter(Execution.id == id_).first()
        if not execution:
            raise ValueError("Execution not found")
        for key, value in newValue.items():
            setattr(execution, key, value)
        session.commit()
        return execution


from sqlalchemy.orm import aliased


def get_executions_by_status_user_id(user_id: int, status: str) -> list[dict]:
    db = DB()
    session = db.new_session()
    script_alias = aliased(Script)
    executions = (
        session.query(Execution, script_alias.name, script_alias.label)
        .join(script_alias, script_alias.id == Execution.script_id)
        .filter(Execution.user_id == user_id, Execution.status == status)
        .all()
    )
    execution_list = []
    for execution in executions:
        execution_dict = execution[0].get_dict()
        execution_dict["script_name"] = execution[1]
        execution_dict["script_label"] = execution[2]
        execution_list.append(execution_dict)

    return execution_list


UPLOAD_PATH = "./uploads"
UPLOAD_TEMP_PATH = "./uploads/tmp"


def save_chunk(chunk, filename, index):
    if not os.path.exists(UPLOAD_TEMP_PATH):
        os.makedirs(UPLOAD_TEMP_PATH)

    chunk_filename = f"{filename}.part{index}"
    chunk_path = os.path.join(UPLOAD_TEMP_PATH, chunk_filename)
    chunk.save(chunk_path)

    return {"message": f"Chunk {index} uploaded successfully"}, 200


def complete_upload(filename, nums):
    chunk_paths = [
        os.path.join(UPLOAD_TEMP_PATH, f"{filename}.part{i}") for i in range(nums)
    ]
    for chunk_path in chunk_paths:
        if not os.path.exists(chunk_path):
            return {"message": "Missing chunk file"}, 400

    if not os.path.exists(UPLOAD_PATH):
        os.makedirs(UPLOAD_PATH)

    target_path = os.path.join(UPLOAD_PATH, filename)
    with open(target_path, "wb") as target_file:
        for chunk_path in chunk_paths:
            with open(chunk_path, "rb") as chunk_file:
                shutil.copyfileobj(chunk_file, target_file)

    shutil.rmtree(UPLOAD_TEMP_PATH)

    return {"message": "Upload completed successfully"}, 200


# delete executions
def delete_executions(id: list[int]) -> bool:
    db = DB()
    with db.get_session() as session:
        executions = session.query(Execution).filter(Execution.id.in_(id)).all()
        for execution in executions:
            session.delete(execution)
        session.commit()

        return True


def get_space_used():
    # get data folder size
    total_size = 0
    for dirpath, dirnames, filenames in os.walk(current_app.config["DATA_DIR"]):
        for f in filenames:
            fp = os.path.join(dirpath, f)
            total_size += os.path.getsize(fp)
            # with mb
    return str(int(total_size / 1024 / 1024)) + " MB"
