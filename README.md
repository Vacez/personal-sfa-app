# Personal SFA Application (Full-Stack)

A modern, high-touch **Sales Force Automation (SFA) & Client Pipeline Application** built with **Expo (React Native Web & Mobile)** and **Laravel 10 REST API (SQLite)**.

Designed specifically for dual operating personas:
1. **🍾 VIP Hospitality Mode**: High-touch guest relations, repeat retention stages, table & drink preferences, milestone/birthday alerts, receivable (ツケ) tracking, and zero-touch social attribution.
2. **💼 B2B Consulting Mode**: Milestone pipelines, project scopes, weighted contract forecasting, corporate invoices, and outreach tracking.

---

## 🚨 Mandatory Bilingual Standard (Peraturan Paten & Wajib)

This application strictly implements a **100% full bilingual system**:
* **🇮🇩 Bahasa Indonesia (`id`)**
* **🇯🇵 日本語 (`ja`)**

**Ironclad Rule**:
* When **Bahasa Indonesia** is selected, 100% of the UI (navigation, headers, cards, modals, alerts, and placeholders) displays in Indonesian.
* When **日本語** is selected, 100% of the UI displays in Japanese.
* No hardcoded user-facing strings are allowed. All strings are managed centrally via typed dictionaries in `frontend/src/i18n/`.

---

## 🏗️ Architecture & Tech Stack

```
personal-sfa-app/
├── backend/                # Laravel 10 REST API
│   ├── app/                # Models, Controllers, Middleware
│   ├── database/           # Migrations & Seeders (SQLite)
│   ├── routes/api.php      # OpenAPI v2.2 Compatible Endpoints
│   └── .env.example
├── frontend/               # Expo React Native (Web & Mobile)
│   ├── src/
│   │   ├── components/     # UI Components (Header, ForecastCard, AlertCard, Modals)
│   │   ├── screens/        # Home, Deals, Contacts, Growth, Settings, Auth
│   │   ├── i18n/           # Types, id.ts, ja.ts, LanguageContext
│   │   ├── context/        # AuthContext, Session State
│   │   └── services/       # API Clients & Service Layer
│   ├── App.tsx
│   └── package.json
├── AGENTS.md               # Architectural & Bilingual Standards
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup (Laravel 10)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
touch database/database.sqlite
php artisan migrate:fresh --seed
php artisan serve --host=0.0.0.0 --port=8000
```

> **Default Seeded Account**:
> * **Email**: `user@example.com`
> * **Password**: `password123`
> * **Name**: Kenji Takahashi

### 2. Frontend Setup (Expo React Native)

```bash
cd frontend
npm install
npm run start
# For web browser testing:
npm run web
```

---

## 📱 Mobile Device Connection (Akses Lewat HP)

Pastikan HP dan komputer terhubung ke **jaringan Wi-Fi yang sama**:

1. **Akses Langsung via Browser HP (Sangat Mudah)**:
   * Buka browser di HP Anda (Safari / Chrome).
   * Kunjungi URL: **`http://<IP_KOMPUTER>:8081`** (Contoh: `http://192.168.1.228:8081`).
   * Aplikasi akan langsung terbuka secara responsif di HP!

2. **Akses via Expo Go App (Native Mobile)**:
   * Unduh aplikasi **Expo Go** dari Google Play Store (Android) atau App Store (iOS).
   * Pada terminal komputer di folder `frontend/`, jalankan:
     ```bash
     npx expo start --lan
     ```
   * Pindai (Scan) QR Code yang muncul di terminal menggunakan Expo Go (Android) atau aplikasi Kamera (iOS).

---

## 📄 License
MIT License.
