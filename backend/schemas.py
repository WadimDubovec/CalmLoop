from pydantic import BaseModel

class MoodRequest(BaseModel):
    mood: str
    duration: int
