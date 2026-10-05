import os
import sys
import unittest
from PIL import Image

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.core import codec, security
from app.services import storage


class TestPipeline(unittest.TestCase):
    def test_codec_encoding(self):
        text = "Hello, World! Testing 123"
        encoded = codec.encode_str(text)
        decoded = codec.decode_str(encoded)
        self.assertEqual(text, decoded)

    def test_encryption_roundtrip(self):
        password = "supersecretpassword123"
        message = "Confidential message with special characters: ^ & ~ ! @ #"
        ciphertext = security.encrypt(message, password)
        self.assertNotEqual(message, ciphertext)

        decrypted = security.decrypt(ciphertext, password)
        self.assertEqual(message, decrypted)

    def test_encryption_invalid_password(self):
        password = "correct_password"
        wrong_password = "wrong_password"
        message = "Secret text"
        ciphertext = security.encrypt(message, password)

        from cryptography.fernet import InvalidToken
        with self.assertRaises(InvalidToken):
            security.decrypt(ciphertext, wrong_password)

    def test_path_traversal_prevention(self):
        with self.assertRaises(ValueError):
            storage.build_path("../../etc/passwd")

        with self.assertRaises(ValueError):
            storage.build_path("..\\..\\windows\\system32")

        with self.assertRaises(ValueError):
            storage.build_path("")

    def test_flowers_encoded_demo_image(self):
        demo_image_path = os.path.abspath(
            os.path.join(os.path.dirname(__file__), "..", "..", "client", "public", "images", "flowers-encoded.png")
        )
        self.assertTrue(os.path.exists(demo_image_path), f"Demo image not found at {demo_image_path}")

        img = Image.open(demo_image_path)
        decoded = codec.decode_message(img, bits_per_pixel=1)
        self.assertEqual(decoded, "You are awesome!")

    def test_encode_and_decode_roundtrip_ascii(self):
        img = Image.new("RGB", (100, 100), color=(128, 128, 128))
        message = "Testing 1, 2, 3 steganography!"
        formatted = codec.format_message(message)
        bits = codec.to_bits(formatted)

        changes = codec.encode_message(img, bits, bits_per_pixel=1)
        self.assertGreaterEqual(changes, 0)

        decoded = codec.decode_message(img, bits_per_pixel=1)
        self.assertEqual(decoded, message)

    def test_encode_and_decode_with_delimiter_characters(self):
        img = Image.new("RGB", (150, 150), color=(200, 100, 50))
        message = "This message has ^ caret and \\ backslash and ~ tilde!"
        formatted = codec.format_message(message)
        bits = codec.to_bits(formatted)

        changes = codec.encode_message(img, bits, bits_per_pixel=2)
        self.assertGreaterEqual(changes, 0)

        decoded = codec.decode_message(img, bits_per_pixel=2)
        self.assertEqual(decoded, message)

    def test_encode_and_decode_utf8_multibyte(self):
        img = Image.new("RGB", (200, 200), color=(60, 80, 100))
        message = "Multilingual test: Привет мир, こんにちは, Bonjour, 🚀🎉"
        formatted = codec.format_message(message)
        bits = codec.to_bits(formatted)

        changes = codec.encode_message(img, bits, bits_per_pixel=3)
        self.assertGreaterEqual(changes, 0)

        decoded = codec.decode_message(img, bits_per_pixel=3)
        self.assertEqual(decoded, message)


if __name__ == "__main__":
    unittest.main()
