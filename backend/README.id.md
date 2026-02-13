# Backend API - Sistem Informasi Magang Kelurahan Pulo Gebang

Backend API menggunakan **Express.js**, **PostgreSQL**, dan **Gemini AI**.

<p align="center">
  <strong>📚 Bahasa:</strong> <a href="README.md">English</a> | <strong>Bahasa Indonesia</strong> | <a href="../README.id.md">README Utama</a>
</p>

## 📋 Daftar Isi

- [🚀 Instalasi](#-instalasi)
- [⚙️ Konfigurasi](#%EF%B8%8F-konfigurasi)
- [🏃 Menjalankan Server](#-menjalankan-server)
- [📚 API Endpoints](#-api-endpoints)
- [🔄 Koneksi Frontend](#-koneksi-frontend)
- [🧪 Testing API](#-testing-api)
- [📂 Struktur Folder](#-struktur-folder)
- [🌐 Deployment](#-deployment-ke-vps-hostinger)
- [🔧 Pemecahan Masalah](#-pemecahan-masalah)
- [📞 Dukungan](#-dukungan)
- [📝 Lisensi](#-lisensi)

---

## 🚀 Instalasi

### 1. Install PostgreSQL

**Windows:**
1. Unduh dari [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Install dengan default settings
3. Catat password untuk user `postgres`

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql@16
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Create Database

Buka PostgreSQL command line:

**Windows:** Cari "SQL Shell (psql)" di Start Menu

**Mac/Linux:**
```bash
psql -U postgres
```

Kemudian jalankan:
```sql
CREATE DATABASE magang_pulogebang;
\q
```

### 3. Install Dependencies

```bash
cd backend
npm install
```

---

## ⚙️ Konfigurasi

### 1. Copy file environment

```bash
cp .env.example .env
```

### 2. Edit file `.env`

Buka file `.env` dan isi dengan data Anda:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=magang_pulogebang
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

# JWT Secret (ganti dengan random string)
JWT_SECRET=rahasia_jwt_anda_ganti_ini_12345

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend URL (PENTING untuk CORS & redirect)
FRONTEND_URL=http://localhost:5173
```

### 3. Dapatkan Gemini API Key (GRATIS!)

1. Buka [https://ai.google.dev/](https://ai.google.dev/)
2. Klik **"Get API Key in Google AI Studio"**
3. Login dengan Google Account
4. Klik **"Create API Key"**
5. Copy API Key dan paste ke `.env`

**Screenshot lokasi:**
```
Google AI Studio > Get API key > Create API key in new project
```

### 4. Initialize Database

Jalankan script untuk membuat tabel dan data awal:

```bash
npm run init-db
```

**Script ini akan:**
- ✅ Create semua tabel di database
- ✅ Create admin user default
- ✅ Create sample posisi magang

**Output yang diharapkan:**
```
✅ Database initialization completed successfully!

📝 Summary:
   - Admin Email: admin@pulogebang.go.id
   - Admin Password: Admin123!
   - Sample Positions: 5 positions created
```

⚠️ **PENTING:** Catat email dan password admin!

---

## 🏃 Menjalankan Server

### Development Mode (auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

**Server akan berjalan di:** `http://localhost:3001`

**Output sukses:**
```
✅ Server is running!
📍 Local:            http://localhost:3001
🌍 Network:         http://0.0.0.0:3001
📝 Environment:     development
💾 Database:        PostgreSQL (magang_pulogebang)

📚 API Documentation:
   - Auth:          http://localhost:3001/api/auth
   - Positions:     http://localhost:3001/api/positions
   - Applications:  http://localhost:3001/api/applications
   - Chat (Gemini): http://localhost:3001/api/chat

🚀 Ready to accept requests!
```

---

## 📚 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/register` | ❌ | Register user baru |
| POST | `/login` | ❌ | Login user/admin |
| GET | `/me` | ✅ | Get current user |
| PUT | `/profile` | ✅ | Update profile |
| PUT | `/change-password` | ✅ | Ganti password |

### Positions (`/api/positions`)

| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| GET | `/` | ❌ | - | Get semua posisi |
| GET | `/:id` | ❌ | - | Get posisi by ID |
| POST | `/` | ✅ | Admin | Create posisi baru |
| PUT | `/:id` | ✅ | Admin | Update posisi |
| DELETE | `/:id` | ✅ | Admin | Delete posisi |
| PATCH | `/:id/toggle-active` | ✅ | Admin | Aktifkan/nonaktifkan |

### Applications (`/api/applications`)

| Method | Endpoint | Auth | Role | Deskripsi |
|--------|----------|------|------|-----------|
| GET | `/` | ✅ | All | Get applications (user: miliknya, admin: semua) |
| GET | `/:id` | ✅ | All | Get application detail |
| GET | `/stats` | ✅ | Admin | Get statistics |
| POST | `/` | ✅ | User | Submit application baru |
| PUT | `/:id/status` | ✅ | Admin | Update status application |
| DELETE | `/:id` | ✅ | All | Delete application |

### Chat (`/api/chat`)

| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | `/` | ❌ | Chat dengan Gemini AI |
| GET | `/test` | ❌ | Test Gemini connection |

---

## 🔄 Koneksi Frontend

Backend ini dirancang untuk diakses oleh frontend yang berjalan di `http://localhost:5173` (default Vite dev server).

### Konfigurasi CORS
- Frontend URL diatur di `FRONTEND_URL` di `.env`
- Backend secara otomatis mengizinkan request dari URL frontend
- JWT tokens dikirim melalui header `Authorization`

### Base URL API di Frontend
```typescript
// Dari frontend, panggil API:
http://localhost:3001/api/...

// Contoh:
POST http://localhost:3001/api/auth/login
GET http://localhost:3001/api/positions
```

### Alur Autentikasi
1. User login → POST `/api/auth/login`
2. Backend mengembalikan JWT token
3. Frontend menyimpan token di localStorage/cookies
4. Setiap request mengirim token di header: `Authorization: Bearer <token>`

Lihat [Frontend Service](../src/services/api.ts) untuk implementasi detail.

---

## 🧪 Testing API

### Menggunakan Browser

Buka di browser:
```
http://localhost:3001/api/positions
```

### Menggunakan cURL

**Get Positions:**
```bash
curl http://localhost:3001/api/positions
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@pulogebang.go.id","password":"Admin123!"}'
```

**Test Gemini AI:**
```bash
curl -X POST http://localhost:3001/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Halo, bagaimana cara daftar magang?"}'
```

### Menggunakan Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import collection (bisa dibuat manual)
3. Test semua endpoints

---

## 📂 Struktur Folder

```
backend/
├── config/
│   ├── database.js          # Konfigurasi PostgreSQL
│   ├── gemini.js            # Konfigurasi Gemini AI
│   └── initDatabase.js      # Script init DB
├── controllers/
│   ├── authController.js    # Logic authentication
│   ├── positionController.js
│   ├── applicationController.js
│   └── chatController.js
├── middleware/
│   ├── auth.js              # JWT & authorization
│   ├── upload.js            # Multer file upload
│   └── validation.js        # Express validator
├── models/
│   ├── User.js
│   ├── Position.js
│   ├── Application.js
│   └── index.js             # Model associations
├── routes/
│   ├── auth.js
│   ├── positions.js
│   ├── applications.js
│   └── chat.js
├── uploads/                 # Folder untuk file upload
├── .env                     # Environment variables (jangan commit!)
├── .env.example             # Template .env
├── server.js                # Entry point
└── package.json
```

---

## 🌐 Deployment ke VPS Hostinger

### 1. Persiapan VPS

Login ke VPS via SSH:
```bash
ssh root@your_vps_ip
```

### 2. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verifikasi:
```bash
node --version
npm --version
```

### 3. Install PostgreSQL

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

Setup database:
```bash
sudo -u postgres psql

CREATE DATABASE magang_pulogebang;
CREATE USER your_db_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE magang_pulogebang TO your_db_user;
\q
```

### 4. Clone & Setup Project

```bash
# Install Git (jika belum)
sudo apt install git

# Clone repository
git clone your-repo-url
cd your-project/backend

# Install dependencies
npm install

# Copy dan edit .env
cp .env.example .env
nano .env
```

Edit `.env` untuk production:
```env
NODE_ENV=production
PORT=3001
DB_HOST=localhost
DB_USER=your_db_user
DB_PASSWORD=secure_password
FRONTEND_URL=https://your-domain.com
```

### 5. Initialize Database

```bash
npm run init-db
```

### 6. Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### 7. Start Server dengan PM2

```bash
pm2 start server.js --name magang-api
pm2 save
pm2 startup
```

Cek status:
```bash
pm2 status
pm2 logs magang-api
```

### 8. Setup Nginx (Reverse Proxy)

Install Nginx:
```bash
sudo apt install nginx
```

Create config:
```bash
sudo nano /etc/nginx/sites-available/magang-api
```

Paste konfigurasi:
```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /uploads {
        alias /path/to/your/backend/uploads;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/magang-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. Setup SSL (Optional tapi Recommended)

Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

Dapatkan SSL certificate:
```bash
sudo certbot --nginx -d api.yourdomain.com
```

### 10. Setup Firewall

```bash
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

---

## 🔧 Pemecahan Masalah

### Database connection failed

**Cek PostgreSQL running:**
```bash
# Windows
services.msc → cari "postgresql"

# Mac/Linux
sudo systemctl status postgresql
```

**Test koneksi manual:**
```bash
psql -U postgres -d magang_pulogebang
```

### Port sudah digunakan

Ganti PORT di `.env`:
```env
PORT=3002
```

### Gemini API error

- Cek API Key sudah benar
- Cek quota di [Google AI Studio](https://ai.google.dev/)
- Pastikan tidak ada typo di `.env`

### File upload error

Pastikan folder `uploads/` ada dan writable:
```bash
mkdir -p uploads
chmod 755 uploads
```

---

## 📞 Dukungan

Jika ada masalah:
1. Cek logs: `pm2 logs magang-api` (production) atau console (development)
2. Cek file `.env` sudah benar
3. Cek PostgreSQL dan Gemini API sudah setup

---

## 📝 Lisensi

Proyek ini dilisensikan di bawah MIT License. Lihat [LICENSE](LICENSE) untuk informasi lebih lanjut.