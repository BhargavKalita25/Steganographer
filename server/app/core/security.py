import base64
import secrets

from cryptography.fernet import Fernet, InvalidToken
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC

from app.core import codec

ITERATIONS = 100_000


def encrypt(text: str, password: str) -> str:
    text_bytes = codec.encode_str(text)
    password_bytes = codec.encode_str(password)

    salt = secrets.token_bytes(16)
    key = derive_key(password_bytes, salt)

    encrypted_bytes = Fernet(key).encrypt(text_bytes)

    salt_text = codec.decode_str(base64.b64encode(salt))
    encrypted_text = codec.decode_str(base64.b64encode(encrypted_bytes))

    return f"{salt_text}{encrypted_text}"


def decrypt(text: str, password: str) -> str:
    if not text or len(text) < 24:
        raise InvalidToken("Encrypted text is missing or too short to contain valid salt and ciphertext.")

    try:
        salt = base64.b64decode(text[:24])
        encrypted_message = base64.b64decode(text[24:])
    except Exception as e:
        raise InvalidToken("Corrupted base64 payload") from e

    password_bytes = codec.encode_str(password)
    key = derive_key(password_bytes, salt)

    decrypted_bytes = Fernet(key).decrypt(encrypted_message)
    return codec.decode_str(decrypted_bytes)


def derive_key(password: bytes, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(algorithm=hashes.SHA256(), length=32, salt=salt, iterations=ITERATIONS)
    derived_key = kdf.derive(password)
    return base64.urlsafe_b64encode(derived_key)
