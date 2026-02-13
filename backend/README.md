# Backend API - Internship Information System Kelurahan Pulo Gebang

Backend API using **Express.js**, **PostgreSQL**, and **Gemini AI**.

<p align="center">
  <strong>📚 Language:</strong> <strong>English</strong> | <a href="README.id.md">Bahasa Indonesia</a> | <a href="../README.md">Main README</a>
</p>

## 📋 Table of Contents

- [🚀 Installation](#-installation)
- [⚙️ Configuration](#%EF%B8%8F-configuration)
- [🏃 Running Server](#-running-server)
- [📚 API Endpoints](#-api-endpoints)
- [🔄 Frontend Connection](#-frontend-connection)
- [🧪 Testing API](#-testing-api)
- [📂 Folder Structure](#-folder-structure)
- [🌐 Deployment](#-deployment-to-hostinger-vps)
- [🔧 Troubleshooting](#-troubleshooting)
- [📞 Support](#-support)
- [📝 License](#-license)

---

## 🚀 Installation

### 1. Install PostgreSQL

**Windows:**
1. Download from [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Install with default settings
3. Note the password for `postgres` user

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

Open PostgreSQL command line:

**Windows:** Search for "SQL Shell (psql)" in Start Menu

**Mac/Linux:**
```bash
psql -U postgres
```

Then run:
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

## ⚙️ Configuration

### 1. Copy environment file

```bash
cp .env.example .env
```

### 2. Edit `.env` file

Open `.env` file and fill with your configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=magang_pulogebang
DB_USER=postgres
DB_PASSWORD=your_postgres_password_here

# JWT Secret (replace with random string)
JWT_SECRET=your_jwt_secret_key_12345

# Gemini API Key
GEMINI_API_KEY=your_gemini_api_key_here

# Frontend URL (IMPORTANT for CORS & redirect)
FRONTEND_URL=http://localhost:5173
```

### 3. Get Gemini API Key (FREE!)

1. Open [https://ai.google.dev/](https://ai.google.dev/)
2. Click **"Get API Key in Google AI Studio"**
3. Login with Google Account
4. Click **"Create API Key"**
5. Copy API Key and paste to `.env`

**Location screenshot:**
```
Google AI Studio > Get API key > Create API key in new project
```

### 4. Initialize Database

Run script to create tables and initial data:

```bash
npm run init-db
```

**This script will:**
- ✅ Create all tables in database
- ✅ Create default admin user
- ✅ Create sample internship positions

**Expected output:**
```
✅ Database initialization completed successfully!

📝 Summary:
   - Admin Email: admin@pulogebang.go.id
   - Admin Password: Admin123!
   - Sample Positions: 5 positions created
```

⚠️ **IMPORTANT:** Note the admin email and password!

---

## 🏃 Running Server

### Development Mode (auto-reload)

```bash
npm run dev
```

### Production Mode

```bash
npm start
```

**Server will run at:** `http://localhost:3001`

**Expected successful output:**
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

| Method | Endpoint | Auth | Description |
|--------|----------|------|-----------|
| POST | `/register` | ❌ | Register new user |
| POST | `/login` | ❌ | Login user/admin |
| GET | `/me` | ✅ | Get current user |
| PUT | `/profile` | ✅ | Update profile |
| PUT | `/change-password` | ✅ | Change password |

### Positions (`/api/positions`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-----------|
| GET | `/` | ❌ | - | Get all positions |
| GET | `/:id` | ❌ | - | Get position by ID |
| POST | `/` | ✅ | Admin | Create new position |
| PUT | `/:id` | ✅ | Admin | Update position |
| DELETE | `/:id` | ✅ | Admin | Delete position |
| PATCH | `/:id/toggle-active` | ✅ | Admin | Toggle active status |

### Applications (`/api/applications`)

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-----------|
| GET | `/` | ✅ | All | Get applications (user: own, admin: all) |
| GET | `/:id` | ✅ | All | Get application detail |
| GET | `/stats` | ✅ | Admin | Get statistics |
| POST | `/` | ✅ | User | Submit new application |
| PUT | `/:id/status` | ✅ | Admin | Update application status |
| DELETE | `/:id` | ✅ | All | Delete application |

### Chat (`/api/chat`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-----------|
| POST | `/` | ❌ | Chat with Gemini AI |
| GET | `/test` | ❌ | Test Gemini connection |

---

## 🔄 Frontend Connection

This backend is designed to be accessed by frontend running at `http://localhost:5173` (default Vite dev server).

### CORS Configuration
- Frontend URL is configured via `FRONTEND_URL` in `.env`
- Backend automatically allows requests from frontend URL
- JWT tokens are sent via `Authorization` header

### API Base URL in Frontend
```typescript
// From frontend, call API:
http://localhost:3001/api/...

// Examples:
POST http://localhost:3001/api/auth/login
GET http://localhost:3001/api/positions
```

### Authentication Flow
1. User login → POST `/api/auth/login`
2. Backend returns JWT token
3. Frontend saves token in localStorage/cookies
4. Each request sends token in header: `Authorization: Bearer <token>`

See [Frontend Service](../src/services/api.ts) for implementation details.

---

## 🧪 Testing API

### Using Browser

Open in browser:
```
http://localhost:3001/api/positions
```

### Using cURL

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
  -d '{"message":"How to apply for internship?"}'
```

### Using Postman

1. Download [Postman](https://www.postman.com/downloads/)
2. Import collection (can be created manually)
3. Test all endpoints

---

## 📂 Folder Structure

```
backend/
├── config/
│   ├── database.js          # PostgreSQL Configuration
│   ├── gemini.js            # Gemini AI Configuration
│   └── initDatabase.js      # Database Init Script
├── controllers/
│   ├── authController.js    # Authentication Logic
│   ├── positionController.js
│   ├── applicationController.js
│   └── chatController.js
├── middleware/
│   ├── auth.js              # JWT & Authorization
│   ├── upload.js            # Multer File Upload
│   └── validation.js        # Express Validator
├── models/
│   ├── User.js
│   ├── Position.js
│   ├── Application.js
│   └── index.js             # Model Associations
├── routes/
│   ├── auth.js
│   ├── positions.js
│   ├── applications.js
│   └── chat.js
├── uploads/                 # File Uploads Folder
├── .env                     # Environment Variables (don't commit!)
├── .env.example             # .env Template
├── server.js                # Entry Point
└── package.json
```

---

## 🌐 Deployment to Hostinger VPS

### 1. VPS Preparation

Login to VPS via SSH:
```bash
ssh root@your_vps_ip
```

### 2. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify:
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
# Install Git (if not installed)
sudo apt install git

# Clone repository
git clone your-repo-url
cd your-project/backend

# Install dependencies
npm install

# Copy and edit .env
cp .env.example .env
nano .env
```

Edit `.env` for production:
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

### 7. Start Server with PM2

```bash
pm2 start server.js --name magang-api
pm2 save
pm2 startup
```

Check status:
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

Paste configuration:
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

### 9. Setup SSL (Optional but Recommended)

Install Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
```

Get SSL certificate:
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

## 🔧 Troubleshooting

### Database connection failed

**Check PostgreSQL is running:**
```bash
# Windows
services.msc → search for "postgresql"

# Mac/Linux
sudo systemctl status postgresql
```

**Test connection manually:**
```bash
psql -U postgres -d magang_pulogebang
```

### Port already in use

Change PORT in `.env`:
```env
PORT=3002
```

### Gemini API error

- Check API Key is correct
- Check quota at [Google AI Studio](https://ai.google.dev/)
- Make sure no typo in `.env`

### File upload error

Make sure `uploads/` folder exists and is writable:
```bash
mkdir -p uploads
chmod 755 uploads
```

---

## 📞 Support

If you have issues:
1. Check logs: `pm2 logs magang-api` (production) or console (development)
2. Check `.env` file is correct
3. Check PostgreSQL and Gemini API are set up

---

## 📝 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for more information.