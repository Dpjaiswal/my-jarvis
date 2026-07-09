FROM python:3.11-slim

WORKDIR /app

# Install build dependencies for Chroma/sentence-transformers
RUN apt-get update && apt-get install -y build-essential curl && rm -rf /var/lib/apt/lists/*

COPY apps/api/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY apps/api ./apps/api
COPY packages ./packages

EXPOSE 8000

CMD ["uvicorn", "main:app", "--app-dir", "apps/api", "--host", "0.0.0.0", "--port", "8000"]
