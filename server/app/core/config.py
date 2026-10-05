from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    prefix: str = "~"
    suffix: str = "^"
    client_url: str = "http://localhost:3000"
    allowed_methods: List[str] = ["GET", "POST", "OPTIONS"]
    allow_headers: List[str] = ["*"]
    root_directory: str = "./_data"

    model_config = SettingsConfigDict(env_file=".env", case_sensitive=False, extra="ignore")


settings = Settings()
