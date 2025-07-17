FROM python:3.10-slim

# System dependencies
RUN apt-get update && apt-get install -y \
    gcc g++ nodejs openjdk-17-jdk curl time \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# FastAPI and runner dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the app
COPY app /app
WORKDIR /app

EXPOSE 8080
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
