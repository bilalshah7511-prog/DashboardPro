# DashPro Backend API

Production-ready REST API with JWT authentication, PostgreSQL, WebSocket, and advanced features.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Run database migration
npm run migrate

# Start development server
npm run dev
```

## 📚 Documentation

See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for complete setup guide.

## 🔌 API Endpoints

- **Auth**: `/api/auth/*` - Authentication endpoints
- **Users**: `/api/users/*` - User management
- **2FA**: `/api/2fa/*` - Two-factor authentication
- **Export**: `/api/export/*` - CSV/PDF exports
- **Health**: `/api/health` - Health check

## 🛠️ Tech Stack

- Node.js + Express
- PostgreSQL
- JWT Authentication
- Socket.IO (WebSocket)
- Nodemailer (Email)
- Speakeasy (2FA)
- PDFKit + CSV-Writer (Export)

## 🔐 Default Admin

- Email: admin@gmail.com
- Password: admin

## 📝 Environment Variables

Required variables in `.env`:
- Database credentials
- JWT secrets
- Email configuration
- Frontend URL

See `.env.example` for all variables.

## 🎯 Features

✅ JWT Authentication with refresh tokens
✅ PostgreSQL database
✅ Email notifications
✅ Two-factor authentication
✅ Password reset
✅ CSV/PDF export
✅ WebSocket real-time updates
✅ Role-based access control
✅ Rate limiting
✅ Security headers

## 📞 Support

Check [BACKEND_SETUP.md](./BACKEND_SETUP.md) for troubleshooting.
