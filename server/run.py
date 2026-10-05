import os
import sys
import subprocess
from pathlib import Path

server_dir = Path(__file__).resolve().parent

def get_venv_paths():
    local_venv = server_dir / ".venv"
    # If the project path contains the OS PATH separator (';' on Windows),
    # Python's venv module refuses to create an environment in it to avoid PATH corruption.
    # In that scenario, fall back to a safe dedicated directory in the user profile.
    if os.pathsep in str(local_venv):
        fallback_dir = Path.home() / ".steganographer" / "venv"
        py = fallback_dir / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
        return fallback_dir, py, True
    py = local_venv / ("Scripts/python.exe" if os.name == "nt" else "bin/python")
    return local_venv, py, False

venv_dir, venv_python, is_fallback = get_venv_paths()

# Dedicated setup handler for 'npm run install:all' or manual setup
if "--setup" in sys.argv:
    if is_fallback:
        print(f"Notice: Parent directory path contains '{os.pathsep}' (PATH delimiter).")
        print(f"Creating virtual environment in safe directory: {venv_dir}")
    else:
        print("Setting up Python virtual environment and installing backend dependencies...")
    venv_dir.parent.mkdir(parents=True, exist_ok=True)
    try:
        subprocess.check_call([sys.executable, "-m", "venv", str(venv_dir)])
    except subprocess.CalledProcessError:
        print("\nFailed to create Python virtual environment.")
        if os.name != "nt":
            print("On Debian/Ubuntu systems, the python3-venv package may be missing:")
            print("    sudo apt update && sudo apt install python3-venv python3-pip\n")
        sys.exit(1)

    try:
        subprocess.check_call([str(venv_python), "-m", "pip", "install", "-r", str(server_dir / "requirements.txt")])
    except subprocess.CalledProcessError as e:
        print(f"\nFailed to install dependencies from requirements.txt: {e}")
        sys.exit(1)
    print("Backend environment setup complete.")
    sys.exit(0)

# Verify virtual environment exists before running
if not venv_python.exists():
    print(f"Error: Python virtual environment not found in {venv_dir}.")
    print("Please run 'npm run install:all' from the project root directory first.")
    sys.exit(1)

def setup_process_lifecycle():
    """Ensures all child processes (Uvicorn reloader/workers) terminate when parent exits."""
    if os.name != "nt":
        return
    try:
        import ctypes
        from ctypes import wintypes

        kernel32 = ctypes.WinDLL("kernel32", use_last_error=True)
        kernel32.CreateJobObjectW.restype = wintypes.HANDLE
        kernel32.GetCurrentProcess.restype = wintypes.HANDLE
        kernel32.AssignProcessToJobObject.argtypes = [wintypes.HANDLE, wintypes.HANDLE]
        kernel32.AssignProcessToJobObject.restype = wintypes.BOOL
        kernel32.SetInformationJobObject.argtypes = [wintypes.HANDLE, ctypes.c_int, ctypes.c_void_p, wintypes.DWORD]
        kernel32.SetInformationJobObject.restype = wintypes.BOOL

        job = kernel32.CreateJobObjectW(None, None)
        if not job:
            return

        class JOBOBJECT_BASIC_LIMIT_INFORMATION(ctypes.Structure):
            _fields_ = [
                ("PerProcessUserTimeLimit", wintypes.LARGE_INTEGER),
                ("PerJobUserTimeLimit", wintypes.LARGE_INTEGER),
                ("LimitFlags", wintypes.DWORD),
                ("MinimumWorkingSetSize", ctypes.c_size_t),
                ("MaximumWorkingSetSize", ctypes.c_size_t),
                ("ActiveProcessLimit", wintypes.DWORD),
                ("Affinity", ctypes.c_size_t),
                ("PriorityClass", wintypes.DWORD),
                ("SchedulingClass", wintypes.DWORD),
            ]

        class IO_COUNTERS(ctypes.Structure):
            _fields_ = [
                ("ReadOperationCount", ctypes.c_ulonglong),
                ("WriteOperationCount", ctypes.c_ulonglong),
                ("OtherOperationCount", ctypes.c_ulonglong),
                ("ReadTransferCount", ctypes.c_ulonglong),
                ("WriteTransferCount", ctypes.c_ulonglong),
                ("OtherTransferCount", ctypes.c_ulonglong),
            ]

        class JOBOBJECT_EXTENDED_LIMIT_INFORMATION(ctypes.Structure):
            _fields_ = [
                ("BasicLimitInformation", JOBOBJECT_BASIC_LIMIT_INFORMATION),
                ("IoInfo", IO_COUNTERS),
                ("ProcessMemoryLimit", ctypes.c_size_t),
                ("JobMemoryLimit", ctypes.c_size_t),
                ("PeakProcessMemoryLimit", ctypes.c_size_t),
                ("PeakJobMemoryLimit", ctypes.c_size_t),
            ]

        info = JOBOBJECT_EXTENDED_LIMIT_INFORMATION()
        info.BasicLimitInformation.LimitFlags = 0x2000  # JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE

        if kernel32.SetInformationJobObject(
            job,
            9,  # JobObjectExtendedLimitInformation
            ctypes.byref(info),
            ctypes.sizeof(info),
        ):
            kernel32.AssignProcessToJobObject(job, kernel32.GetCurrentProcess())
    except Exception:
        pass

import socket
import atexit

def is_port_free(port: int = 8000) -> bool:
    """Checks whether the specified local port is currently available."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            return s.connect_ex(("127.0.0.1", port)) != 0
    except Exception:
        return True

def ensure_port_available(port: int = 8000):
    """Ensures port 8000 is immediately released if held by a stale process."""
    if is_port_free(port):
        return
    if os.name == "nt":
        try:
            subprocess.run(
                ["powershell", "-NoProfile", "-Command", f"Get-NetTCPConnection -LocalPort {port} -ErrorAction SilentlyContinue | ForEach-Object {{ Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }}"],
                capture_output=True,
                timeout=5,
            )
        except Exception:
            pass
    else:
        try:
            subprocess.run(f"fuser -k {port}/tcp 2>/dev/null || lsof -ti :{port} | xargs kill -9 2>/dev/null", shell=True, timeout=5)
        except Exception:
            pass

def is_in_project_venv(target_venv_dir: Path) -> bool:
    """Checks if the current Python interpreter belongs to the project virtual environment."""
    if sys.prefix == getattr(sys, "base_prefix", sys.prefix):
        return False
    try:
        return Path(sys.prefix).resolve() == target_venv_dir.resolve()
    except Exception:
        return False

if __name__ == "__main__":
    setup_process_lifecycle()
    ensure_port_available(8000)

    # If project venv is not currently running, delegate cleanly via subprocess with guaranteed tree cleanup
    if not is_in_project_venv(venv_dir):
        popen_kwargs = {}
        if os.name != "nt":
            import signal
            popen_kwargs["preexec_fn"] = os.setsid

        proc = subprocess.Popen([str(venv_python), __file__] + sys.argv[1:], **popen_kwargs)

        def kill_child():
            if proc.poll() is None:
                if os.name == "nt":
                    subprocess.call(f"taskkill /F /PID {proc.pid} /T", shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                else:
                    try:
                        import signal
                        os.killpg(os.getpgid(proc.pid), signal.SIGTERM)
                    except Exception:
                        proc.kill()

        atexit.register(kill_child)
        try:
            sys.exit(proc.wait())
        except (KeyboardInterrupt, SystemExit):
            kill_child()
            sys.exit(0)

    import uvicorn

    reload_mode = "--reload" in sys.argv
    try:
        uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=reload_mode)
    except (KeyboardInterrupt, SystemExit):
        pass
    finally:
        ensure_port_available(8000)


