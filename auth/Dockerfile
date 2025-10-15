FROM python:3.11-slim

WORKDIR /app

# Install build dependencies required for some Python packages (asyncpg, cryptography, bcrypt, etc.)
RUN apt-get update && \
	apt-get install -y --no-install-recommends gcc build-essential libpq-dev python3-dev && \
	rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ./app /app/app

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
