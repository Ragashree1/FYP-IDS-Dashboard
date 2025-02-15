# backend/Dockerfile

# Use an official Python runtime as a parent image
FROM python:3
# Set work directory
WORKDIR /app
COPY . /app

COPY .env.example .env

RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 80
# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0","--reload", "--port", "8001"]