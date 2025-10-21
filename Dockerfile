# ==============================
# Single Dockerfile for frontend + backend
# ==============================
# Stage 1: Build frontend
FROM node:20-alpine AS frontend-build

# Set working directory
WORKDIR /app/frontend

# Copy frontend package.json and lockfile
COPY frontend/package*.json ./

# Install frontend dependencies
RUN npm install

# Copy frontend source
COPY frontend/ ./

# Build frontend
RUN npm run build

# Stage 2: Backend + combined image
FROM python:3.12-slim

# Set working directory
WORKDIR /app

# Install OS dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source
COPY backend/ ./backend

# Copy frontend build from previous stage
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Expose port for Flask + Socket.IO
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=backend.app
ENV FLASK_RUN_HOST=0.0.0.0
ENV FLASK_ENV=production

# Create instance folder for SQLite
RUN mkdir -p ./backend/instance

# Command to run the backend (and frontend static served via Flask)
CMD ["python", "-u", "backend/app.py"]
