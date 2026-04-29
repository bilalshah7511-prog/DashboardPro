# Folder Structure - Atomic Design Pattern

This project follows the **Atomic Design** methodology for organizing React components.

## Complete Structure Overview

```
src/
├── components/                 # UI Components (Atomic Design)
│   ├── atoms/                  # Basic building blocks
│   │   ├── buttons/            # Button components
│   │   │   ├── Button.jsx
│   │   │   └── IconButton.jsx
│   │   ├── inputs/             # Input components
│   │   │   ├── Input.jsx
│   │   │   ├── TextArea.jsx
│   │   │   └── SearchInput.jsx
│   │   ├── loaders/            # Loading states (from skeletons)
│   │   │   ├── Spinner.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   └── index.js
│   │   ├── icons/              # Icon components
│   │   │   └── AppIcon.jsx
│   │   ├── StatsCard.jsx       # Stats card atom
│   │   └── index.js            # Atoms exports
│   ├── molecules/              # Simple component groups
│   │   ├── ConfirmModal.jsx    # Confirmation modal
│   │   ├── Modal.jsx           # Base modal
│   │   ├── BlogCard.jsx        # Blog card
│   │   ├── UserCard.jsx        # User card
│   │   ├── CommentCard.jsx     # Comment card
│   │   ├── forms/              # Form molecules
│   │   │   ├── LoginForm.jsx
│   │   │   └── SearchBar.jsx
│   │   ├── navigation/         # Navigation molecules
│   │   │   ├── NavLink.jsx
│   │   │   └── Breadcrumb.jsx
│   │   └── index.js            # Molecules exports
│   ├── organisms/              # Complex components
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── Sidebar.jsx         # Side navigation
│   │   ├── DashboardLayout.jsx # Layout wrapper
│   │   ├── Footer.jsx          # Footer
│   │   ├── BlogList.jsx        # Blog list
│   │   ├── UserList.jsx        # User list
│   │   ├── CommentSection.jsx  # Comments section
│   │   ├── AddUserModal.jsx    # Add user modal
│   │   ├── EditUserModal.jsx   # Edit user modal
│   │   ├── CreateBlogModal.jsx # Create blog modal
│   │   ├── EditBlogModal.jsx   # Edit blog modal
│   │   ├── EditProfileModal.jsx# Edit profile modal
│   │   ├── LoginDetailsModal.jsx
│   │   └── index.js            # Organisms exports
│   ├── templates/              # Page-level layouts
│   │   ├── AdminDashboardTemplate.jsx
│   │   ├── UserDashboardTemplate.jsx
│   │   ├── BlogDetailTemplate.jsx
│   │   ├── AuthTemplate.jsx
│   │   └── index.js            # Templates exports
│   └── index.js                # All components exports
├── pages/                      # Route pages
├── skeletons/                  # Deprecated (moved to atoms/loaders)
├── services/                   # API services
├── context/                    # React contexts
├── hooks/                      # Custom hooks
├── i18n/                       # Translations
├── routes/                     # Route definitions
├── utils/                      # Utility functions
└── FOLDER_STRUCTURE.md         # This file
```

## Atomic Design Principles

### 1. Atoms ⚛️
Smallest building blocks, can't be broken down further.
- `StatsCard.jsx` - Simple card showing a stat number
- Buttons, Inputs, Icons (when created)

### 2. Molecules 🧬
Groups of atoms working together.
- `ConfirmModal.jsx` - Modal with icon, text, buttons
- Form groups, Search bars

### 3. Organisms 🦠
Complex components combining molecules and atoms.
- `Navbar.jsx` - Logo, navigation, user menu
- `Sidebar.jsx` - Menu items, icons, navigation
- `DashboardLayout.jsx` - Layout structure

### 4. Templates 📐
Page-level layouts (placeholders in this project).

### 5. Pages 📄
Route-based components in `src/pages/`.

## Usage Examples

### Import from centralized index
```jsx
import { ConfirmModal, StatsCard } from '../components'
```

### Import specific category
```jsx
import ConfirmModal from '../components/molecules/ConfirmModal'
import StatsCard from '../components/atoms/StatsCard'
```

### Import skeletons
```jsx
import { EmptyState, BlogCardSkeletonGrid } from '../skeletons'
```

## Benefits

1. **Scalable** - Easy to add new components
2. **Maintainable** - Clear organization
3. **Reusable** - Components are modular
4. **Team-friendly** - Clear structure for collaboration
5. **Self-documenting** - Structure explains hierarchy
