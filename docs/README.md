# Dealer Motor Dashboard (Laravel + React + Tailwind)

## Ringkas
Fullstack dashboard internal dealer motor untuk absensi, aktivitas sales, leads, SPK, dokumen, harga, dan stok.

## Tech Stack
- Backend: Laravel (API)
- Frontend: React + Tailwind (Vite)
- DB: MySQL
- Auth: Laravel Sanctum (role: admin, sales)
- Upload: Storage `public/` (image & dokumen)

## Struktur
Lihat: `docs/structure.md`

## Database
- Schema: `docs/schema.sql`
- Seed sample: `docs/seeds.sql`

## API
Daftar endpoint: `docs/endpoints.md`

## UI
Desain halaman: `docs/ui.md`

## Env Config (contoh)
```
APP_NAME=DealerDashboard
APP_ENV=local
APP_KEY=base64:GENERATE
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=dealer_dashboard
DB_USERNAME=root
DB_PASSWORD=

FILESYSTEM_DISK=public
SANCTUM_STATEFUL_DOMAINS=localhost
SESSION_DOMAIN=localhost
```

## Setup (Local)
Backend (Laravel):
1) `cd backend`
2) `composer install`
3) `copy .env.example .env` lalu set DB MySQL
4) `php artisan key:generate`
5) `php artisan migrate --seed`
6) `php artisan storage:link`
7) `php artisan serve`

Frontend (React + Tailwind):
1) `cd frontend`
2) `npm install`
3) `npm run dev`

Env Frontend:
- Tambahkan `VITE_API_URL=http://localhost:8000/api` di `frontend/.env`

Catatan:
- Upload file disimpan di `storage/app/public/uploads`.
- Gunakan middleware role untuk membatasi akses endpoint.
