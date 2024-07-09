from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_current_user

from app.services.user_service import (
    create_user,
    login,
    get_user_by_email,
    is_admin,
)
import app.services.user_service as user_service
from app.utils.common import error_resp, success_response, log, current_user
import base64


auth_bp = Blueprint("auth_bp", __name__)


def admin_required(func):
    def wrapper(*args, **kwargs):
        current_user = get_current_user()
        if not is_admin(current_user["id"]):
            return error_resp("Unauthorized operation", 401)
        return func(*args, **kwargs)

    return wrapper


@auth_bp.route("/api/users", methods=["POST"])
def register():
    # Registration logic here
    username = request.json["username"]
    email = request.json["email"]
    password = request.json["password"]
    is_normal = request.json["role"]

    fullname = None
    if "fullname" in request.json:
        fullname = request.json["fullname"]

    user = create_user(username, email, password, is_normal, fullname=fullname)

    return success_response(
        message="User created successfully",
        data=user.get_claim(),
    )


@auth_bp.route("/api/login", methods=["POST"])
def login2():
    # Login logic here
    email = request.json["email"]
    password = request.json["password"]
    user, token = login(email, password)
    if not user:
        return error_resp("Email or password is incorrect", 401)

    access_token = token
    log().info(f"User {user.email} logged in")
    return success_response(
        "Login successfully",
        {"access_token": access_token, "user": user.get_claim()},
    )


@auth_bp.route("/api/current_user", methods=["GET"])
@jwt_required()
def current_user_info():
    current_user = get_current_user()
    log().info(f"Current user: {current_user}")
    user = get_user_by_email(current_user["email"])
    if user:
        return success_response(
            "User found",
            user.get_claim_with_avatar(),
        )


@auth_bp.route("/api/users/<user_id>", methods=["DELETE"])
@jwt_required()
@admin_required
def del_user(user_id):
    if not user_service.delete_user(user_id):
        return error_resp("User not found", 404)
    user_service.delete_user(user_id)
    return success_response("User deleted successfully", {})


# TODO admin required
@auth_bp.route("/api/users", methods=["GET"])
def list_users():
    users = user_service.list_users()
    return success_response("Users found", users)


@auth_bp.route("/api/users/<user_id>", methods=["GET"])
def get_user(user_id):
    user = user_service.get_user_by_id(user_id)
    if not user:
        return error_resp("User not found", 404)
    return success_response("User found", user.get_sanitized())


@auth_bp.route("/api/users", methods=["PUT"])
@jwt_required()
def update_user():

    email = request.json["email"]
    c_user = current_user()
    if c_user.email != email and not is_admin(c_user.id):
        return error_resp("Unauthorized operation", 401)
    update_password = False
    new_vals = {}
    if "username" in request.json:
        new_vals["username"] = request.json["username"]
    if "password" in request.json:
        update_password = True
        new_vals["password"] = request.json["password"]
    if "avatar" in request.json:
        new_vals["avatar"] = base64.b64decode(request.json["avatar"])
    if "role" in request.json:
        new_vals["role_id"] = request.json["role"]
    if "fullname" in request.json:
        new_vals["fullname"] = request.json["fullname"]
    log().info(f"Updating user {email}")
    user = user_service.update_user(email, new_vals, update_password)
    return success_response("User updated successfully", user.get_sanitized())


# TODO: list administrators


@auth_bp.route("/api/v2/login", methods=["POST"])
def login_v2():
    # Login logic here
    email = request.json["username"]
    password = request.json["password"]
    user, token = user_service.login_by_username(email, password)
    if not user:
        return error_resp("Username or password is incorrect", 401)

    access_token = token
    log().info(f"User {user.username} logged in")
    return success_response(
        "Login successfully",
        {"access_token": access_token, "user": user.get_claim()},
    )


@auth_bp.route("/api/reset-passwords", methods=["POST"])
@jwt_required()
def reset_passwords():
    password = request.json["password"]
    if user_service.reset_all_password(password):
        return success_response("Password reset successfully", {})
    return error_resp("Failed to reset password", 500)
