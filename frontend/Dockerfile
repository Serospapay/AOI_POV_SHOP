FROM node:20-alpine

WORKDIR /app

# Копіюємо файли залежностей
COPY package*.json ./

# Встановлюємо залежності
RUN npm ci

# Копіюємо код додатку
COPY . .

# Expose порт
EXPOSE 3000

# Запускаємо додаток
CMD ["npm", "run", "dev"]

