# Steganographer

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?style=for-the-badge&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Material-UI](https://img.shields.io/badge/Material--UI-v7-007FFF?style=for-the-badge&logo=mui&logoColor=white)
![Tests](https://img.shields.io/badge/Tests-8%20Passed-4CAF50?style=for-the-badge&logo=pytest&logoColor=white)

**A secure, modern full-stack image steganography platform.**  
Conceal confidential messages inside digital images using Least Significant Bit (LSB) embedding, hardened with optional AES-128 cryptographic encryption (Fernet & PBKDF2).

</div>

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [How It Works](#how-it-works)
  - [LSB Steganography](#lsb-steganography)
  - [Cryptographic Protection](#cryptographic-protection)
- [Project Architecture](#project-architecture)
- [Quick Start](#quick-start)
- [Manual Setup (Alternative)](#manual-setup-alternative)
  - [Backend Setup (`server/`)](#backend-setup-server)
  - [Frontend Setup (`client/`)](#frontend-setup-client)
- [API Reference](#api-reference)
- [Testing](#testing)
- [Security Best Practices](#security-best-practices)

---

## Overview

Steganography is the practice of concealing secret information within everyday, ordinary carrier files. Unlike encryption alone (which signals the presence of classified communication to any observer), steganography conceals the **very existence** of the transmitted message.

**Steganographer** allows you to seamlessly embed arbitrary UTF-8 text messages into images with zero noticeable alteration to human vision, paired with optional symmetric AES-128 encryption for defense-in-depth protection.

---

## Key Features

- **Inconspicuous Image Concealment**: Embed text messages directly into standard image formats (PNG, JPEG, WebP, etc.).
- **Automatic Boundary Detection**: Delimiter framing with escape sequences extracts arbitrary text without truncating payloads.
- **Hardware-Grade Cryptographic Encryption**: Optional password protection utilizing Fernet (AES-128 in CBC mode) with PBKDF2 HMAC-SHA256 key derivation (100,000 iterations).
- **Adjustable Density**: Configure 1 to 8 bits per channel to balance payload storage volume against image fidelity.
- **Pre-Flight Capacity Verification**: Real-time validation guarantees that payload bit size never exceeds carrier dimensions.
- **Lossless Carrier Generation**: Outputs pure PNG format with normalized RGB channels to prevent lossy compression corruption.
- **Single-Command Orchestration**: Launch both the FastAPI backend and Next.js frontend concurrently with `npm run dev`.
- **Modern Responsive UI**: Clean interface built with Next.js 16 (Turbopack), React 19, and Material-UI v7.
- **Automated Test Coverage**: 100% automated test suite validating roundtrip encoding/decoding, UTF-8 multibyte characters, and path-traversal security.

---

## How It Works

### LSB Steganography

The Least Significant Bit (LSB) technique replaces the lowest bits of image pixel color channels (Red, Green, Blue) with the binary bits of your message. Because flipping the least significant bit modifies color channel intensity by at most $1/255 \approx 0.39\%$, the changes are completely imperceptible to the human eye.

1. **Delimiter Framing**: The payload is wrapped with framing delimiters (`~` prefix and `^` suffix) with internal escape handling (`\\`).
2. **Bitstream Conversion**: The framed UTF-8 string is converted into a binary bitstream.
3. **Channel Embedding**: The bitstream is written sequentially across color channels according to the chosen bits-per-pixel density.
4. **Lossless Output**: The modified pixel grid is saved as a lossless PNG image.

### Cryptographic Protection

When an optional passphrase is provided:
1. A cryptographically secure 16-byte random salt is generated via `secrets.token_bytes(16)`.
2. An encryption key is derived using **PBKDF2 HMAC-SHA256** with **100,000 iterations**.
3. The message is encrypted via **Fernet** (AES-128-CBC with PKCS7 padding and HMAC-SHA256 authentication).
4. The salt and ciphertext are concatenated and embedded into the carrier image. Without the exact passphrase, extraction yields indecipherable ciphertext.

---

## Project Architecture

```
steganographer/
├── server/                        # Python FastAPI Backend
│   ├── _data/                     # Runtime upload storage (preserved via .gitkeep)
│   ├── app/
│   │   ├── api/
│   │   │   └── routes.py          # REST API endpoints (/upload, /file, /encode, /decode)
│   │   ├── core/
│   │   │   ├── codec.py           # Pure LSB bit manipulation & delimiter framing
│   │   │   ├── security.py        # Cryptographic key derivation (PBKDF2) & Fernet AES-128
│   │   │   └── config.py          # Application configuration & environment settings
│   │   ├── schemas/
│   │   │   └── payload.py         # Pydantic validation schemas
│   │   ├── services/
│   │   │   └── storage.py         # Secure file management & path traversal prevention
│   │   └── main.py                # FastAPI application factory & CORS configuration
│   ├── tests/
│   │   └── test_pipeline.py       # Comprehensive unit test suite
│   ├── run.py                     # Development server runner (with auto-venv detection)
│   ├── test.py                    # Test runner (with auto-venv detection)
│   ├── requirements.txt           # Python backend dependencies
│   ├── package.json               # Server workspace npm scripts
│   ├── .env.example               # Environment variables template
│   └── .env                       # Local server configuration
├── client/                        # Next.js / React Frontend
│   ├── src/
│   │   ├── components/            # UI components (forms, layout, custom inputs, SVG icons)
│   │   ├── hooks/                 # React custom hooks (useAsyncOperation, usePreviousState)
│   │   ├── lib/                   # API client & encoder service
│   │   ├── pages/                 # Next.js pages (Home, Encode, Decode, 404, _app)
│   │   ├── styles/                # MUI theme and global CSS
│   │   └── types/                 # TypeScript type definitions
│   ├── public/                    # Static assets & sample demo images
│   ├── package.json               # Frontend dependencies & scripts
│   ├── tsconfig.json              # TypeScript configuration with @/* path aliases
│   └── next.config.mjs            # Next.js configuration & API reverse proxy
├── sample/                        # Curated sample carrier images for testing
├── .gitignore                     # Production Git ignore rules
├── package.json                   # Root workspace orchestrator
└── README.md                      # Project documentation
```

---

## Quick Start

### Prerequisites

- **Node.js**: v20 or higher
- **Python**: v3.10 or higher *(on Debian/Ubuntu: `sudo apt install python3-venv python3-pip`)*

### Step 1: Install Dependencies

Open your terminal in the project root directory and run:

```bash
npm run install:all
```

This installs all frontend packages and automatically provisions the backend Python virtual environment with all required dependencies.

### Step 2: Start the App

Start both the backend API and frontend client with a single command:

```bash
npm run dev
```

Once both development servers have initialized, a clean status summary will print at the end of the terminal output displaying your active Local and Network endpoints:

```text
  ┌────────────────────────────────────────────────────────────────┐
  │                                                                │
  │   Steganographer                                               │
  │   Secure Image Steganography & Cryptography Platform           │
  │                                                                │
  ├────────────────────────────────────────────────────────────────┤
  │                                                                │
  │   Local:    http://localhost:3000                              │
  │   Network:  http://172.20.10.4:3000                            │
  │                                                                │
  │   API:      http://localhost:8000                              │
  │   API Docs: http://localhost:8000/docs                         │
  │                                                                │
  ├────────────────────────────────────────────────────────────────┤
  │                                                                │
  │   Ready for secure steganography. Press Ctrl+C to stop.        │
  │                                                                │
  └────────────────────────────────────────────────────────────────┘
```

- **Frontend Application**: `http://localhost:3000` (and local network address if connected)
- **Backend API**: `http://localhost:8000`
- **Interactive OpenAPI Documentation**: `http://localhost:8000/docs`

### Available Workspace Commands

| Command | Action |
|---|---|
| `npm run install:all` | Install frontend dependencies and provision backend Python virtual environment |
| `npm run dev` | Run both FastAPI backend and Next.js frontend concurrently with clean shutdown (`Ctrl+C`) |
| `npm run dev:server` | Run only the backend FastAPI server |
| `npm run dev:client` | Run only the frontend Next.js application |
| `npm test` | Run backend automated unit tests |
| `npm run lint` | Run ESLint code analysis across frontend |
| `npm run build` | Produce optimized Next.js production build |

---

## Manual Setup (Alternative)

If you prefer running services in separate terminal windows:

### Backend Setup (`server/`)

1. Navigate to the `server` directory:
   ```bash
   cd server
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # Windows (PowerShell)
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1

   # Linux / macOS
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the server:
   ```bash
   python run.py
   ```

### Frontend Setup (`client/`)

1. Navigate to the `client` directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

---

## API Reference

The backend provides a clean, fully typed REST API with interactive Swagger documentation at `http://localhost:8000/docs`:

| Method | Endpoint | Description | Request Body | Response |
|---|---|---|---|---|
| `POST` | `/upload` | Upload a carrier image | `multipart/form-data` (`file`) | `{"id": "uuid"}` |
| `GET` | `/file/{file_id}` | Retrieve uploaded or encoded image | None | Binary image (`image/png`) |
| `POST` | `/encode` | Embed a message into an image | `EncodeRequest` JSON | `{"id": "uuid", "changes": 128}` |
| `POST` | `/decode` | Extract a hidden message from an image | `DecodeRequest` JSON | `{"message": "Secret..."}` |

### Encode Payload Example

```json
{
  "image_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "message": "Top secret intelligence report.",
  "config": {
    "bits_per_pixel": 1,
    "secret": {
      "key": "OptionalPassword123"
    }
  }
}
```

---

## Testing

Run the automated test suite directly from root:

```bash
npm test
```

Or from the `server` directory:
```bash
python -m unittest discover -s tests -p "test_*.py" -v
```

### Test Suite Coverage:
- `test_codec_encoding`: String binary encoding and decoding fidelity.
- `test_encode_and_decode_roundtrip_ascii`: ASCII message embedding and extraction.
- `test_encode_and_decode_utf8_multibyte`: Full support for Unicode, foreign alphabets, and emojis.
- `test_encode_and_decode_with_delimiter_characters`: Proper escaping of delimiter control characters (`~`, `^`, `\`).
- `test_encryption_roundtrip`: PBKDF2 + Fernet AES-128 encryption and decryption verification.
- `test_encryption_invalid_password`: Rejection of decryption attempts with incorrect passwords.
- `test_flowers_encoded_demo_image`: Verification of pre-bundled demo image decoding.
- `test_path_traversal_prevention`: File security and directory boundary validation.

---

## Security Best Practices

1. **Always Use Encryption for Sensitive Data**: Steganography alone hides the existence of data, but does not provide cryptanalysis protection if an attacker suspects hidden content. Always set a strong passphrase to encrypt your payloads.
2. **Preserve Lossless Formats**: Always save, transmit, and download carrier images as **PNG**. Transferring images through lossy social media services or compressing them as JPEG will destroy the least significant bit values and corrupt your secret data.
3. **Environment Security**: The `.env` file containing configuration parameters is git-ignored by default. Use `.env.example` as a template for custom deployments.
