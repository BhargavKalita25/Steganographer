from typing import List, Tuple
from PIL import Image

FORMAT = "png"
MEDIA_TYPE = "image/png"
BITS_PER_BYTE = 8
BYTES_COUNT = 8
ENCODING = "utf-8"


def encode_str(text: str) -> bytes:
    return text.encode(ENCODING)


def decode_str(data: bytes) -> str:
    return data.decode(ENCODING, errors="replace")


def get_bit(value: int, power_position: int) -> int:
    return 1 if (value & (1 << power_position)) else 0


def set_bit(value: int, power_position: int) -> int:
    return value | (1 << power_position)


def flip_bit(value: int, power_position: int) -> int:
    return value ^ (1 << power_position)


def byte_from_bits(bits: List[int]) -> int:
    number = 0
    for power_position in range(len(bits)):
        if bits[power_position]:
            number = set_bit(number, len(bits) - (power_position + 1))
    return number


def to_bits(text: str) -> List[int]:
    text_bytes = encode_str(text)
    bits: List[int] = []
    for byte in text_bytes:
        for position in reversed(range(BITS_PER_BYTE)):
            bits.append(get_bit(byte, position))
    return bits


def format_message(text: str, prefix: str = "~", suffix: str = "^") -> str:
    escaped = text.replace("\\", "\\\\").replace(suffix, f"\\{suffix}")
    return f"{prefix}{escaped}{suffix}"


def encode_message(image: Image.Image, message_bits: List[int], bits_per_pixel: int) -> int:
    pixels = image.load()
    total_changes = 0
    total_bits = len(message_bits)

    message_index = 0
    for i in range(image.width):
        for j in range(image.height):
            has_changes = False
            current_pixels = pixels[i, j]
            modified_pixels = []

            for pixel in current_pixels:
                pixel_temp = pixel
                for power_position in range(bits_per_pixel):
                    if message_index == total_bits:
                        break

                    bit_value = get_bit(pixel_temp, power_position)
                    if bit_value != message_bits[message_index]:
                        pixel_temp = flip_bit(pixel_temp, power_position)
                        total_changes += 1
                        has_changes = True

                    message_index += 1

                modified_pixels.append(pixel_temp)

            if has_changes:
                pixels[i, j] = tuple(modified_pixels)

            if message_index == total_bits:
                return total_changes

    return -1


def decode_message(image: Image.Image, bits_per_pixel: int, prefix: str = "~", suffix: str = "^") -> str:
    pixels = image.load()
    prefix_byte = ord(prefix[0]) if prefix else ord("~")
    suffix_byte = ord(suffix[0]) if suffix else ord("^")
    escape_byte = ord("\\")

    reached_prefix = False
    in_escape = False
    raw_bytes = bytearray()
    character_bits: List[int] = []

    for i in range(image.width):
        for j in range(image.height):
            current_pixels = pixels[i, j]
            for pixel in current_pixels:
                for power_position in range(bits_per_pixel):
                    bit_value = get_bit(pixel, power_position)
                    character_bits.append(bit_value)

                    if len(character_bits) == BITS_PER_BYTE:
                        byte_val = byte_from_bits(character_bits)

                        if not reached_prefix:
                            if byte_val == prefix_byte:
                                reached_prefix = True
                        else:
                            if in_escape:
                                raw_bytes.append(byte_val)
                                in_escape = False
                            elif byte_val == escape_byte:
                                in_escape = True
                            elif byte_val == suffix_byte:
                                return raw_bytes.decode(ENCODING, errors="replace")
                            else:
                                raw_bytes.append(byte_val)

                        character_bits.clear()

    return raw_bytes.decode(ENCODING, errors="replace") if reached_prefix else ""
