# Base image with Python
FROM python:3.12.3 AS base

# Set working directory
WORKDIR /app

# Install system dependencies required for Playwright
RUN apt-get update && apt-get install -y \
    libnss3 \
    libasound2 \
    libgbm-dev \
    supervisor \
    curl \
    wget \
    gnupg \
    unzip 

# Copy Python script and requirements file
COPY main.py requirements.txt ./

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install "setuptools<58.0.0" && \
    pip install -r requirements.txt

# Install playwright and then its dependencies (the browsers)
RUN pip install playwright && \
    playwright install

# Expose FastAPI port
EXPOSE 8000

# Run FastAPI application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
