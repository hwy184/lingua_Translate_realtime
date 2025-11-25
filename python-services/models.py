# models.py

from pydantic import BaseModel


class TranslateRequest(BaseModel):
    requestId: str
    text: str
    src_lang: str
    target_lang: str
