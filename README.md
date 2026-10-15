# Nature Explorer

Приложение для изучения природы рядом с домом. Пользователь ходит по парку, находит на карте природные объекты (деревья и т. п.), отмечает их, проходит квесты и получает достижения. Для организаторов есть админ-панель.

Мобильное и веб-приложение на **Expo 57 / React Native 0.86** с **expo-router**.

## Возможности

- **Карта** — объекты на Google Maps, геолокация, отметка объекта, когда пользователь рядом с ним (есть симуляция позиции для разработки).
- **Квесты** — наборы объектов, которые нужно найти.
- **Достижения** — награды за прогресс.
- **Профиль** и **дашборд**.
- **Вход** и приглашение в группу по ссылке `/join/[code]`.
- **Админ-панель** (`/admin`): объекты, квесты, пользователи.

## Структура

```
app/              экраны (expo-router)
  (app)/          основное приложение: map, quests, achievements, profile, dashboard
  admin/          админ-панель
  join/[code].tsx вступление в группу
  login.tsx       вход
src/
  components/     MapView, MapPicker, ObjectCard
  context/        AuthContext
  services/       интерфейсы и выбор реализации бэкенда
  mocks/          мок-реализации auth, БД, storage и realtime
  hooks/, utils/, types/, theme.ts
```

## Запуск

```bash
npm install
cp .env.example .env.local   # заполнить ключи
npm run web                  # веб на http://localhost:8081
npm start                    # Expo Go / эмуляторы
```

### Переменные окружения

| Переменная | Назначение |
|---|---|
| `EXPO_PUBLIC_USE_MOCKS` | `true` — работать на мок-данных без бэкенда |
| `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` | ключ Google Maps |
| `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY` | бэкенд Supabase |
| `VERCEL_TOKEN` | деплой веб-версии |

## Деплой

Веб-версия собирается командой `npm run build:web` в `dist/` и деплоится на Vercel (см. `vercel.json`).
