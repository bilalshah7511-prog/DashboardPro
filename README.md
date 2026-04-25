# DashPro - Modern SaaS Dashboard

A production-ready SaaS Dashboard application built with React, Vite, Tailwind CSS, and Recharts.

![React](https://img.shields.io/badge/React-18.3.1-blue)
![Vite](https://img.shields.io/badge/Vite-5.2.8-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.3-cyan)
![License](https://img.shields.io/badge/License-MIT-green)

## 📖 Complete Documentation

For detailed project documentation, architecture, and learning guide, see:
**[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)**

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎯 Features Overview

### 🔐 Authentication & Authorization
- User registration and login
- Role-based access control (Admin/User)
- Protected routes
- Session management with LocalStorage

### 👥 User Management (Admin Only)
- View all registered users
- Add new users with profile images
- Edit user details (name, email, password, role)
- Delete users (cannot delete own account)
- Search and filter users by name/email/role
- Quick profile image updates

### 📊 Dashboard
- Real-time statistics cards
- Clickable login stats with detailed modal
- Role-specific data views
- Profile editing with image upload
- Account information display

### 📈 Analytics
- Daily login activity (Line Chart)
- Monthly login trends (Bar Chart)
- User activity overview (Admin only)
- Recent login history table
- Responsive Recharts visualizations

### 🔍 Login Tracking
- Automatic login recording with timestamps
- Advanced filtering:
  - Search by user name/email
  - Date filters (Today, Yesterday, Week, Month)
  - Custom date/time range picker
  - Sort by newest/oldest
- Clear filters button
- Owner admin logins not tracked

### 🖼️ User Profiles Gallery
- Beautiful card-based layout
- Profile images with gradient headers
- Gender, role, and join date display
- Responsive grid (1-4 columns)
- Excludes current logged-in admin

### 🎨 UI/UX Features
- Modern, clean design with Tailwind CSS
- Fully responsive (mobile, tablet, desktop)
- Collapsible sidebar on mobile
- Navbar profile dropdown
- Smooth animations and transitions
- Loading states
- Professional Material Design icons

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 18** | UI library with hooks |
| **Vite** | Fast build tool and dev server |
| **Tailwind CSS** | Utility-first CSS framework |
| **React Router DOM** | Client-side routing |
| **Context API** | Global state management |
| **Recharts** | Data visualization charts |
| **React Icons** | Professional icon library |
| **LocalStorage** | Browser-based data persistence |

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AddUserModal.jsx
│   ├── DashboardLayout.jsx
│   ├── EditProfileModal.jsx
│   ├── EditUserModal.jsx
│   ├── LoginDetailsModal.jsx
│   ├── Navbar.jsx
│   ├── Sidebar.jsx
│   └── StatsCard.jsx
├── pages/              # Page components
│   ├── Analytics.jsx
│   ├── Dashboard.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── UserGallery.jsx
│   └── Users.jsx
├── context/            # State management
│   └── AuthContext.jsx
├── routes/             # Routing configuration
│   ├── AppRoutes.jsx
│   └── ProtectedRoute.jsx
├── utils/              # Helper functions
│   └── storage.js
├── App.jsx
├── main.jsx
└── index.css
```

## 🔑 Default Credentials

### Owner Admin Account
- **Email**: `admin@gmail.com`
- **Password**: `admin`

### Create New User
Use the signup page or admin "Add User" feature.

## 👤 User Roles

### Admin
- Full access to all features
- User management (add, edit, delete, promote)
- View all users and analytics
- Access to Profiles gallery
- Can promote other users to admin

### User
- Personal dashboard
- Edit own profile
- View own login history
- View own analytics
- Cannot access user management

## 🎨 Key Features Explained

### Multi-Admin Support
- Any user can be promoted to admin role
- Promoted admins get full admin functionality
- Owner admin (admin@gmail.com) login activity not tracked
- Each admin can manage all users except themselves

### Profile Management
- Upload profile images (max 2MB)
- Edit name, gender, password
- Admins can change email addresses
- Users cannot change their own email
- Profile images stored as base64 in LocalStorage

### Advanced Login Filtering
- **Search**: Filter by user name or email
- **Date Filters**: Today, Yesterday, Last 7 Days, Last 30 Days
- **Custom Range**: Select specific date/time range (e.g., 2:00 PM - 3:00 PM on 04/25/2026)
- **Sort**: Newest first or oldest first
- **Clear**: One-click reset all filters

### Responsive Design
- **Mobile**: Single column, collapsible sidebar
- **Tablet**: 2-3 columns, optimized layout
- **Desktop**: 4 columns, full sidebar
- **Large Screens**: Maximum 5 columns in gallery

## 🔒 Security Features

- Protected routes (redirect to login if not authenticated)
- Role-based access control
- Admin-only routes
- Cannot delete own account
- Password validation (minimum 6 characters)
- Email uniqueness check
- Input validation on all forms

## 📊 Data Storage

All data is stored in browser's LocalStorage:

```javascript
{
  users: [
    {
      id: "1714056000000",
      name: "John Doe",
      email: "john@example.com",
      password: "password123",
      role: "user",
      gender: "Male",
      profileImage: "data:image/png;base64,...",
      createdAt: "2026-04-25T10:00:00.000Z"
    }
  ],
  currentUser: { /* logged-in user object */ },
  loginRecords: [
    {
      id: "1714056100000",
      userId: "1714056000000",
      timestamp: "2026-04-25T10:01:00.000Z"
    }
  ]
}
```

## 🚀 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import repository
4. Vercel auto-detects Vite configuration
5. Click Deploy

### Deploy to Netlify

1. Push code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Import repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Click Deploy

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🎓 Learning Resources

This project demonstrates:
- React functional components and hooks
- Context API for state management
- React Router for navigation
- Tailwind CSS for styling
- LocalStorage for data persistence
- Form handling and validation
- File upload and base64 encoding
- Array methods for data manipulation
- Conditional rendering
- Protected routes
- Role-based access control

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start dev server at http://localhost:5173

# Production
npm run build        # Build for production
npm run preview      # Preview production build

# Dependencies
npm install          # Install all dependencies
```

## 🔧 Configuration Files

- `vite.config.js` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `package.json` - Dependencies and scripts

## 🐛 Known Limitations

- Data stored in LocalStorage (cleared when browser cache is cleared)
- No backend API (all data is client-side)
- No email verification
- No password recovery
- Image size limited to 2MB
- No real-time updates across tabs

## 🔮 Future Enhancements

- Backend API integration (Node.js/Express)
- Database integration (MongoDB/PostgreSQL)
- JWT authentication
- Email notifications
- Password reset functionality
- Two-factor authentication
- Export data to CSV/PDF
- Real-time updates with WebSockets
- Dark mode
- Multi-language support

## 📄 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🤝 Contributing

This is a learning project. Feel free to fork and modify as needed.

## 📞 Support

For detailed documentation, see [PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)

---

**Built with ❤️ using React, Vite, and Tailwind CSS**

**Created**: April 2026
**Version**: 1.0.0
