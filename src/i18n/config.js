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
      myLogins: 'My Logins',
      accountStatus: 'Account Status',
      active: 'Active',
      adminPanel: 'Admin Panel',
      profiles: 'Profiles',

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
      noBlogs: 'No blogs found',
      noBlogsDesc: 'There are no blogs to display at the moment.',
      noStatusBlogs: 'No {{status}} blogs',
      noStatusBlogsDesc: 'There are no blogs with {{status}} status at the moment.',

      // Messages
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
      confirmDelete: 'Are you sure you want to delete this?',
      confirmDeleteBlog: 'Are you sure you want to delete this blog permanently?',
      confirmReject: 'Are you sure you want to reject this blog?',

      // Stats
      loginCount: 'Login Count',
      lastLogin: 'Last Login',
      createdAt: 'Created At',
      updatedAt: 'Updated At',

      // Blogs
      blogs: 'Blogs',
      blogManagement: 'Blog Management',
      allBlogs: 'All Blogs',
      myBlogs: 'My Blogs',
      all: 'All',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      createBlog: 'Create Blog',
      editBlog: 'Edit Blog',
      deleteBlog: 'Delete Blog',
      blogTitle: 'Title',
      blogDescription: 'Description',
      featuredImage: 'Featured Image',
      tags: 'Tags',
      readAndShare: 'Read and share your thoughts',
      reviewAndManage: 'Review and manage user blogs',
      imageSizeError: 'Image size should be less than 5MB',
      requiredFields: 'Title and description are required',
      clickToUpload: 'Click to upload image',
      enterBlogTitle: 'Enter blog title',
      writeContent: 'Write your blog content here...',
      tagsPlaceholder: 'e.g. technology, programming, web development',
      separateTags: 'Separate tags with commas',
      approvalNotice: 'Your blog will be sent to admin for approval before it\'s published.',

      // Analytics
      dailyLoginActivity: 'Daily Login Activity',
      monthlyLoginTrends: 'Monthly Login Trends',
      userActivityOverview: 'User Activity Overview',
      recentLoginHistory: 'Recent Login History',
      dateAndTime: 'Date & Time',
      ipAddress: 'IP Address',
      status: 'Status',
      success: 'Success',
      yourLoginActivity: 'Your login activity',
      allUserActivity: 'Overview of all user activity'
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
      myLogins: 'میرے لاگ ان',
      accountStatus: 'اکاؤنٹ کی حالت',
      active: 'فعال',
      adminPanel: 'ایڈمن پینل',
      profiles: 'پروفائلز',

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
      noBlogs: 'کوئی بلاگز نہیں ملے',
      noBlogsDesc: 'اس وقت کوئی بلاگز دکھانے کے لیے موجود نہیں ہیں۔',
      noStatusBlogs: 'کوئی {{status}} بلاگز نہیں',
      noStatusBlogsDesc: 'اس وقت {{status}} حالت میں کوئی بلاگز موجود نہیں ہیں۔',

      // Messages
      success: 'کامیابی',
      error: 'خرابی',
      warning: 'انتباہ',
      info: 'معلومات',
      confirmDelete: 'کیا آپ واقعی اسے حذف کرنا چاہتے ہیں؟',
      confirmDeleteBlog: 'کیا آپ واقعی اس بلاگ کو مستقل طور پر حذف کرنا چاہتے ہیں؟',
      confirmReject: 'کیا آپ واقعی اس بلاگ کو مسترد کرنا چاہتے ہیں؟',

      // Stats
      loginCount: 'لاگ ان کی تعداد',
      lastLogin: 'آخری لاگ ان',
      createdAt: 'بنایا گیا',
      updatedAt: 'اپ ڈیٹ کیا گیا',

      // Blogs
      blogs: 'بلاگز',
      blogManagement: 'بلاگ کا انتظام',
      allBlogs: 'تمام بلاگز',
      myBlogs: 'میرے بلاگز',
      all: 'تمام',
      pending: 'زیر التواء',
      approved: 'منظور شدہ',
      rejected: 'مسترد',
      createBlog: 'بلاگ بنائیں',
      editBlog: 'بلاگ میں ترمیم کریں',
      deleteBlog: 'بلاگ حذف کریں',
      blogTitle: 'عنوان',
      blogDescription: 'تفصیل',
      featuredImage: 'نمایاں تصویر',
      tags: 'ٹیگز',
      readAndShare: 'پڑھیں اور اپنے خیالات شیئر کریں',
      reviewAndManage: 'صارف کے بلاگز کا جائزہ لیں اور انتظام کریں',
      imageSizeError: 'تصویر کا سائز 5MB سے کم ہونا چاہیے',
      requiredFields: 'عنوان اور تفصیل ضروری ہیں',
      clickToUpload: 'تصویر اپ لوڈ کرنے کے لیے کلک کریں',
      enterBlogTitle: 'بلاگ کا عنوان درج کریں',
      writeContent: 'اپنا بلاگ مواد یہاں لکھیں...',
      tagsPlaceholder: 'مثلاً: ٹیکنالوجی، پروگرامنگ، ویب ڈویلپمنٹ',
      separateTags: 'ٹیگز کوما سے الگ کریں',
      approvalNotice: 'آپ کا بلاگ شائع ہونے سے پہلے ایڈمن کی منظوری کے لیے بھیجا جائے گا۔',

      // Analytics
      dailyLoginActivity: 'روزانہ لاگ ان کی سرگرمی',
      monthlyLoginTrends: 'ماہانہ لاگ ان کی رجحانات',
      userActivityOverview: 'صارف کی سرگرمی کا جائزہ',
      recentLoginHistory: 'حالیہ لاگ ان کی تاریخ',
      dateAndTime: 'تاریخ اور وقت',
      ipAddress: 'آئی پی ایڈریس',
      status: 'حالت',
      yourLoginActivity: 'آپ کی لاگ ان سرگرمی',
      allUserActivity: 'تمام صارفین کی سرگرمی کا جائزہ'
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
      myLogins: 'تسجيلات دخولي',
      accountStatus: 'حالة الحساب',
      active: 'نشط',
      adminPanel: 'لوحة الإدارة',
      profiles: 'الملفات الشخصية',

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
      noBlogs: 'لم يتم العثور على مدونات',
      noBlogsDesc: 'لا توجد مدونات للعرض في الوقت الحالي.',
      noStatusBlogs: 'لا توجد مدونات {{status}}',
      noStatusBlogsDesc: 'لا توجد مدونات بحالة {{status}} في الوقت الحالي.',

      // Messages
      success: 'نجاح',
      error: 'خطأ',
      warning: 'تحذير',
      info: 'معلومات',
      confirmDelete: 'هل أنت متأكد أنك تريد حذف هذا؟',
      confirmDeleteBlog: 'هل أنت متأكد أنك تريد حذف هذه المدونة بشكل دائم؟',
      confirmReject: 'هل أنت متأكد أنك تريد رفض هذه المدونة؟',

      // Stats
      loginCount: 'عدد تسجيلات الدخول',
      lastLogin: 'آخر تسجيل دخول',
      createdAt: 'تم الإنشاء في',
      updatedAt: 'تم التحديث في',

      // Blogs
      blogs: 'المدونات',
      blogManagement: 'إدارة المدونات',
      allBlogs: 'جميع المدونات',
      myBlogs: 'مدوناتي',
      all: 'الكل',
      pending: 'معلق',
      approved: 'تمت الموافقة',
      rejected: 'مرفوض',
      createBlog: 'إنشاء مدونة',
      editBlog: 'تعديل المدونة',
      deleteBlog: 'حذف المدونة',
      blogTitle: 'العنوان',
      blogDescription: 'الوصف',
      featuredImage: 'الصورة المميزة',
      tags: 'الوسوم',
      readAndShare: 'اقرأ وشارك أفكارك',
      reviewAndManage: 'راجع وأدر مدونات المستخدمين',
      imageSizeError: 'يجب أن يكون حجم الصورة أقل من 5 ميجابايت',
      requiredFields: 'العنوان والوصف مطلوبان',
      clickToUpload: 'انقر لتحميل الصورة',
      enterBlogTitle: 'أدخل عنوان المدونة',
      writeContent: 'اكتب محتوى مدونتك هنا...',
      tagsPlaceholder: 'مثال: تقنية، برمجة، تطوير الويب',
      separateTags: 'افصل الوسوم بفواصل',
      approvalNotice: 'سيتم إرسال مدونتك إلى المسؤول للموافقة عليها قبل نشرها.',

      // Analytics
      dailyLoginActivity: 'نشاط تسجيل الدخول اليومي',
      monthlyLoginTrends: 'اتجاهات تسجيل الدخول الشهرية',
      userActivityOverview: 'نظرة عامة على نشاط المستخدمين',
      recentLoginHistory: 'سجل تسجيلات الدخول الأخيرة',
      dateAndTime: 'التاريخ والوقت',
      ipAddress: 'عنوان IP',
      status: 'الحالة',
      yourLoginActivity: 'نشاط تسجيل دخولك',
      allUserActivity: 'نظرة عامة على نشاط جميع المستخدمين'
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
