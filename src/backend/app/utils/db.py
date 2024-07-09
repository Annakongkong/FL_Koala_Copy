from contextlib import contextmanager
from typing import Generator

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm.scoping import scoped_session

from app.utils.common import log


class Base(DeclarativeBase):
    pass


db = SQLAlchemy(model_class=Base)


class DB:
    def __init__(self):
        log().info("DB instance created")

    @contextmanager
    def get_session(self) -> Generator[scoped_session, None, None]:
        session = db.session()
        try:
            yield session
            session.commit()
        except:
            session.rollback()
            raise
        # finally:
        #     session.close()

    def new_session(self):
        return db.session()
