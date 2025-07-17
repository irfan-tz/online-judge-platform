from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import subprocess
import tempfile
import os
import time
import resource
import psutil
import threading

app = FastAPI()


class CodeRequest(BaseModel):
    language: str
    code: str
    input: str = ""


# Memory limits per language (in bytes)
MEMORY_LIMITS = {
    "python": 128 * 1024 * 1024,  # 128MB
    "javascript": 128 * 1024 * 1024,  # 128MB
    "c": 64 * 1024 * 1024,  # 64MB
    "cpp": 64 * 1024 * 1024,  # 64MB
    "java": 256 * 1024 * 1024,  # 256MB (JVM overhead)
}

# Time limits per language (in seconds)
TIME_LIMITS = {
    "python": 5,
    "javascript": 5,
    "c": 5,
    "cpp": 5,
    "java": 10,  # Java needs more time for JVM startup
}


def set_resource_limits(language):
    """Set memory and CPU time limits for the process"""
    def limit_resources():
        memory_limit = MEMORY_LIMITS.get(language.lower(), 128 * 1024 * 1024)
        resource.setrlimit(resource.RLIMIT_AS, (memory_limit, memory_limit))

        time_limit = TIME_LIMITS.get(language.lower(), 5)
        resource.setrlimit(resource.RLIMIT_CPU, (time_limit, time_limit))

        resource.setrlimit(resource.RLIMIT_CORE, (0, 0))
        resource.setrlimit(resource.RLIMIT_NPROC, (50, 50))
    return limit_resources


def monitor_memory_usage(pid, memory_stats):
    """Monitor memory usage of a process and track peak usage"""
    try:
        process = psutil.Process(pid)
        max_memory = process.memory_info().rss

        while process.is_running():
            try:
                current_memory = process.memory_info().rss
                if current_memory > max_memory:
                    max_memory = current_memory
                time.sleep(0.01)
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                break
        
        # In this simplified model, peak RSS is a good enough proxy
        memory_stats['peak_memory_bytes'] = max_memory

    except Exception:
        memory_stats['peak_memory_bytes'] = 0


@app.post("/run")
def run_code(payload: CodeRequest):
    lang = payload.language.lower()
    code = payload.code
    input_data = payload.input

    file_ext_map = {
        "python": ".py",
        "javascript": ".js",
        "c": ".c",
        "cpp": ".cpp",
        "java": ".java",
    }

    # Simplified commands, now including Python in the standard flow
    commands = {
        "python": lambda f: ["python3", f],
        "javascript": lambda f: ["node", f],
        "c": lambda f: ["sh", "-c", f"gcc {f} -o /tmp/a.out && /tmp/a.out"],
        "cpp": lambda f: ["sh", "-c", f"g++ {f} -o /tmp/a.out && /tmp/a.out"],
        "java": lambda f: ["sh", "-c", f"javac {f} && java -cp {os.path.dirname(f)} Main"],
    }

    if lang not in file_ext_map:
        raise HTTPException(status_code=400, detail="Unsupported language")
    
    if not code.strip():
        raise HTTPException(status_code=400, detail="Code cannot be empty")
    if len(code) > 50000:
        raise HTTPException(status_code=400, detail="Code too large")

    with tempfile.TemporaryDirectory() as tempdir:
        file_ext = file_ext_map[lang]
        
        # For Java, the file name must match the public class name
        source_file_name = "Main" + file_ext if lang == "java" else "main" + file_ext
        source_file = os.path.join(tempdir, source_file_name)

        try:
            with open(source_file, "w") as f:
                f.write(code)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to write code file: {str(e)}")

        start_time = time.time()
        timeout = TIME_LIMITS.get(lang, 5) + 2  # Add buffer

        try:
            proc = subprocess.Popen(
                commands[lang](source_file),
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                cwd=tempdir,
                preexec_fn=set_resource_limits(lang),
            )

            memory_stats = {}
            monitor_thread = threading.Thread(target=monitor_memory_usage, args=(proc.pid, memory_stats))
            monitor_thread.start()

            stdout, stderr = proc.communicate(input=input_data, timeout=timeout)
            
            monitor_thread.join(timeout=1)
            end_time = time.time()

            execution_time = round(end_time - start_time, 4)
            memory_kb = memory_stats.get('peak_memory_bytes', 0) // 1024

            status = "pass" if proc.returncode == 0 and not stderr else "fail"
            
            response = {
                "status": status,
                "output": stdout.strip(),
                "execution_time": execution_time,
                "memory_usage": memory_kb,
                "return_code": proc.returncode,
            }

            if stderr.strip():
                response["error_message"] = stderr.strip()
            elif proc.returncode != 0:
                response["error_message"] = f"Process exited with non-zero code {proc.returncode}"

            return response

        except subprocess.TimeoutExpired:
            proc.kill()
            proc.wait()
            return {"status": "fail", "error_message": "Time Limit Exceeded", "execution_time": timeout, "memory_usage": 0}
        except Exception as e:
            return {"status": "fail", "error_message": f"An unexpected execution error occurred: {str(e)}", "execution_time": 0, "memory_usage": 0}


@app.get("/")
def root():
    return {"message": "Code execution API is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": time.time()}