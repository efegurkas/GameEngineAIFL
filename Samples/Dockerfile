FROM python:3.9-slim

WORKDIR /app

RUN pip install "python-socketio[client]"

COPY test_bot.py .

ENTRYPOINT ["python","test_bot.py"]
