from sqlmodel import Field, Session, SQLModel, create_engine, select
from typing import Annotated
from fastapi import Depends
import os
from dotenv import load_dotenv

load_dotenv()

ENV = os.getenv("ENV", "prod")

if ENV == "dev":
    sqlite_file_name = "database.db"
    sqlite_url = f"sqlite:///{sqlite_file_name}"

    connect_args = {"check_same_thread": False}
    engine = create_engine(sqlite_url, connect_args=connect_args)
elif ENV == "prod":
    DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/postgres")

    engine = create_engine(DATABASE_URL, echo=True)  # echo=True pra logar SQL


# DATABASE_URL = "sqlite:///database.db"  # ou outro banco, ex: postgresql://user:pass@host/db

# engine = create_engine(DATABASE_URL, echo=True)

# Vamos buscar a URL do Postgres de uma variável de ambiente,
# senão usamos um valor padrão (ajustado ao docker-compose).
# DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/postgres")

# engine = create_engine(DATABASE_URL, echo=True)  # echo=True pra logar SQL


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session

SessionDep = Annotated[Session, Depends(get_session)]