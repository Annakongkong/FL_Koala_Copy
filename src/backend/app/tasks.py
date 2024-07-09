# tasks.py

import os

from celery import Celery, Task
from celery import shared_task
from flask import current_app
from datetime import datetime
from celery.contrib.abortable import AbortableTask

from app.execution_engine import ExecutionDisposable
from app.models import Execution
from app.utils.db import db


def celery_init_app(app) -> Celery:
    class FlaskTask(Task):
        def __call__(self, *args: object, **kwargs: object) -> object:
            with app.app_context():
                return self.run(*args, **kwargs)

    celery_app = Celery(app.name, task_cls=FlaskTask)
    celery_app.config_from_object(app.config["CELERY"])
    celery_app.set_default()
    app.extensions["celery"] = celery_app
    return celery_app


# Configure Celery to use RabbitMQ as the broker


 

@shared_task(bind=True, base=AbortableTask, ignore_result=False)
def execute_script2(self, exec_base_dir, exec_id, code, input_zip_path, python_path):
    execute = ExecutionDisposable(exec_base_dir, exec_id)

    # Update the task state to 'RUNNING'
    self.update_state(state="RUNNING", meta={"status": "Running the script..."})

    success, output_path = execute.run(
        script_code=code,
        input_zip_path=input_zip_path,
        download_output=True,
        executable_python=python_path,
    )

    return {"success": success, "output_path": output_path, "exec_id": exec_id}


# callback function when the execution is done
@shared_task
def update_exec(json_data):
    print("Update execution")

    success = json_data["success"]
    output_path = json_data["output_path"]
    output_path = os.path.relpath(output_path, current_app.config["EXECUTION_DIR"])

    new_exec = Execution.query.get(json_data["exec_id"])
    new_exec.output = output_path
    if success:
        new_exec.status = "SUCCESS"
    else:
        new_exec.status = "FAILED"
    new_exec.end_time = datetime.utcnow()
    db.session.commit()
