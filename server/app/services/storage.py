import os
import re
import uuid
from typing import IO

from app.core.config import settings
from app.core.codec import FORMAT

os.makedirs(settings.root_directory, exist_ok=True)


def generate_file_id() -> str:
    return str(uuid.uuid4())


def build_path(file_id: str) -> str:
    if not file_id or not isinstance(file_id, str):
        raise ValueError("Invalid file identifier was provided to the `build_path` function.")

    if not re.match(r"^[0-9a-fA-F\-]+$", file_id) or ".." in file_id or "/" in file_id or "\\" in file_id:
        raise ValueError("Invalid or unsafe file identifier detected.")

    file_name = f"{file_id}.{FORMAT}"
    full_path = os.path.abspath(os.path.join(settings.root_directory, file_name))
    root_path = os.path.abspath(settings.root_directory)

    common = os.path.commonpath([root_path, full_path])
    if common != root_path:
        raise ValueError("Access outside of the storage directory is forbidden.")

    return full_path


def open_file(file_id: str, mode: str = "xb") -> IO:
    path = build_path(file_id)
    return open(path, mode)
