import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import router

app = FastAPI(title="Steganographer API", version="1.0.0")

os.makedirs(settings.root_directory, exist_ok=True)

allowed_origins = [settings.client_url]
for fallback in ("http://localhost:3000", "http://127.0.0.1:3000"):
    if fallback not in allowed_origins:
        allowed_origins.append(fallback)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=settings.allowed_methods,
    allow_headers=settings.allow_headers,
)

app.include_router(router)
