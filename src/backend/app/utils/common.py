from dataclasses import dataclass
from typing import List, Tuple, Any, Dict

from datetime import datetime, timezone

from flask import jsonify, current_app, Response
from flask_jwt_extended import get_current_user, jwt_required

# Define a common datetime format for the application.
DATETIME_FORMAT = "%Y-%m-%d %H:%M:%S"


def log():
    """Retrieve the current application logger."""
    return current_app.logger


def get_time() -> str:
    """Return the current time as a formatted string."""
    return datetime.now().strftime(DATETIME_FORMAT)


def standard_response(
        code: int,
        message: str,
        success: bool = True,
        data: Dict[str, Any] = None,
        http_status: int = 200,
) -> tuple[Response, int]:
    """Generate a standardized API response."""
    if data is None:
        data = {}
    response = {
        "code": code,
        "message": message,
        "success": success,
        "data": data,
        "timestamp": utcnow(),
    }
    return jsonify(response), http_status


def error_resp(msg: str, code: int) -> tuple[Response, int]:
    """Generate a standardized error response."""
    return standard_response(code, msg, False)


def success_response(
        message: str = 'Success',
        data: Dict[str, Any] = None,
) -> Tuple[Dict[str, Any], int]:
    """Generate a standardized API response."""

    return standard_response(200, message, True, data)


def intersection(lst1: List[Any], lst2: List[Any]) -> List[Any]:
    """Return the intersection of two lists."""
    return list(set(lst1) & set(lst2))


def utcnow() -> str:
    """Return the current UTC time as an ISO formatted string."""
    return datetime.now(timezone.utc).isoformat()


@jwt_required()
def get_current_user_id():
    """Retrieve the current user's ID from the JWT."""
    return current_user().id


@dataclass
class CurrentUser:
    """Class for keeping track of an item in inventory."""
    id: int
    email: str
    role_id: int
    username: str


@jwt_required()
def current_user() -> CurrentUser:
    """Retrieve the current user from the JWT."""
    return CurrentUser(
        id=get_current_user().get("id"),
        email=get_current_user().get("email"),
        role_id=get_current_user().get("role_id"),
        username=get_current_user().get("username"),
    )
