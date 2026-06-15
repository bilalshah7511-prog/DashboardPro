# DashPro - Modern SaaS Dashboard

A production-ready SaaS Dashboard application built with React, Vite, Tailwind CSS, and Recharts.

![React](https://img.shields.io/badge/React-18.3.1-blue)
![Vite](https://img.shields.io/badge/Vite-5.2.8-purple)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4.3-cyan)
![License](https://img.shields.io/badge/License-MIT-green)

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
- **Email**: `example@gmail.com`
- **Password**: `abcd`
- 
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
- Owner admin login activity not tracked
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


```

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

## 🔧 Configuration Files

- `vite.config.js` - Vite configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `package.json` - Dependencies and scripts

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

---

**Built with ❤️ using React, Vite, and Tailwind CSS**

**Created**: April 2026
**Version**: 1.0.0
