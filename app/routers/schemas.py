from sqlmodel import Field, SQLModel
import datetime

class User(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    secret_name: str
    tokens: int = Field(default=0)
    requests: int = Field(default=0)
    current_credit: float = Field(default=0.0)
    is_active: bool = Field(default=True)

class Item(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    title: str
    content: str
    date: datetime.datetime = Field(default_factory=datetime.datetime.utcnow)
    cost_credits: float = Field(default=0.0)
    tokens: int = Field(default=0)
    user_id: int
    
class ItemUpdate(SQLModel):
    title: str | None = None
    content: str | None = None
    cost_credits: float | None = None
    tokens: int | None = None

class UserUpdate(SQLModel):
    name: str | None = None
    secret_name: str | None = None
    tokens: int | None = None
    requests: int | None = None
    current_credit: float | None = None
    is_active: bool | None = None
    
class DocumentInput(SQLModel):
    title: str
    content: str
    
class DocumentOutput(SQLModel):
    document: DocumentInput
    summary: str
    
class OutputSummary(SQLModel):
    user: User
    document: DocumentInput
    summary: str
    
class CreditsRequest(SQLModel):
    credits: float