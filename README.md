<h1 align="center">Sistem Informasi Magang</h1>

<p align="center">
  <img src=".github/assets/twentyonelogo.png" alt="TwentyOne Logo" width="200">
</p>
<h4 align="center">by TwentyOne Team</h4>

<p align="center">
  <a href="https://maps.app.goo.gl/7KvGrbhztdbDVZbz6">
    <img src="https://img.shields.io/badge/Location-Pulo%20Gebang-green?style=for-the-badge&logo=googlemaps&logoColor=white" alt="Alamat Kelurahan Pulo Gebang"/>
  </a>
  <a href="">
    <img src="https://img.shields.io/badge/Website-Visit-blue?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Website URL"/>
  </a>
  <a href="https://vitejs.dev/">
    <img src="https://img.shields.io/badge/Vite-7.2.4-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-TSX-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript (TSX)"/>
  </a>
  <a href="https://opensource.org/licenses/MIT">
    <img src="https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge" alt="MIT License"/>
  </a>
</p>

<p align="center">
  Front-end website for the Internship Information System at Kelurahan Pulo Gebang.
</p>

---

<p align="center">
  <strong>📚 Language:</strong> <strong>English</strong> | <a href="README.id.md">Bahasa Indonesia</a>
</p>

---

## 📋 Table of Contents
- [📖 About](#-about)
- [✨ Features](#-features)
- [🛠️ Tech Stack](#%EF%B8%8F-tech-stack)
- [🏗️ System Architecture](#%EF%B8%8F-system-architecture)
- [🚀 Getting Started](#-getting-started)
  - [🔎 Prerequisites](#-prerequisites)
  - [💾 Installation](#-installation)
  - [💻 Running Locally](#-running-locally)
- [📂 Project Structure](#-project-structure)
- [🖼️ Screenshots](#%EF%B8%8F-screenshots)
- [📚 Documentation](#-documentation)
- [🤝 Contributing](#-contributing)
- [⚖️ License](#%EF%B8%8F-license)
- [🙏 Acknowledgements](#-acknowledgements)

---

## 📖 About

**magang-pulogebang-vite** is a modern front-end application designed for the Internship Information System (Sistem Informasi Magang) of Kelurahan Pulo Gebang. Built with TypeScript and Vite, this project offers a fast and smooth development experience for both contributors and users. The system helps candidates easily register and track their internship applications in Kelurahan Pulo Gebang.

---

## ✨ Features

- User-friendly registration and application process
- Responsive UI design for mobile and desktop
- Dashboard for applicants to monitor their application status
- Integrated chatbot for instant support and information

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

For in-depth backend documentation, see [Backend README](backend/README.md).

---

## 🏗️ System Architecture

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

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### 🔎 Prerequisites

- [Node.js](https://nodejs.org/) (v16 or later recommended)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [PostgreSQL](https://www.postgresql.org/) (for backend)

### 💾 Installation

**1. Clone Repository:**
```bash
git clone https://github.com/TwentyOneTeam/magang-pulogebang-vite.git
cd magang-pulogebang-vite
```

**2. Install Frontend Dependencies:**
```bash
npm install
# or
yarn install
```

**3. Setup Backend (see [Backend README](backend/README.md)):**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run init-db
```

### 💻 Running Locally

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Backend server: http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# Open browser: http://localhost:3000
```

### 📦 Building for Production

```bash
npm run build
# or
yarn build
```
The optimized build output will be in the `dist/` folder.

---

## 📂 Project Structure

```
magang-pulogebang-vite/
├── src/                          # Frontend code
│   ├── components/               # React components
│   ├── services/                 # API services
│   ├── styles/                   # Global styles
│   ├── App.tsx                   # Root component
│   └── main.tsx                  # Entry point
├── backend/                      # Backend code
│   ├── config/                   # Configuration
│   ├── controllers/              # Business logic
│   ├── middleware/               # Express middleware
│   ├── models/                   # Database models
│   ├── routes/                   # API routes
│   ├── uploads/                  # File uploads
│   └── server.js                 # Entry point
├── public/                       # Static assets
├── README.md                     # Documentation (English)
├── README.id.md                  # Documentation (Indonesian)
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies
```

---

## 📚 Documentation

- **[Backend Documentation](backend/README.md)** - API setup, database configuration, deployment guide
- **[Backend Dokumentasi (ID)](backend/README.id.md)** - Dokumentasi backend dalam Bahasa Indonesia

---

## 🖼️ Screenshots

<p align="center">
  <img src=".github/assets/homepage.png" alt="Home Page" width="600">
</p>
<p align="center">
  <img src=".github/assets/informationpage.png" alt="Information Page" width="600">
</p>

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork this repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## ⚖️ License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more information.

---

## 🙏 Acknowledgements

- [Vite](https://vite.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React](https://react.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- And all contributors who help improve this project.

<p align="center">
  Made with ❤️ by the <b>TwentyOne Team</b>!
</p>