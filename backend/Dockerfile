FROM python:3.11-slim

WORKDIR /app

# Встановлюємо системні залежності
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Копіюємо файли залежностей
COPY requirements.txt .

# Встановлюємо Python залежності
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Створюємо директорію для логів
RUN mkdir -p logs

# Expose порт
EXPOSE 8000

# Запускаємо додаток (команда перевизначається в docker-compose.yml для development)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]

