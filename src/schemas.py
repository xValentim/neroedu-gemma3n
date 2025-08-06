from pydantic import BaseModel, Field
from typing import Optional, List
from .utils import example_essay

class InputDataEssayEnem(BaseModel):
    essay: str = example_essay
    model_name: str = "gemma3n:e2b"
    competencia: int = 1
    
class InputDataEssay(BaseModel):
    essay: str = example_essay
    model_name: str = "gemma3n:e2b"
    exam_type: None | str = "enem"  # it can be 'enem', 'icfes', 'exani', 'sat', 'cuet', 'exames_nacionais'
    
class InputSimulado(BaseModel):
    tema: str = "world war ii"
    model_name: str = "gemma3n:e2b"
    questions: Optional[List[str]] = []
    exam_type: None | str = "enem" # it can be 'enem', 'icfes', 'exani', 'sat', 'cuet', 'exames_nacionais'
    lite_rag: None | bool = False

class InputFlashcard(BaseModel):
    tema: str = "world war ii"
    flashcards_existentes: Optional[List[str]] = []
    model_name: str = "gemma3n:e2b"
    exam_type: None | str = "enem"  # it can be 'enem', 'icfes', 'exani', 'sat', 'cuet', 'exames_nacionais'
    lite_rag: None | bool = False

class InputDataKeyTopics(BaseModel):
    tema: str = "world war ii"
    model_name: str = "gemma3n:e2b"
    exam_type: None | str = "enem"  # it can be 'enem', 'icfes', 'exani', 'sat', 'cuet', 'exames_nacionais'
    lite_rag: None | bool = False

class OutputDataEssayEnem(BaseModel):
    response: str
    model: str
    competencia: int
    
class Essay(BaseModel):
    essay_id: None | int = Field(default=None, description="Unique identifier for the essay")
    essay: str
    grade: int
    exam_type: Optional[str] = "enem"  # it can be 'enem', 'icfes', 'exani', 'sat', 'cuet', 'exames_nacionais'
    feedback: Optional[str] = ""
    
class InputEssay(BaseModel):
    essay: str
    grade: int
    exam_type: Optional[str] = "enem"  # it can be 'enem', 'icfes', 'exani', 'sat', 'cuet', 'exames_nacionais'
    feedback: Optional[str] = ""
