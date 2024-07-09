
from flask_jwt_extended import jwt_required
from flask import Blueprint
from app.services.favorite_service import add_favorite, delete_favorite, list_favorite, get_favorite_scripts
from app.services.script_service import get_script_by_id
from flask_jwt_extended import get_jwt_identity
from app.utils.common import error_resp, success_response
from app.services.user_service import is_admin
from app.utils.common import current_user,log


favorite_bp = Blueprint("favorite_bp", __name__)

@favorite_bp.route("/api/favorite/<int:script_id>", methods=["POST"])
@jwt_required()
def favorite_script(script_id):
    user_id = get_jwt_identity()
    result = add_favorite(user_id, script_id)
    if not result['error']:
        return success_response(message="Script added to favorites")
    else:
        return error_resp(result['message'], result['code'])

@favorite_bp.route("/api/unfavorite/<int:script_id>", methods=["DELETE"])
@jwt_required()
def unfavorite_script(script_id):
    user_id = get_jwt_identity()
    try:
        delete_favorite(user_id, script_id)
        return success_response(message="Script removed from favorites")
    except Exception as e:
        return error_resp(str(e), 404)


@favorite_bp.route("/api/list/favorite", methods=["GET"])
@jwt_required()
def get_favorite_script():
    user_id = get_jwt_identity()
    try:
        favorite_script_ids = list_favorite(user_id)
        favorite_script_data = []
        admin = is_admin(user_id)

        for sp in favorite_script_ids:
            script = get_script_by_id(sp)
            if admin or script.is_active:
                favorite_script_data.append(script.id)

        return success_response(
            message="List of favorites retrieved successfully",
            data=favorite_script_data
        )
    except Exception as e:
        return error_resp(str(e), code=404)


@favorite_bp.route("/api/list/favorite/user", methods=["GET"])
@jwt_required()
def get_favorite_script_by_user():
    user = current_user()
    _id= user.id
    log().info(f"User {user.id} requested to get favorite scripts")
    try:
        favorite_scripts= get_favorite_scripts(_id)
        return success_response(message="List of favorites retrieved successfully",
                                data= favorite_scripts)
    except Exception as e:
        return error_resp(str(e), 404)

