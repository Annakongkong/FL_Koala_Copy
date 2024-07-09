from app.models import Users, Script
from werkzeug.security import generate_password_hash, check_password_hash
from app.utils.db import DB
from flask_jwt_extended import create_access_token
from sqlalchemy import update


def create_user(username, email, password, is_normal, fullname=None) -> Users:
    db = DB()
    with db.get_session() as session:
        if exists_user_by_email(email):
            raise Exception("Email already exists")
        if exists_user_by_username(username):
            raise Exception("Username already exists")
        hashed_password = generate_password_hash(password)

        user = Users(
            email=email,
            username=username,
            password=hashed_password,
            role_id=is_normal,
            fullname=fullname,
        )
        session.add(user)
        session.commit()
        return user


def exists_user_by_email(email) -> bool:
    db = DB()
    with db.get_session() as session:
        user = session.query(Users).filter(Users.email == email).first()
        if user:
            return True
        return False


def exists_user_by_username(username) -> bool:
    db = DB()
    with db.get_session() as session:
        user = session.query(Users).filter(Users.username == username).first()
        if user:
            return True
        return False


def login(email, password) -> tuple[Users, str]:
    db = DB()

    with db.get_session() as session:
        user = session.query(Users).filter(Users.email == email).first()
        if user and check_password_hash(user.password, password):
            token = create_access_token(
                identity=user.id, additional_claims=user.get_claim()
            )
            return user, token
        return (None, "Invalid credentials")


def get_user_by_email(email) -> Users:
    db = DB()
    with db.get_session() as session:
        user = session.query(Users).filter(Users.email == email).first()
        if not user:
            raise Exception("User not found")
        return user


def get_user_by_id(id_) -> Users:
    db = DB()
    with db.get_session() as session:
        user = session.query(Users).filter(Users.id == id_).first()
        if not user:
            return False
        return user


def delete_user(id_) -> bool:
    db = DB()
    with db.get_session() as session:
        user = session.query(Users).filter(Users.id == id_).first()
        if not user:
            return False
        session.delete(user)
        return True


def update_user(email: str, newValues: dict, update_password=False) -> Users:
    db = DB()

    with db.get_session() as session:
        user = session.query(Users).filter(Users.email == email).first()
        if not user:
            raise Exception("User not found")
        if "email" in newValues:
            if exists_user_by_email(newValues["email"]):
                raise Exception("Email already exists")
        if "username" in newValues:
            if exists_user_by_username(newValues["username"]):
                raise Exception("Username already exists")
        if update_password:
            newValues["password"] = generate_password_hash(newValues["password"])
        newValues.update({"id": user.id})
        session.execute(
            update(Users),
            [newValues],
        )
        session.commit()
        user = session.query(Users).filter(Users.email == email).first()
        return user


def list_users():
    db = DB()
    with db.get_session() as session:
        users = session.query(Users).all()
        users = [user.get_sanitized() for user in users]
        return users


def is_admin(user_id):
    db = DB()
    with db.get_session() as session:
        user = session.query(Users).filter(Users.id == user_id).first()
        return user.role_id == 0


def get_username_by_id(user_id):
    db = DB()
    with db.get_session() as session:
        user = session.query(Users).filter(Users.id == user_id).first()
        if not user:
            return False
        return user.username


def get_username_by_script_id(script_id):
    db = DB()
    with db.get_session() as session:
        script = session.query(Script).filter(Script.id == script_id).first()
        if not script:
            return False
        user = session.query(Users).filter(Users.id == script.user_id).first()
        if not user:
            return False
        return user.username


def login_by_username(username, password) -> tuple[Users, str]:
    db = DB()

    with db.get_session() as session:
        user = session.query(Users).filter(Users.username == username).first()
        if user and check_password_hash(user.password, password):
            token = create_access_token(
                identity=user.id, additional_claims=user.get_claim()
            )
            return user, token
        return (None, "Invalid credentials")


def reset_all_password(password: str):
    db = DB()
    with db.get_session() as session:
        users = session.query(Users).all()
        for user in users:
            user.password = generate_password_hash(password)
        session.commit()
        return True
    return False


def create_initial_admin():
    # Check if the admin user already exists
    db = DB()
    with db.get_session() as session:
        if not Users.query.filter_by(email="admin@example.com").first():
            admin = Users(
                username="admin1",
                password=generate_password_hash("123456"),
                email="admin@example.com",
                role_id=0,
                fullname="Administrator",
            )
            session.add(admin)
            session.commit()
            print("Admin user created.")
        else:
            print("Admin user already exists.")
