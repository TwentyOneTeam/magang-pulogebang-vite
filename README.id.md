<h1 align="center">Sistem Informasi Magang</h1>

<p align="center">
  <img src=".github/assets/twentyonelogo.png" alt="TwentyOne Logo" width="200">
</p>
<h4 align="center">oleh TwentyOne Team</h4>

<p align="center">
  <a href="https://maps.app.goo.gl/7KvGrbhztdbDVZbz6">
    <img src="https://img.shields.io/badge/Lokasi-Pulo%20Gebang-green?style=for-the-badge&logo=googlemaps&logoColor=white" alt="Alamat Kelurahan Pulo Gebang"/>
  </a>
  <a href="">
    <img src="https://img.shields.io/badge/Website-Kunjungi-blue?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Website URL"/>
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/Vite-7.2.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-TSX-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript (TSX)"/>
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/Lisensi-MIT-yellow?style=for-the-badge" alt="MIT License"/>
  </a>
</p>

<p align="center">
  Aplikasi front-end untuk Sistem Informasi Magang di Kelurahan Pulo Gebang.
</p>

---

<p align="center">
  <strong>📚 Bahasa:</strong> <a href="README.md">English</a> | <strong>Bahasa Indonesia</strong>
</p>

---

## 📋 Daftar Isi
- [📖 Tentang](#-tentang)
- [✨ Fitur](#-fitur)
- [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
- [🏗️ Arsitektur Sistem](#%EF%B8%8F-arsitektur-sistem)
- [🚀 Memulai](#-memulai)
  - [🔎 Prasyarat](#-prasyarat)
  - [💾 Instalasi](#-instalasi)
  - [💻 Menjalankan Lokal](#-menjalankan-lokal)
- [📂 Struktur Proyek](#-struktur-proyek)
- [🖼️ Screenshots](#%EF%B8%8F-screenshots)
- [🤝 Kontribusi](#-kontribusi)
- [⚖️ Lisensi](#%EF%B8%8F-lisensi)
- [🙏 Ucapan Terima Kasih](#-ucapan-terima-kasih)

---

## 📖 Tentang

**magang-pulogebang-vite** adalah aplikasi front-end modern yang dirancang untuk Sistem Informasi Magang (SIM) Kelurahan Pulo Gebang. Dibangun dengan TypeScript dan Vite, proyek ini menawarkan pengalaman pengembangan yang cepat dan lancar bagi kontributor dan pengguna. Sistem ini membantu calon peserta magang untuk mudah mendaftar dan melacak status aplikasi magang mereka di Kelurahan Pulo Gebang.

---

## ✨ Fitur

- Proses registrasi dan aplikasi yang ramah pengguna
- Desain UI responsif untuk mobile dan desktop
- Dashboard untuk pelamar memantau status aplikasi mereka
- Chatbot terintegrasi untuk dukungan instan dan informasi

---

## 🛠️ Tech Stack

**Frontend:**
- **TypeScript (TSX)** (v5.9.3)
- **Vite** (v7.2.4)
- **React** (v18.3.1)
- **TailwindCSS** (v4.1.17)

**Backend:**
- **Express.js** (Node.js)
- **PostgreSQL** (Database)
- **Gemini AI** (Chatbot)

Untuk detail lengkap backend, lihat [Backend README](backend/README.id.md).

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│         FRONTEND (Vite + React + TypeScript)        │
│  - User Registration & Login                         │
│  - Application Dashboard                             │
│  - Chatbot Integration                               │
│  - Port: http://localhost:5173                       │
└──────────────────────┬──────────────────────────────┘
                       │ API Calls (JSON)
                       │
┌──────────────────────▼──────────────────────────────┐
│         BACKEND (Express.js + PostgreSQL)           │
│  - Authentication & Authorization                    │
│  - Application Management                            │
│  - Gemini AI Chatbot                                 │
│  - Port: http://localhost:3001                       │
└──────────────────────┬──────────────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
    ┌───▼──┐    ┌─────▼─────┐   ┌────▼────┐
    │  DB  │    │ Gemini AI │   │  Email  │
    │ (PG) │    │    API    │   │ Service │
    └──────┘    └───────────┘   └─────────┘
```

---

## 🚀 Memulai

Ikuti petunjuk ini untuk menyiapkan proyek secara lokal.

### 🔎 Prasyarat

- [Node.js](https://nodejs.org/) (v16 atau lebih baru direkomendasikan)
- [npm](https://www.npmjs.com/) atau [Yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) (untuk backend)

### 💾 Instalasi

**1. Clone Repository:**
```bash
git clone https://github.com/TwentyOneTeam/magang-pulogebang-vite.git
cd magang-pulogebang-vite
```

**2. Install Dependencies Frontend:**
```bash
npm install
# atau
yarn install
```

**3. Setup Backend (lihat [Backend README](backend/README.id.md)):**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env dengan konfigurasi Anda
npm run init-db
```

### 💻 Menjalankan Lokal

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Server backend: http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Buka browser: http://localhost:3000
```

### 📦 Build untuk Production

```bash
npm run build
# atau
yarn build
```
Output yang dioptimalkan akan berada di folder `dist/`.

---

## 📂 Struktur Proyek

```
magang-pulogebang-vite/
├── src/                          # Kode frontend
│   ├── components/               # React components
│   ├── services/                 # API services
│   ├── styles/                   # Global styles
│   ├── App.tsx                   # Root component
│   └── main.tsx                  # Entry point
├── backend/                      # Kode backend
│   ├── config/                   # Konfigurasi
│   ├── controllers/              # Business logic
│   ├── middleware/               # Express middleware
│   ├── models/                   # Database models
│   ├── routes/                   # API routes
│   ├── uploads/                  # File uploads
│   └── server.js                 # Entry point
├── public/                       # Static assets
├── README.md                     # Dokumentasi English
├── README.id.md                  # Dokumentasi Indonesia
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

---

## 🖼️ Screenshots

<p align="center">
  <img src=".github/assets/homepage.png" alt="Home Page" width="600">
</p>
<p align="center">
  <img src=".github/assets/informationpage.png" alt="Information Page" width="600">
</p>

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Untuk berkontribusi:

1. Fork repository ini
2. Buat branch baru (`git checkout -b feature/fitur-anda`)
3. Commit perubahan Anda (`git commit -m 'Tambahkan fitur'`)
4. Push ke branch (`git push origin feature/fitur-anda`)
5. Buka Pull Request

---

## ⚖️ Lisensi

Proyek ini dilisensikan di bawah MIT License. Lihat [LICENSE](LICENSE) untuk informasi lebih lanjut.

---

## 🙏 Ucapan Terima Kasih

- [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- Dan semua kontributor yang membantu meningkatkan proyek ini.

<p align="center">
  Dibuat dengan ❤️ oleh <b>TwentyOne Team</b>!
</p>
