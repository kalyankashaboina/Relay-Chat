# Relay Chat — Frontend

React + TypeScript + Redux Toolkit frontend for Relay Chat.

## Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite |
| State | Redux Toolkit + RTK Query |
| Realtime | Socket.IO client |
| UI | Tailwind CSS + shadcn/ui |
| Validation | Zod |
| Routing | React Router v6 |
| HTTP | Axios (cookie-based auth) |
| Monitoring | Sentry (optional) |

## Features

- **Chat** — single and group chat, typing indicators, read receipts
- **Media sharing** — images, video, audio, documents (25 MB)
- **Voice messages** — in-browser recording + waveform playback
- **Reactions** — emoji reactions on messages
- **Vanish mode** — timer-based disappearing messages
- **Scheduled messages** — create future messages
- **Message actions** — edit, delete, reply, forward, star, pin
- **Audio / video calls** — WebRTC via Socket.IO signalling
- **Profile** — avatar, bio, privacy, notification settings
- **Dark / light theme**
- **Offline queue** — sends queued messages when connection resumes

## Quick Start

```bash
cp .env.example .env
# Set VITE_API_BASE_URL to your backend URL

npm install
npm run dev
```

Dev: `http://localhost:5173`

## Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint (0 errors required) |
| `npm run format` | Prettier |
| `npm run type-check` | tsc --noEmit |
| `npm run preview` | Preview production build |

## Architecture

```
src/
├── components/
│   ├── common/      Avatar, EmptyState, LoadingSpinner, ErrorState
│   └── ui/          shadcn/ui primitives
├── config/          API URL, socket URL, constants (SOCKET_EVENTS, UPLOAD limits)
├── features/
│   ├── api/         RTK Query base API slice
│   ├── auth/        login, register, forgot password, authSlice, useAuth hook
│   ├── chat/
│   │   ├── components/  ChatLayout, ChatWindow, MessageBubble, MessageInput, ...
│   │   ├── services/    socketClient, chatApi, fileUpload, voiceRecorder, webRTC
│   │   ├── chatSlice.ts Redux slice (messages, conversations, presence)
│   │   ├── useChat.ts   Main chat hook
│   │   └── types.ts     All shared TypeScript types
│   ├── notifications/ Redux slice
│   ├── profile/     Profile screens
│   └── settings/    Theme, font, language, notification settings
├── pages/           Index, NotFound
├── shared/
│   ├── api/         Axios client (withCredentials)
│   ├── hooks/       useSocket, useInfiniteScroll, useDraft, useNotifications, ...
│   ├── lib/         chatUtils, i18n, utils
│   └── utils/       format, validation
└── store/           Redux store + uiSlice
```

## Cookie Auth

All API calls use `withCredentials: true`. The backend sets an `HttpOnly` cookie (`relay_token`) on login — no token storage in localStorage needed.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | Backend URL (e.g. `http://localhost:4000`) |
| `VITE_SOCKET_URL` | Socket URL (defaults to `VITE_API_BASE_URL`) |
| `VITE_SENTRY_DSN` | Optional — Sentry error tracking |
