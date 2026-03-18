# Pulse Chat

Pulse Chat is a full-stack real-time chat application built with a Node.js backend and a Next.js frontend. It supports JWT authentication, MongoDB message persistence, Socket.io realtime messaging, typing indicators, user presence, read receipts, profile editing, and a responsive chat dashboard.

## Tech Stack

- Frontend: Next.js App Router, React, Axios, Socket.io Client, Tailwind CSS
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, bcryptjs, Socket.io

## Features

- User registration and login
- JWT-protected API routes
- Realtime one-to-one messaging
- Online/offline presence updates
- Typing indicators
- Message read receipts
- User search
- Editable user profile
- Responsive dashboard and mobile chat flow

## Project Structure

```text
chat-app/
├── backend/
├── frontend/
├── README.md
└── .gitignore
```

## Environment Variables

This repository includes example environment files:

- [frontend/.env.example](/Users/abrahamogbu/chat-app/frontend/.env.example)
- [backend/.env.example](/Users/abrahamogbu/chat-app/backend/.env.example)

Copy them before running the app:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

## Installation

Install dependencies in both apps:

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Running The App

Start the backend:

```bash
cd backend
npm run dev
```

Start the frontend:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5001`

## Backend API

Auth:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

Users:

- `GET /api/users`
- `GET /api/users/search?query=`
- `GET /api/users/:userId`
- `PUT /api/users/profile`

Messages:

- `POST /api/messages/send`
- `GET /api/messages/:userId`
- `PATCH /api/messages/read/:userId`

## Realtime Socket Events

- `user_online`
- `receive_message`
- `typing`
- `stop_typing`
- `messages_read`
- `user_presence`

## Notes

- Real environment files like `frontend/.env` and `backend/.env` are ignored by Git.
- Share only the `.env.example` files in public repositories.
