# Movie Catalog

Интерактивное приложение для поиска фильмов и актёров с визуализацией связей между ними через интерактивный граф. Позволяет найти общие фильмы актёров
и находить обших актеров у фильмов
**Демо:** https://DmitryGavelya.github.io/mipt_second_course_frontend

---

## Как получить исходники

```bash
git clone https://github.com/DmitryGavelya/mipt_second_course_frontend.git
cd mipt_second_course_frontend-3
```

---

## Требования

- **Node.js** — версия 18+
- **npm** — версия 9+
- **TMDB API** — ключ для доступа к БД фильмов
- **Firebase** — облачная БД для отзывов

---

## Как запустить

### 1. Установка зависимостей

```bash
cd mipt_second_course_frontend-3
npm install
```

### 2. Переменные окружения

Создайте `.env` в корне проекта:

```bash
cp .env.example .env
```

Заполните значения:

```env
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
### 3. Запуск приложения

```bash
npm run dev
```

---

## Главный бизнес-кейс: Граф связей

1. Откройте приложение → перейдите в **"Граф связей"**
2. Введите имя актёра (например, "Leonardo DiCaprio")
3. Граф покажет его фильмы
4. Добавьте второго актёра (например, "Tom Hardy")
5. **Граф автоматически найдёт общие фильмы** (где они снимались вместе)
6. Кликните на фильм → откроется его страница с отзывами

Альтернативный способ: откройте любой фильм → нажмите кнопку **"🔗 Граф"** → граф сразу откроется со всеми актёрами этого фильма.

---

## Структура приложения

```
movie-catalog/
├── public/
│   ├── api/                   # TMDB API + Firebase CRUD
│   ├── components/            # React компоненты
│   │   ├── MovieCard/        # Карточка фильма
│   │   ├── GraphVisualization/  # Граф связей
│   │   └── SearchAutocomplete/  # Поиск
│   ├── pages/                 # Страницы
│   │   ├── HomePage.tsx
│   │   ├── MovieDetailsPage.tsx
│   │   ├── ActorDetailsPage.tsx
│   │   └── GraphPage.tsx      # Граф связей
│   ├── features/              # Redux (избранное, отзывы)
│   ├── types/                 # TypeScript типы
│   └── utils/                 # Утилиты
├── src/
│   ├── app/                   # Redux store
│   ├── routes.tsx             # React Router
│   └── index.tsx              # Точка входа
├── .env.example               # Пример переменных
├── vite.config.ts
├── package.json
└── tsconfig.json
```

## Стек технологий

- **React 18** + **TypeScript** — frontend
- **Redux Toolkit** — управление состоянием
- **React Router** — маршрутизация
- **Vite** — сборщик
- **TMDB API** — данные о фильмах
- **Firebase Firestore** — CRUD отзывов
- **react-force-graph-2d** — визуализация графа
- **Vitest** + **Playwright** — тестирование

