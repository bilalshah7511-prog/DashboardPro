import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  en: {
    translation: {
      // Navigation
      dashboard: 'Dashboard',
      users: 'Users',
      analytics: 'Analytics',
      settings: 'Settings',
      logout: 'Logout',

      // Auth
      login: 'Login',
      signup: 'Sign Up',
      email: 'Email',
      password: 'Password',
      name: 'Name',
      gender: 'Gender',
      male: 'Male',
      female: 'Female',
      other: 'Other',
      alreadyHaveAccount: 'Already have an account?',
      dontHaveAccount: "Don't have an account?",

      // Dashboard
      totalUsers: 'Total Users',
      totalLogins: 'Total Logins',
      activeUsers: 'Active Users',
      systemHealth: 'System Health',
      welcomeBack: 'Welcome back',
      recentActivity: 'Recent Activity',

      // Users
      userManagement: 'User Management',
      addUser: 'Add User',
      editUser: 'Edit User',
      deleteUser: 'Delete User',
      searchUsers: 'Search users...',
      role: 'Role',
      admin: 'Admin',
      user: 'User',
      actions: 'Actions',

      // Profile
      profile: 'Profile',
      editProfile: 'Edit Profile',
      updateProfile: 'Update Profile',
      changePassword: 'Change Password',
      profileImage: 'Profile Image',

      // Common
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      search: 'Search',
      filter: 'Filter',
      export: 'Export',
      import: 'Import',
      loading: 'Loading...',
      noData: 'No data available',

      // Messages
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
      confirmDelete: 'Are you sure you want to delete this?',

      // Stats
      loginCount: 'Login Count',
      lastLogin: 'Last Login',
      createdAt: 'Created At',
      updatedAt: 'Updated At'
    }
  },
  ur: {
    translation: {
      // Navigation
      dashboard: 'ڈیش بورڈ',
      users: 'صارفین',
      analytics: 'تجزیات',
      settings: 'ترتیبات',
      logout: 'لاگ آؤٹ',

      // Auth
      login: 'لاگ ان',
      signup: 'سائن اپ',
      email: 'ای میل',
      password: 'پاس ورڈ',
      name: 'نام',
      gender: 'جنس',
      male: 'مرد',
      female: 'عورت',
      other: 'دیگر',
      alreadyHaveAccount: 'پہلے سے اکاؤنٹ ہے؟',
      dontHaveAccount: 'اکاؤنٹ نہیں ہے؟',

      // Dashboard
      totalUsers: 'کل صارفین',
      totalLogins: 'کل لاگ ان',
      activeUsers: 'فعال صارفین',
      systemHealth: 'سسٹم کی صحت',
      welcomeBack: 'خوش آمدید',
      recentActivity: 'حالیہ سرگرمی',

      // Users
      userManagement: 'صارف کا انتظام',
      addUser: 'صارف شامل کریں',
      editUser: 'صارف میں ترمیم کریں',
      deleteUser: 'صارف کو حذف کریں',
      searchUsers: 'صارفین تلاش کریں...',
      role: 'کردار',
      admin: 'ایڈمن',
      user: 'صارف',
      actions: 'اعمال',

      // Profile
      profile: 'پروفائل',
      editProfile: 'پروفائل میں ترمیم',
      updateProfile: 'پروفائل اپ ڈیٹ کریں',
      changePassword: 'پاس ورڈ تبدیل کریں',
      profileImage: 'پروفائل تصویر',

      // Common
      save: 'محفوظ کریں',
      cancel: 'منسوخ کریں',
      delete: 'حذف کریں',
      edit: 'ترمیم کریں',
      view: 'دیکھیں',
      search: 'تلاش کریں',
      filter: 'فلٹر',
      export: 'برآمد کریں',
      import: 'درآمد کریں',
      loading: 'لوڈ ہو رہا ہے...',
      noData: 'کوئی ڈیٹا دستیاب نہیں',

      // Messages
      success: 'کامیابی',
      error: 'خرابی',
      warning: 'انتباہ',
      info: 'معلومات',
      confirmDelete: 'کیا آپ واقعی اسے حذف کرنا چاہتے ہیں؟',

      // Stats
      loginCount: 'لاگ ان کی تعداد',
      lastLogin: 'آخری لاگ ان',
      createdAt: 'بنایا گیا',
      updatedAt: 'اپ ڈیٹ کیا گیا'
    }
  },
  ar: {
    translation: {
      // Navigation
      dashboard: 'لوحة القيادة',
      users: 'المستخدمون',
      analytics: 'التحليلات',
      settings: 'الإعدادات',
      logout: 'تسجيل الخروج',

      // Auth
      login: 'تسجيل الدخول',
      signup: 'التسجيل',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      name: 'الاسم',
      gender: 'الجنس',
      male: 'ذكر',
      female: 'أنثى',
      other: 'آخر',
      alreadyHaveAccount: 'هل لديك حساب بالفعل؟',
      dontHaveAccount: 'ليس لديك حساب؟',

      // Dashboard
      totalUsers: 'إجمالي المستخدمين',
      totalLogins: 'إجمالي تسجيلات الدخول',
      activeUsers: 'المستخدمون النشطون',
      systemHealth: 'صحة النظام',
      welcomeBack: 'مرحبا بعودتك',
      recentActivity: 'النشاط الأخير',

      // Users
      userManagement: 'إدارة المستخدمين',
      addUser: 'إضافة مستخدم',
      editUser: 'تعديل المستخدم',
      deleteUser: 'حذف المستخدم',
      searchUsers: 'البحث عن المستخدمين...',
      role: 'الدور',
      admin: 'مسؤول',
      user: 'مستخدم',
      actions: 'الإجراءات',

      // Profile
      profile: 'الملف الشخصي',
      editProfile: 'تعديل الملف الشخصي',
      updateProfile: 'تحديث الملف الشخصي',
      changePassword: 'تغيير كلمة المرور',
      profileImage: 'صورة الملف الشخصي',

      // Common
      save: 'حفظ',
      cancel: 'إلغاء',
      delete: 'حذف',
      edit: 'تعديل',
      view: 'عرض',
      search: 'بحث',
      filter: 'تصفية',
      export: 'تصدير',
      import: 'استيراد',
      loading: 'جاري التحميل...',
      noData: 'لا توجد بيانات متاحة',

      // Messages
      success: 'نجاح',
      error: 'خطأ',
      warning: 'تحذير',
      info: 'معلومات',
      confirmDelete: 'هل أنت متأكد أنك تريد حذف هذا؟',

      // Stats
      loginCount: 'عدد تسجيلات الدخول',
      lastLogin: 'آخر تسجيل دخول',
      createdAt: 'تم الإنشاء في',
      updatedAt: 'تم التحديث في'
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  })

export default i18n
