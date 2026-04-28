# Frontend-Backend Integration Guide

## Overview

The DashPro frontend has been successfully integrated with the backend API. This guide explains the integration architecture, setup process, and key features.

## Architecture

### Frontend Stack
- React 18 with Vite
- Axios for API calls
- Socket.IO client for WebSocket
- React i18next for multi-language
- Tailwind CSS with dark mode
- Context API for state management

### Backend Stack
- Node.js + Express
- PostgreSQL database
- JWT authentication
- Socket.IO for real-time updates
- Nodemailer for emails
- Speakeasy for 2FA

## Setup Instructions

### 1. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your PostgreSQL credentials and email settings

# Run database migration
npm run migrate

# Start backend server
npm run dev
```

Backend will run on: `http://localhost:5000`

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# VITE_API_URL is already set to http://localhost:5000/api

# Start frontend
npm run dev
```

Frontend will run on: `http://localhost:5173`

## Key Integration Features

### 1. API Service Layer

**Location:** `src/services/api.js`

- Axios instance with base URL configuration
- Automatic JWT token injection in headers
- Token refresh interceptor for expired tokens
- Organized API endpoints by feature

```javascript
// Example usage
import { authAPI, userAPI } from '../services/api'

// Login
const response = await authAPI.login({ email, password })

// Get users
const users = await userAPI.getAll()
```

### 2. WebSocket Integration

**Location:** `src/services/socket.js`

- Real-time updates for user activities
- Automatic reconnection
- Event emitters and listeners

```javascript
// Example usage
import socketService from '../services/socket'

// Connect
socketService.connect()

// Join user room
socketService.joinUserRoom(userId)

// Listen to events
socketService.onUserActivity((data) => {
  console.log('User activity:', data)
})

// Emit events
socketService.emitUserLoggedIn(user)
```

### 3. Authentication Flow

**Updated AuthContext:** `src/context/AuthContext.jsx`

- API-based login/register/logout
- Automatic token management
- WebSocket connection on login
- Token refresh on expiry

```javascript
// Login flow
const { login } = useAuth()
const result = await login(email, password)

if (result.requiresTwoFactor) {
  // Show 2FA input
} else {
  // Navigate to dashboard
}
```

### 4. Dark Mode

**ThemeContext:** `src/context/ThemeContext.jsx`

- Toggle between light and dark themes
- Persists preference in localStorage
- Tailwind dark mode classes

```javascript
const { theme, toggleTheme } = useTheme()
```

### 5. Multi-Language Support

**i18n Config:** `src/i18n/config.js`

- English, Urdu, and Arabic translations
- Browser language detection
- Persists language preference

```javascript
const { t, i18n } = useTranslation()

// Use translations
<h1>{t('dashboard')}</h1>

// Change language
i18n.changeLanguage('ur')
```

## Updated Components

### Login Page
- API-based authentication
- 2FA support
- Dark mode styles
- Multi-language labels

### Signup Page
- API-based registration
- Dark mode styles
- Multi-language labels

### Dashboard
- Fetches stats from API
- WebSocket real-time updates
- Dark mode styles
- Translated labels

### Users Page
- Fetches users from API
- CRUD operations via API
- WebSocket updates on user changes
- Dark mode styles
- Translated labels

### Navbar
- Theme toggle button
- Language selector dropdown
- Dark mode styles
- Profile dropdown with translations

### Sidebar
- Dark mode styles
- Translated menu items
- Async logout

## API Endpoints Used

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh-token` - Refresh access token
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/:id` - Get user by ID (Admin)
- `PUT /api/users/profile` - Update own profile
- `PUT /api/users/:id` - Update user (Admin)
- `DELETE /api/users/:id` - Delete user (Admin)
- `GET /api/users/stats` - Get statistics

### Two-Factor Authentication
- `POST /api/2fa/enable` - Enable 2FA
- `POST /api/2fa/verify` - Verify 2FA setup
- `POST /api/2fa/disable` - Disable 2FA
- `POST /api/2fa/verify-login` - Verify 2FA during login

### Export
- `GET /api/export/users/csv` - Export users to CSV
- `GET /api/export/users/pdf` - Export users to PDF
- `GET /api/export/login-records/csv` - Export login records to CSV
- `GET /api/export/login-records/pdf` - Export login records to PDF

## WebSocket Events

### Client → Server
- `join` - Join user-specific room
- `user_registered` - Broadcast new user registration
- `user_logged_in` - Broadcast user login
- `user_logged_out` - Broadcast user logout
- `profile_updated` - Broadcast profile update
- `user_role_changed` - Broadcast role change
- `user_deleted` - Broadcast user deletion

### Server → Client
- `new_user` - New user registered
- `user_activity` - User login/logout activity
- `profile_changed` - Profile updated
- `role_updated` - Role changed
- `user_list_updated` - User list changed

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend (server/.env)
```env
# Server
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dashpro_db
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRE=30d

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=DashPro <noreply@dashpro.com>

# Frontend
FRONTEND_URL=http://localhost:5173
```

## Testing the Integration

### 1. Start Backend
```bash
cd server
npm run dev
```

### 2. Start Frontend
```bash
npm run dev
```

### 3. Test Features
1. **Register** - Create a new account
2. **Login** - Login with credentials
3. **Dashboard** - View statistics
4. **Users** (Admin) - Manage users
5. **Theme Toggle** - Switch between light/dark mode
6. **Language** - Change language (EN/UR/AR)
7. **Real-time Updates** - Open two browser windows and see live updates

## Default Credentials

```
Email: admin@gmail.com
Password: admin
```

## Troubleshooting

### CORS Issues
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check CORS configuration in `server/src/server.js`

### WebSocket Connection Failed
- Verify backend is running on port 5000
- Check browser console for connection errors
- Ensure `VITE_API_URL` is correctly set

### Token Expired
- Tokens are automatically refreshed
- If refresh fails, user is redirected to login
- Check JWT secrets in backend `.env`

### API Calls Failing
- Verify backend is running
- Check network tab in browser DevTools
- Ensure API URL is correct in `.env`

## Production Deployment

### Frontend (Vercel/Netlify)
1. Update `VITE_API_URL` to production backend URL
2. Build: `npm run build`
3. Deploy `dist` folder

### Backend (Heroku/Railway)
1. Set all environment variables
2. Run migration: `npm run migrate`
3. Start: `npm start`

## Features Summary

✅ **Backend API Integration**
- RESTful API with Express
- PostgreSQL database
- JWT authentication
- Email notifications
- 2FA support
- CSV/PDF export
- WebSocket real-time updates

✅ **Frontend Features**
- API-based authentication
- Real-time updates via WebSocket
- Dark mode theme
- Multi-language support (EN/UR/AR)
- Responsive design
- Role-based access control

✅ **Security**
- JWT tokens with refresh
- Password hashing (bcrypt)
- Rate limiting
- CORS protection
- Helmet security headers
- SQL injection prevention

## Next Steps

1. **Test all features** - Ensure everything works correctly
2. **Customize translations** - Add more languages if needed
3. **Add more features** - Implement additional functionality
4. **Deploy to production** - Deploy both frontend and backend
5. **Monitor performance** - Track API response times and errors

---

**Integration Complete!** 🎉

Your DashPro application now has a fully functional backend API with real-time updates, dark mode, and multi-language support.
