# PowerCore - Інтернет-магазин пристроїв резервного живлення

## Технічний стек

- **Backend:** Python 3.11 + FastAPI
- **Database:** MongoDB 7.0
- **Frontend:** Next.js 14+ (App Router)
- **Deployment:** Docker Compose

## Швидкий старт

### Запуск проекту

```bash
# Запуск всіх сервісів
docker compose up -d --build

# Перегляд логів
docker compose logs -f

# Зупинка
docker compose down
```

### Очищення Docker ресурсів

**Важливо:** Docker може займати багато місця через build cache та старі образи.

```bash
# Автоматичне очищення (Windows)
cleanup-docker.bat

# Або вручну:
docker system prune -a --volumes --force

# Тільки build cache (швидше, безпечніше)
docker builder prune -a -f
```

**Що очищається:**
- Невикористовувані образи (стані з інших проектів)
- Build cache (20+ GB) - найбільший "пожирач" місця
- Старі volumes
- Зупинені контейнери

**Рекомендації:**
- Запускайте `cleanup-docker.bat` раз на тиждень або коли закінчується місце
- Після кожного білду можна очистити тільки cache: `docker builder prune -f`
- Перевірте статистику: `docker system df`

## Структура проекту

```
.
├── backend/          # FastAPI backend
├── frontend/         # Next.js frontend
├── docker-compose.yml
└── cleanup-docker.bat  # Скрипт очищення Docker
```

## API Endpoints

- Backend: http://localhost:8000
- Frontend: http://localhost:3000
- API Docs: http://localhost:8000/docs

## Розробка

### Backend

```bash
cd backend
# Встановлення залежностей
pip install -r requirements.txt

# Запуск локально
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
# Встановлення залежностей
npm install

# Запуск локально
npm run dev
```

## База даних

MongoDB доступна на `localhost:27017`

Для заповнення тестовими даними:
```bash
docker compose exec backend python seed_products.py
```

## Docker оптимізація

Проект використовує `.dockerignore` файли для зменшення розміру образів:
- Виключаються `node_modules`, `.next`, `__pycache__`
- Не копіюються логи, тести, документація
- Використовується multi-stage build де можливо

## Troubleshooting

### Проблеми з місцем на диску

1. Запустіть `cleanup-docker.bat`
2. Перевірте статистику: `docker system df`
3. Очистіть build cache: `docker builder prune -a -f`

### Проблеми з білдом

1. Перебудовуйте без cache: `docker compose build --no-cache`
2. Перевірте `.dockerignore` файли
3. Перегляньте логи: `docker compose logs backend` або `docker compose logs frontend`
