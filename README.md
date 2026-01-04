# TRUST CrEATER — Telegram Stars Game MVP

Игровая экономика артистов и фанатов без блокчейна и фиата. Единственная валюта — Telegram Stars. TRUST (TAU) — очки влияния, которые можно только распределять между артистами.

## Архитектура
```
/apps
  /api       NestJS + Prisma (PostgreSQL)
  /bot       Telegraf bot
  /webapp    React + Vite mini-app
/infra       docker-compose
/packages
  /shared    Общие типы
```

## Экономика (MVP)
- Вход: 250 Stars → 30 дней TRUST Access + 250 TAU на распределение.
- TAU нельзя купить или передать фанату, только распределить между артистами.
- В конце периода нераспределённые TAU сгорают; для продления нужен новый платеж.
- Trust метрики артиста: `trust_score` (сумма TAU), `trust_velocity` (сравнение с 7 дней назад), `trust_rank` (чарт), `reward_weight = trust_score * velocity_multiplier`.
- Ежемесячный пул Stars = 100% входящих платежей фанатов, распределение пропорционально `reward_weight`.

## Подготовка окружения
1. Установите Node.js >= 20 и npm.
2. Создайте файл `.env` в корне или экспортируйте переменные:
```
DATABASE_URL=postgresql://trust:trust@localhost:5432/trust
API_PORT=3001
BOT_TOKEN=your-bot-token
API_BASE=http://localhost:3001
VITE_API_BASE=http://localhost:3001
```

## Локальный запуск (без Docker)
```
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
npm run dev:api
# в другом терминале
npm run dev:webapp
# в третьем
npm run dev:bot
```
- API доступно на `http://localhost:3001`
- Mini App (web) на `http://localhost:4173`
- Bot использует mock платежи Stars через команду `/onboard`

## Docker Compose
```
cd infra
docker-compose up --build
```
Сервисы: PostgreSQL, Redis (на будущее), API, Bot, Webapp.

## Seed-данные
Скрипт `apps/api/prisma/seed.ts` создаёт:
- 5 артистов (Artist 1..5)
- 10 фанатов с активным TRUST на 30 дней
- Платёж по 250 Stars на месяц `2024-06`
- Предварительное распределение TAU: 100 / 40 / 30 / 50 / 30

## API эндпоинты (MVP)
- `POST /users/onboard` — оплачивает 250 Stars (mock) и выдаёт 250 TAU.
- `GET /artists/chart` — дневной чарт артистов с velocity.
- `POST /trust/allocate` — перераспределение 250 TAU между артистами (лимит 5 перераспределений/день).
- `GET /trust/summary/:tgId` — состояние TRUST для фаната.

## Bot команды
- `/start` — приветствие
- `/trust` — ссылка на мини-апп
- `/verify` — stub верификации артиста
- `/onboard` — mock-оплата 250 Stars и выдача TAU

## Mini App
React + Vite страница с:
- Чартом артистов (Trust Score, Velocity, Rank)
- Слайдерами распределения TAU (валидируется сумма 250)
- Блоком «Мой TRUST» с датой истечения и остатком TAU

## Stars (stub)
Платёж через Telegram Stars пока заглушен: `/users/onboard` и `/onboard` в боте просто создают запись StarPayment со статусом `PAID`. Интеграцию с Telegram Payments можно заменить в `users.service.ts`.

## Антифрод в MVP
- Лимит 5 перераспределений в сутки на пользователя
- TRUST нельзя купить/продать, только перераспределять
