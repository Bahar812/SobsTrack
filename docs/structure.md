# Struktur Folder (Usulan)

```
/ (repo root)
  backend/ (Laravel)
    app/
      Http/
        Controllers/
          Api/
            AuthController.php
            DashboardController.php
            AttendanceController.php
            ActivityController.php
            LeadController.php
            EventController.php
            SpkController.php
            DocumentController.php
            PriceController.php
            StockController.php
        Requests/
        Resources/
      Models/
        Attendance.php
        AttendanceCleanlinessPhoto.php
        DailyActivity.php
        DailyActivityProof.php
        Lead.php
        LeadFollowUp.php
        Event.php
        Spk.php
        Document.php
        DocumentCategory.php
        Price.php
        StockUnit.php
        Branch.php
      Policies/
      Services/
    database/
      migrations/
      seeders/
    routes/
      api.php
    storage/
      app/public/
        uploads/
          absensi/
          aktivitas/
          dokumen/

  frontend/ (React + Tailwind via Vite)
    src/
      pages/
        DashboardHome.tsx
        Absensi.tsx
        Aktivitas.tsx
        Leads.tsx
        Kalender.tsx
        Spk.tsx
        Dokumen.tsx
        Harga.tsx
        Stok.tsx
        Login.tsx
      components/
        cards/
        charts/
        tables/
      api/
        client.ts
        endpoints.ts
      layouts/
        AppShell.tsx
      styles/
        tailwind.css

  docs/
    schema.sql
    endpoints.md
    ui.md
    seeds.sql
    README.md
    structure.md
```

Catatan:
- Jika ingin single-repo Laravel + React, `frontend` bisa dipindah ke `resources/js` lalu build lewat Vite Laravel.
- Upload file disimpan di `storage/app/public/uploads` dan di-expose via `php artisan storage:link`.
