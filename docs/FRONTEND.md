# AI Caption Generator Frontend

React + Vite + Tailwind client for the Day-136 backend.

## Setup

1. Copy env file:

```
cp .env.local.example .env.local
```

2. Install deps:

```
npm install
```

3. Run dev server:

```
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:3000

Ensure backend has CORS configured and is running first.

## Available Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run preview` - preview build

## Auth Flow

- Register/Login sets httpOnly cookie.
- `/api/auth/user` used to hydrate session.
- ProtectedRoute guards private pages.

## Create Post Workflow

1. Select image
2. Submit -> upload to backend
3. Backend generates caption + uploads image
4. Response displays caption + hosted image URL

## Future Enhancements

- Implement posts feed (GET /api/posts)
- Add logout endpoint to clear cookie
- Add toasts & error boundary
- Dark mode toggle
