# Use the official Python image with Python 3.12
FROM python:3.12-slim

# Set the working directory in the Docker image
WORKDIR /backend

# Install supervisord to manage multiple processes
RUN apt-get update && apt-get install -y supervisor && rm -rf /var/lib/apt/lists/*

# First, copy only the requirements file
COPY requirements.txt /backend/

# Install the Python dependencies from requirements.txt
RUN pip install -r requirements.txt

# Copy the rest of the application from the local project directory to the Docker image
COPY . /backend


# Copy the supervisord configuration file
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose the port the app runs on
EXPOSE 8080

# Command to run supervisord
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
