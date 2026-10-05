import os
import sys
import subprocess
import unittest
from pathlib import Path

server_dir = Path(__file__).resolve().parent

def get_venv_paths():
    local_venv = server_dir / ".venv"
    if os.pathsep in str(local_venv):
        fallback_dir = Path.home() / ".steganographer" / "venv"
        py = fallback_dir / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
        return fallback_dir, py
    py = local_venv / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
    return local_venv, py

venv_dir, venv_python = get_venv_paths()

# Verify virtual environment exists before running
if not venv_python.exists():
    print(f"Error: Python virtual environment not found in {venv_dir}.")
    print("Please run 'npm run install:all' from the project root directory first.")
    sys.exit(1)

def is_in_project_venv(target_venv_dir: Path) -> bool:
    if sys.prefix == getattr(sys, "base_prefix", sys.prefix):
        return False
    try:
        return Path(sys.prefix).resolve() == target_venv_dir.resolve()
    except Exception:
        return False

# If project venv is not currently running, delegate cleanly via subprocess
if not is_in_project_venv(venv_dir):
    sys.exit(subprocess.call([str(venv_python), __file__] + sys.argv[1:]))

if __name__ == "__main__":
    loader = unittest.TestLoader()
    suite = loader.discover(start_dir=str(server_dir / "tests"), pattern="test_*.py")
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)
