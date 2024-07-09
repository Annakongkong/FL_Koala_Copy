from datetime import datetime

from app.models import Script, Favorite
from app.services.user_service import get_username_by_id
from app.utils.common import error_resp
from app.utils.db import db
from app.utils.db import DB
from app.models import Execution
from sqlalchemy import func
from app.models import Users


class ScriptNotFoundException(Exception):
    def __init__(self, message="Script not found."):
        self.message = message
        super().__init__(self.message)


def add_script(data):
    if not data or "user_id" not in data:
        raise ScriptNotFoundException("Bad Request. Please provide script details.")
    new_script = Script(
        user_id=data["user_id"],
        file_path=data["file_path"],
        status=data["status"],
        description=data.get("description", ""),
        instruction=data.get("instruction", ""),
        name=data["name"],
        upload_required=data.get("uploadRequired", False),
        code=data.get("code", ""),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        label=data["label"],
        is_active=data.get("is_active", False),
    )
    db.session.add(new_script)
    db.session.commit()
    # return success_response(message="Script added successfully", data={'id': new_script.id})
    return new_script.id


def delete_script(id):
    script = Script.query.get(id)
    if not script:
        return False
    try:
        # remove exec
        db.session.query(Execution).filter(Execution.script_id == id).delete()
        # remove fav
        db.session.query(Favorite).filter(Favorite.script_id == id).delete()
        db.session.delete(script)
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        raise e


def update_script(id, data: dict):
    script = Script.query.get(id)
    if not script:
        raise ScriptNotFoundException()
    for key, value in data.items():
        setattr(script, key, value)
    script.updated_at = datetime.utcnow()
    db.session.commit()
    return True


def list_scripts() -> list[Script]:
    # scripts = Script.query.order_by(Script.id).all()
    # get scripts with user id
    scripts = Script.query.join(Users).order_by(Script.id).all()
    # get scripts without user id
    scripts2 = Script.query.filter(Script.user_id == None).all()
    scripts.extend(scripts2)
    return scripts


def get_script(script_id):
    script = Script.query.filter_by(id=script_id).first()
    if not script:
        return error_resp(f"Scriptid {script_id} not found.", 404)
    return script


def get_script_by_id(script_id) -> Script:
    script = Script.query.filter_by(id=script_id).first()
    if not script:
        raise ValueError(f"{script_id} Script not found.")
    return script


def top_5_executions():
    db = DB()
    with db.get_session() as session:
        try:
            top_executions = (
                session.query(
                    Execution.script_id,
                    func.count(Execution.script_id).label("execution_count"),
                )
                .join(
                    Script, Execution.script_id == Script.id
                )  # Join with the Script table
                .group_by(Execution.script_id)
                .order_by(func.count(Execution.script_id).desc())
                .limit(5)
                .all()
            )
            # Convert the result to a list of dictionaries with script_id and execution_count
            top_executions_data = [
                {
                    "script_id": execution.script_id,
                    "execution_count": execution.execution_count,
                }
                for execution in top_executions
            ]
            return top_executions_data
        except Exception as e:
            return "An error occurred while retrieving the top executions", 500


def admin_active_script(script_id: int):
    db = DB()
    with db.get_session() as session:
        script = session.query(Script).filter_by(id=script_id).first()
        if not script:
            return {"error": True, "message": "Script not found.", "code": 404}
        if script.is_active == True:
            return {"error": True, "message": "Script already active.", "code": 400}

        script.is_active = True
        session.commit()
        return True


def admin_inactive_script(script_id: int):
    db = DB()
    with db.get_session() as session:
        script = session.query(Script).filter_by(id=script_id).first()
        if not script:
            return {"error": True, "message": "Script not found.", "code": 404}
        if script.is_active == False:
            return {"error": True, "message": "Script already inactive.", "code": 400}

        script.is_active = False
        session.commit()
        return True


def list_active_scripts():
    db = DB()
    with db.get_session() as session:
        active_scripts = session.query(Script).filter_by(is_active=True).all()
        scripts_data = [
            {
                "script_id": script.id,
                "script_name": script.name,
                "user_id": script.user_id,
                "user_name": get_username_by_id(script.user_id),
                "status": script.status,
                "description": script.description,
                "updated_time": script.updated_at,
                "label": script.label,
                "is_active": script.is_active,
                "user_full_name": script.user.fullname,
            }
            for script in active_scripts
        ]
        return scripts_data


def is_active_script(script_id):
    db = DB()
    with db.get_session() as session:
        script = session.query(Script).filter_by(id=script_id).first()
        return script.is_active == True


def is_existed_script(script_id):
    db = DB()
    with db.get_session() as session:
        script = session.query(Script).filter_by(id=script_id).first()
        if script:
            return True
        return False
