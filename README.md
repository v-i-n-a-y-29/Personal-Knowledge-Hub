# Personal Knowledge Hub

A full-stack app for saving and organizing useful resources such as articles, videos, and links.

## Stack

- Backend: FastAPI, MongoDB, JWT authentication
- Frontend: Next.js (App Router), TypeScript

## Backend setup

1. Create a virtual environment inside `backend`.
2. Install dependencies with `pip install -r requirements.txt`.
3. Copy `backend/.env.example` to `backend/.env` and update the values.
4. Start the API:

```bash
uvicorn app.main:app --reload
```

The backend runs at `http://localhost:8000`.

## Frontend setup

1. Copy `frontend/.env.local.example` to `frontend/.env.local`.
2. Install dependencies in `frontend`.
3. Start the Next.js app:

```bash
npm run dev
```

The frontend runs at `http://localhost:3000`.

## Features

- Email/password signup and login with JWT
- Resource CRUD
- Search by title
- Filter by tags
- MongoDB-backed persistence
- Loading and error states across auth and dashboard flows
