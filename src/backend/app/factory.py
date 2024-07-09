import datetime
import logging
import os
import traceback

from flask import Flask
from flask import jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from werkzeug.exceptions import HTTPException
from app.services.user_service import create_initial_admin
from app.controllers.auth_controller import auth_bp
from app.controllers.execution_controller import exec_bp
from app.controllers.favorite_controller import favorite_bp
from app.controllers.script_controller import script_bp
from app.tasks import celery_init_app
from app.utils.common import error_resp
from app.utils.db import db


def initialize_data_folder(app):
    app.config["DATA_DIR"] = os.environ.get("DATA_DIR", f"{os.getcwd()}{os.sep}data")
    app.config["EXECUTION_DIR"] = f'{app.config["DATA_DIR"]}{os.sep}executions'
    app.config["TMP_DIR"] = f'{app.config["DATA_DIR"]}{os.sep}tmp'
    os.makedirs(app.config["DATA_DIR"], exist_ok=True)
    os.makedirs(app.config["EXECUTION_DIR"], exist_ok=True)
    os.makedirs(app.config["TMP_DIR"], exist_ok=True)


def configure_app(app):
    """Configure the application instance"""
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get(
        "DATABASE_URL", "sqlite:///:memory:"
    )
    app.config["PYTHON_PATH"] = os.environ.get("PYTHON_PATH", "python")
    app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "123")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = int(
        os.environ.get("JWT_ACCESS_TOKEN_EXPIRES", 604800)
    )


def register_blueprints(app):
    """Register all blueprints for the application"""
    app.register_blueprint(auth_bp)
    app.register_blueprint(script_bp)

    app.register_blueprint(exec_bp)

    app.register_blueprint(favorite_bp)


def initialize_extensions(app):
    """Initialize Flask extensions with the app"""
    db.init_app(app)
    # db.create_all()
    jwt = JWTManager(app)

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return error_resp("Token has expired", 401)

    @jwt.unauthorized_loader
    def unauthorized_loader_callback(msg):
        return error_resp("Missing Authorization Header", 401)

    @jwt.invalid_token_loader
    def invalid_token_callback(msg):
        return error_resp("Invalid JWT", 422)

    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        return {
            "id": jwt_data["sub"],
            "username": jwt_data["username"],
            "email": jwt_data["email"],
            "role_id": jwt_data["role_id"],
        }

    app.config.from_mapping(
        CELERY=dict(
            broker_url="redis://redis:6379/1",
            result_backend="redis://redis:6379/2",
            task_ignore_result=False,
        ),
    )
    celery_init_app(app)


def create_app():
    """Factory to create a Flask application"""
    app = Flask("app", instance_relative_config=True)
    CORS(app)
    configure_app(app)
    initialize_data_folder(app)
    initialize_extensions(app)
    register_blueprints(app)
    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        datefmt="%Y-%m-%d %H:%M:%S",
    )
    with app.app_context():
        pass
        # Ensure all database tables are created
        # db.create_all()
        # Create initial admin user
        create_initial_admin()
    return app


app = create_app()
celery_app = app.extensions["celery"]


@app.before_request
def pre_request_logging():
    # Logging statement
    app.logger.info("Request")
    app.logger.info(
        "\t".join(
            [
                datetime.datetime.today().ctime(),
                request.remote_addr,
                request.method,
                request.url,
                # request.get_data(as_text=True),
            ]
        )
    )


@app.after_request
def post_request_logging(response):
    # Logging statement
    app.logger.info("Response")
    app.logger.info(
        "\t".join(
            [
                datetime.datetime.today().ctime(),
                request.remote_addr,
                request.method,
                request.url,
                response.status,
                # response.get_data(as_text=True),
            ]
        )
    )
    return response


@app.errorhandler(Exception)
def handle_error(e):
    traceback.print_exc()
    code = 500
    if isinstance(e, HTTPException):
        code = e.code
    return error_resp(str(e), code)


@app.route("/", methods=["GET"])
def server_status():
    """Endpoint to check server status"""
    return jsonify(status=200, message="server is running", success=True, data={}), 200
