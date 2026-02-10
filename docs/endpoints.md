# API Endpoints (REST)

Base URL: `/api`
Auth: Bearer token (Laravel Sanctum)

## Auth
- POST `/auth/login` (email, password)
- POST `/auth/logout`
- GET `/auth/me`

## Dashboard (Admin, Sales)
- GET `/dashboard/summary` (cards: absensi hari ini, aktivitas hari ini, leads aktif, spk bulan berjalan, stok tersedia, ranking sales)

## Absensi (Sales, Admin)
- POST `/attendances/check-in` (selfie, lokasi, cabang)
- POST `/attendances/check-out` (attendance_id)
- POST `/attendances/{id}/cleanliness-photos` (1-3 foto)
- GET `/attendances` (filter: date, sales_id, branch_id)
- GET `/attendances/{id}`

## Daily Activity (Sales, Admin)
- POST `/activities` (date, wa_story_count, fb_marketplace_count, tiktok_post_count)
- POST `/activities/{id}/proofs` (type, file or url)
- GET `/activities` (filter: date, sales_id)
- GET `/activities/stats` (daily, monthly)

## Leads / CRM (Sales, Admin)
- GET `/leads` (filter: sales_id, status, date)
- POST `/leads` (name, whatsapp, motor_interest, status)
- PUT `/leads/{id}` (status, note)
- POST `/leads/{id}/followups` (note, followup_at)

## Events (Sales, Admin)
- GET `/events` (weekly view by date range)
- POST `/events` (admin or sales)
- PUT `/events/{id}`
- DELETE `/events/{id}`

## SPK / DO (Admin)
- GET `/spk` (filter: date, sales_id)
- POST `/spk`
- GET `/spk/summary` (monthly total, per sales, target vs realisasi)

## Documents (Admin, Sales read-only)
- GET `/documents` (filter: category)
- POST `/documents` (admin only, file upload)
- GET `/documents/{id}/download`

## Price List (Admin edit, Sales view)
- GET `/prices` (filter: branch_id)
- POST `/prices` (admin)
- PUT `/prices/{id}` (admin)

## Stock Units (Admin edit, Sales view)
- GET `/stock` (filter: branch_id, status)
- POST `/stock` (admin)
- PUT `/stock/{id}` (admin)

## Master Data (Admin)
- GET `/branches`
- POST `/branches`
- GET `/users` (admin)
- POST `/users` (admin)
