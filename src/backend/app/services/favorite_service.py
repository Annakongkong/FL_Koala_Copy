from app.models import Favorite, Users, Script
from app.utils.db import DB
from app.utils.common import log


# Add a script into the user's favorites
def add_favorite(user_id, script_id):
    db = DB()
    with db.get_session() as session:
        existing_favorite = (
            session.query(Favorite)
            .filter_by(user_id=user_id, script_id=script_id)
            .first()
        )
        if existing_favorite:
            return {
                "error": True,
                "message": "This script is already in favorites",
                "code": 400,
            }
        is_script = session.query(Script).filter_by(id=script_id).first()
        if not is_script:
            return {"error": True, "message": "Script does not exist", "code": 404}

        new_favorite = Favorite(user_id=user_id, script_id=script_id)
        session.add(new_favorite)
        return {"error": False, "new_favorite": new_favorite}


# Remove a script from the user's favorites
def delete_favorite(user_id, script_id):
    db = DB()
    with db.get_session() as session:
        favorite_to_delete = (
            session.query(Favorite)
            .filter_by(user_id=user_id, script_id=script_id)
            .first()
        )
        if not favorite_to_delete:
            raise Exception("Favorite not found")

        session.delete(favorite_to_delete)


# List all the user's favorites
def list_favorite(user_id):
    db = DB()
    with db.get_session() as session:
        user = session.query(Users).get(user_id)
        if not user:
            raise Exception("User not found")

        favorites = session.query(Favorite).filter_by(user_id=user_id).all()
        favorite_script_ids = [favorite.script_id for favorite in favorites]
        return favorite_script_ids


def get_favorite_scripts(user_id):
    db = DB()
    with db.get_session() as session:
        user = session.query(Users).get(user_id)
        if not user:
            raise Exception("User not found")
        favorites = session.query(Favorite).filter_by(user_id=user_id).all()

        favorite_script_ids = [favorite.script_id for favorite in favorites]
        log().info(favorite_script_ids)

        favorite_scripts = (
            session.query(Script).filter(Script.id.in_(favorite_script_ids)).all()
        )
        favorite_scripts = [
            {
                "id": script.id,
                "name": script.name,
                "description": script.description,
                "instruction": script.instruction,
                "label": script.label,
                "status": script.status,
                "created_at": script.created_at,
                "updated_at": script.updated_at,
                "upload_required": script.upload_required,
                "is_active": script.is_active,
            }
            for script in favorite_scripts
        ]
        return favorite_scripts
