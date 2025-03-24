FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application
COPY . .

# Create uploads directory
RUN mkdir -p /app/uploads && chmod 777 /app/uploads

# Set environment variables
ENV PORT=8000

# Fix: Use shell form of CMD to ensure environment variable substitution
CMD uvicorn main:app --host 0.0.0.0 --port $PORT