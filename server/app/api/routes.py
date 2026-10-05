import io
import os
from PIL import Image
from fastapi import APIRouter, HTTPException, File, UploadFile
from starlette.responses import FileResponse
from cryptography.fernet import InvalidToken

from app.core import codec, security
from app.core.config import settings
from app.schemas.payload import (
    EncodeRequest,
    EncodeResponse,
    DecodeRequest,
    DecodeResponse,
    FileUploadResponse
)
from app.services.storage import build_path, open_file, generate_file_id

router = APIRouter()


@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(file: UploadFile = File(...)):
    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    try:
        with Image.open(io.BytesIO(content)) as test_img:
            test_img.verify()
    except Exception:
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid image.")

    file_id = generate_file_id()
    try:
        with open_file(file_id, mode="wb") as physical_file:
            physical_file.write(content)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to save uploaded file.") from e

    return {"id": file_id}


@router.get("/file/{file_id}")
def get_file(file_id: str):
    try:
        path = build_path(file_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail="Requested file was not found.")

    return FileResponse(path=path, media_type=codec.MEDIA_TYPE)


@router.post("/encode", response_model=EncodeResponse)
def encode(payload: EncodeRequest):
    with load_image(payload.image_id) as image:
        image_bands = len(image.getbands())
        total_bytes = image.width * image.height * image_bands
        available_positions = total_bytes * payload.config.bits_per_pixel

        message = payload.message
        if payload.config.secret:
            message = security.encrypt(message, payload.config.secret.key)

        formatted_msg = codec.format_message(message, prefix=settings.prefix, suffix=settings.suffix)
        message_bits = codec.to_bits(formatted_msg)

        if available_positions < len(message_bits):
            error_message = (
                f"The message is too long. There are {available_positions} available positions "
                f"but {len(message_bits)} are required."
            )
            raise HTTPException(status_code=400, detail=error_message)

        changes = codec.encode_message(image, message_bits, payload.config.bits_per_pixel)
        if changes < 0:
            raise HTTPException(status_code=400, detail="Encoding was unsuccessful.")

        file_id = generate_file_id()
        with open_file(file_id, mode="wb") as save_destination:
            image.save(save_destination, format="PNG")

        return {"id": file_id, "changes": changes}


@router.post("/decode", response_model=DecodeResponse)
def decode(payload: DecodeRequest):
    with load_image(payload.image_id) as image:
        message = codec.decode_message(
            image,
            bits_per_pixel=payload.config.bits_per_pixel,
            prefix=settings.prefix,
            suffix=settings.suffix
        )

    if payload.config.secret:
        try:
            message = security.decrypt(message, payload.config.secret.key)
        except InvalidToken:
            raise HTTPException(status_code=400, detail="Invalid encryption token or incorrect password.")

    return {"message": message}


def load_image(file_id: str) -> Image.Image:
    try:
        path = build_path(file_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    if not os.path.isfile(path):
        raise HTTPException(status_code=404, detail=f"Image with id '{file_id}' not found.")

    img = Image.open(path)
    if img.mode != "RGB":
        img = img.convert("RGB")
    return img
