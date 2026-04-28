# Backend Setup Guide - DashPro

## 🎯 Overview

This backend API provides:
- ✅ JWT Authentication with refresh tokens
- ✅ PostgreSQL database integration
- ✅ Email notifications (verification, password reset, 2FA)
- ✅ Two-factor authentication (TOTP)
- ✅ Password reset functionality
- ✅ CSV/PDF export for users and login records
- ✅ WebSocket for real-time updates
- ✅ Role-based access control
- ✅ Rate limiting and security

---

## 📋 Prerequisites

Before starting, install:

1. **Node.js** (v16 or higher)
   ```bash
   node --version
   ```

2. **PostgreSQL** (v12 or higher)
   ```bash
   psql --version
   ```

3. **npm** or **yarn**
   ```bash
   npm --version
   ```

---

## 🚀 Installation Steps

### Step 1: Install PostgreSQL

**Windows:**
1. Download from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer
3. Set password for postgres user
4. Remember the port (default: 5432)

**Mac:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### Step 2: Create Database

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE dashpro_db;

# Exit
\q
```

### Step 3: Install Backend Dependencies

```bash
cd server
npm install
```

### Step 4: Configure Environment Variables

```bash
# Copy example env file
cp .env.example .env

# Edit .env file with your settings
```

**Required Configuration:**

```env
# Server
PORT=5000
NODE_ENV=development

# Database (Update with your PostgreSQL credentials)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dashpro_db
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Secrets (Generate strong random strings)
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_token_secret_key
JWT_REFRESH_EXPIRE=30d

# Email (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_gmail_app_password
EMAIL_FROM=DashPro <noreply@dashpro.com>

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Step 5: Setup Gmail for Email Notifications

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Enable 2-Step Verification
3. Go to Security → App Passwords
4. Generate app password for "Mail"
5. Copy the 16-character password
6. Use it in `EMAIL_PASSWORD` in `.env`

### Step 6: Run Database Migration

```bash
npm run migrate
```

This will:
- Create all required tables
- Set up indexes
- Create default admin user (admin@gmail.com / admin)

### Step 7: Start Backend Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will start on: `http://localhost:5000`

---

## 📁 Backend Structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.js          # PostgreSQL connection
│   │   └── migrate.js            # Database migration script
│   │
│   ├── controllers/
│   │   ├── authController.js     # Authentication logic
│   │   ├── userController.js     # User management
│   │   ├── twoFactorController.js # 2FA logic
│   │   └── exportController.js   # CSV/PDF export
│   │
│   ├── middleware/
│   │   └── auth.js               # JWT verification
│   │
│   ├── routes/
│   │   ├── authRoutes.js         # Auth endpoints
│   │   ├── userRoutes.js         # User endpoints
│   │   ├── twoFactorRoutes.js    # 2FA endpoints
│   │   └── exportRoutes.js       # Export endpoints
│   │
│   ├── utils/
│   │   └── email.js              # Email sending
│   │
│   └── server.js                 # Main server file
│
├── temp/                         # Temporary files (CSV/PDF)
├── .env                          # Environment variables
├── .env.example                  # Example env file
└── package.json                  # Dependencies
```

---

## 🔌 API Endpoints

### Authentication Endpoints

```
POST   /api/auth/register              # Register new user
POST   /api/auth/login                 # Login user
POST   /api/auth/logout                # Logout user
POST   /api/auth/refresh-token         # Refresh access token
GET    /api/auth/verify-email/:token   # Verify email
POST   /api/auth/request-password-reset # Request password reset
POST   /api/auth/reset-password        # Reset password
GET    /api/auth/me                    # Get current user (Protected)
```

### User Endpoints

```
GET    /api/users                      # Get all users (Admin)
GET    /api/users/:id                  # Get user by ID (Admin)
PUT    /api/users/profile              # Update own profile (Protected)
PUT    /api/users/:id                  # Update user (Admin)
DELETE /api/users/:id                  # Delete user (Admin)
GET    /api/users/stats                # Get statistics (Protected)
GET    /api/users/login-records        # Get login records (Protected)
```

### Two-Factor Authentication

```
POST   /api/2fa/enable                 # Enable 2FA (Protected)
POST   /api/2fa/verify                 # Verify 2FA setup (Protected)
POST   /api/2fa/disable                # Disable 2FA (Protected)
POST   /api/2fa/verify-login           # Verify 2FA during login (Public)
```

### Export Endpoints

```
GET    /api/export/users/csv           # Export users to CSV (Admin)
GET    /api/export/users/pdf           # Export users to PDF (Admin)
GET    /api/export/login-records/csv   # Export login records to CSV (Protected)
GET    /api/export/login-records/pdf   # Export login records to PDF (Protected)
```

### Health Check

```
GET    /api/health                     # Server health check
```

---

## 🔐 Authentication Flow

### 1. Register
```javascript
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "gender": "Male"
}

Response:
{
  "message": "User registered successfully",
  "user": { ... },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### 2. Login
```javascript
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "user": { ... },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

### 3. Protected Requests
```javascript
GET /api/users/stats
Headers: {
  "Authorization": "Bearer jwt_token"
}
```

### 4. Refresh Token
```javascript
POST /api/auth/refresh-token
{
  "refreshToken": "refresh_token"
}

Response:
{
  "accessToken": "new_jwt_token",
  "refreshToken": "new_refresh_token"
}
```

---

## 🔒 Two-Factor Authentication Flow

### 1. Enable 2FA
```javascript
POST /api/2fa/enable
Headers: { "Authorization": "Bearer token" }

Response:
{
  "message": "Scan this QR code",
  "secret": "base32_secret",
  "qrCode": "data:image/png;base64,..."
}
```

### 2. Verify Setup
```javascript
POST /api/2fa/verify
Headers: { "Authorization": "Bearer token" }
{
  "code": "123456"
}

Response:
{
  "message": "2FA enabled successfully"
}
```

### 3. Login with 2FA
```javascript
# Step 1: Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password"
}

Response:
{
  "message": "2FA required",
  "requiresTwoFactor": true,
  "userId": 123
}

# Step 2: Verify 2FA
POST /api/2fa/verify-login
{
  "userId": 123,
  "code": "123456"
}

Response:
{
  "message": "Login successful",
  "user": { ... },
  "accessToken": "jwt_token",
  "refreshToken": "refresh_token"
}
```

---

## 📧 Email Templates

The backend sends beautiful HTML emails for:

1. **Email Verification** - Welcome email with verification link
2. **Password Reset** - Secure password reset link
3. **Welcome Email** - Sent after email verification
4. **2FA Code** - Verification code for 2FA

All emails are professionally designed with:
- Gradient headers
- Responsive layout
- Clear call-to-action buttons
- Security warnings

---

## 🌐 WebSocket Events

### Client → Server

```javascript
// Join user room
socket.emit('join', userId)

// Broadcast user registration
socket.emit('user_registered', { user })

// Broadcast login
socket.emit('user_logged_in', { user })

// Broadcast logout
socket.emit('user_logged_out', { user })

// Broadcast profile update
socket.emit('profile_updated', { userId, changes })

// Broadcast role change
socket.emit('user_role_changed', { userId, newRole })

// Broadcast user deletion
socket.emit('user_deleted', { userId })
```

### Server → Client

```javascript
// New user registered
socket.on('new_user', (data) => { ... })

// User activity (login/logout)
socket.on('user_activity', (data) => { ... })

// Profile changed
socket.on('profile_changed', (data) => { ... })

// Role updated
socket.on('role_updated', (data) => { ... })

// User list updated
socket.on('user_list_updated', () => { ... })
```

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  gender VARCHAR(50) DEFAULT 'Not specified',
  profile_image TEXT,
  two_factor_secret VARCHAR(255),
  two_factor_enabled BOOLEAN DEFAULT false,
  email_verified BOOLEAN DEFAULT false,
  verification_token VARCHAR(255),
  reset_token VARCHAR(255),
  reset_token_expiry TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Login Records Table
```sql
CREATE TABLE login_records (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  ip_address VARCHAR(50),
  user_agent TEXT,
  login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  refresh_token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🧪 Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@gmail.com","password":"admin"}'

# Get users (with token)
curl -X GET http://localhost:5000/api/users \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman

1. Import endpoints
2. Set Authorization header: `Bearer YOUR_JWT_TOKEN`
3. Test all endpoints

---

## 🔧 Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution:**
- Check if PostgreSQL is running
- Verify DB credentials in `.env`
- Check DB_HOST and DB_PORT

### Email Sending Error
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solution:**
- Use Gmail App Password (not regular password)
- Enable 2-Step Verification in Google Account
- Generate new App Password

### JWT Token Error
```
Error: jwt malformed
```
**Solution:**
- Check if JWT_SECRET is set in `.env`
- Verify token format: `Bearer token`
- Token might be expired

### Migration Error
```
Error: relation "users" already exists
```
**Solution:**
- Tables already created
- Drop tables if you want to recreate:
```sql
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS login_records CASCADE;
DROP TABLE IF EXISTS users CASCADE;
```

---

## 🚀 Deployment

### Deploy Backend to Heroku

```bash
# Install Heroku CLI
npm install -g heroku

# Login
heroku login

# Create app
heroku create dashpro-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set EMAIL_USER=your_email
# ... set all env variables

# Deploy
git push heroku main

# Run migration
heroku run npm run migrate
```

### Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL database
4. Deploy from GitHub
5. Set environment variables
6. Deploy

---

## 📈 Performance Tips

1. **Database Indexing** - Already added on email, user_id
2. **Connection Pooling** - Configured in database.js
3. **Rate Limiting** - Enabled (100 requests per 15 min)
4. **JWT Expiry** - Access token: 7 days, Refresh: 30 days
5. **Helmet Security** - Enabled for security headers

---

## 🔐 Security Features

✅ Password hashing with bcrypt
✅ JWT authentication
✅ Refresh token rotation
✅ Rate limiting
✅ Helmet security headers
✅ CORS configuration
✅ SQL injection prevention (parameterized queries)
✅ XSS protection
✅ Two-factor authentication
✅ Email verification
✅ Password reset with expiry

---

## 📞 Support

If you encounter issues:
1. Check server logs
2. Verify environment variables
3. Test database connection
4. Check PostgreSQL logs

**Server is ready! 🎉**

Default admin credentials:
- Email: admin@gmail.com
- Password: admin
