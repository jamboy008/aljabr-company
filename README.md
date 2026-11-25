# ALJABR AI Business Operations Platform — AI Command Center (Frontend 2)

**ALJABR AI Business Operations Platform** tarkibidagi **Next.js App Router + TypeScript (Strict Mode)** asosida qurilgan, hech qanday tashqi AI yoki soxta backendga ulanmagan va **Frontend 1 + FastAPI Business Backend** bilan to‘g‘ridan-to‘g‘ri integratsiyaga tayyor **AI Command Center** hamda **AI Tasks** moduli.

## Arxitektura (Hech qayerga ulanmagan, integratsiyaga tayyor)

```text
Frontend 1 (Next.js App Router: Sidebar + Header + SSO Auth)
   └──► AiCommandCenterModule ('use client' — React 19 + TypeScript Strict)
           └──► Next.js BFF Route Handler (/api/v1/[...path]/route.ts)
                   └──► FastAPI Business Backend (FASTAPI_BACKEND_URL)
                           └──► AI Engine
```

- **Sof Next.js App Router + TypeScript Strict:** Vite, Express, Gemini SDK (`@google/genai`) va soxta javob generatorlari to‘liq olib tashlangan.
- **Soxta autentifikatsiyasiz (`Frontend 1 SSO`):** `sessionActive`, `/auth/restore` va `?embed` bypass mavjud emas. Backend ulanganda autentifikatsiya faqat Frontend 1 SSO (`HttpOnly` cookie yoki xotiradagi `Bearer` token) orqali tekshiriladi.
- **Soxta AI javoblarsiz:** `FASTAPI_BACKEND_URL` sozlanmagan holatda BFF `/api/v1/*` endpointlari soxta javob qaytarmaydi — aniq `503 BACKEND_NOT_CONNECTED` javobini qaytaradi.
- **Fayl yuklash va streaming:** Multipart fayl baytlari (`FormData` stream) va SSE (`text/event-stream`) oqimi `AbortController` bilan bevosita `FASTAPI_BACKEND_URL` ga uzatiladi (`x-aljabr-user-id` spoofed headerlari serverda kesiladi).

## BFF Route Handlerlar (`src/app/api/v1/*`)

- `GET /api/v1/health` — Next.js BFF holati (`backendConfigured`)
- `GET /api/v1/system/config` — Faqat o‘qish uchun konfiguratsiya (`apiMode: "unconnected" | "live"`)
- `GET /api/v1/auth/session` — FastAPI ulanganda sessiyani proksi qiladi; ulanmaganda `authenticated: false, backendConfigured: false` qaytaradi
- `ALL /api/v1/[...path]` — Chat, suhbat tarixi, fayl yuklash (`multipart/form-data`), SSE streaming (`/chat/stream`) va AI Tasks so‘rovlarini `FASTAPI_BACKEND_URL` ga uzatadi (ulanmagan bo‘lsa `503 BACKEND_NOT_CONNECTED`)

## Ishga tushirish

```bash
npm install
npm run dev
```

Brauzerda `http://localhost:3000` manzilini oching.

## Integratsiya uchun `.env` sozlamasi

`.env.example` dan nusxa olib `.env` yarating:

```env
FASTAPI_BACKEND_URL=http://127.0.0.1:8000
FRONTEND_1_LOGIN_URL=/login
```

## Tekshiruv buyruqlari

```bash
npm run lint        # TypeScript strict check + ESLint
npm test            # Vitest unit va Next.js BFF testlari
npm run build       # Next.js production build
npm run test:e2e    # Playwright E2E testlari
```
