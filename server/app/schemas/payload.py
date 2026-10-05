from typing import Optional
from pydantic import BaseModel, Field


class SecretInput(BaseModel):
    key: str


class AlgorithmConfig(BaseModel):
    bits_per_pixel: int = Field(default=1, ge=1, le=8)
    secret: Optional[SecretInput] = None


class EncodeRequest(BaseModel):
    image_id: str
    message: str
    config: AlgorithmConfig


class DecodeRequest(BaseModel):
    image_id: str
    config: AlgorithmConfig


class EncodeResponse(BaseModel):
    id: str
    changes: int


class DecodeResponse(BaseModel):
    message: str


class FileUploadResponse(BaseModel):
    id: str
