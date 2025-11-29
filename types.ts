

export type Language = 'en' | 'ar' | 'ku';

export interface Doctor {
  id: string;
  name: string;
}

export interface Appointment {
  id: string;
  patientId: string; // If empty string, it's a guest
  patientName: string;
  date: string; // ISO string
  time: string;
  duration?: number; // minutes
  treatmentType?: string;
  sessionNumber?: number;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'noshow';
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  description: string;
  type: 'payment' | 'charge'; // Payment = patient paid, Charge = cost of service
}

export interface Tooth {
  id: number; 
  status: 'healthy' | 'decay' | 'filled' | 'missing' | 'crown' | 'rct' | 'extraction' | 'bridge' | 'veneer';
  notes?: string;
}

export interface RootCanalEntry {
  id: string;
  toothNumber: string;
  canalName: string; // MB, DB, P, etc.
  length: string; // mm
  date: string;
}

export interface TreatmentSession {
  id: string;
  date: string;
  description: string;
}

export interface Medication {
  id: string;
  name: string;
  dose: string; // e.g. 500mg
  frequency: string; // e.g. 3 times a day
  form: string; // e.g. cap, tab, syr (New Field)
  notes?: string; // e.g. After food (New Field)
}

export interface Prescription {
  id: string;
  date: string;
  medications: Medication[];
  notes?: string;
}

export interface SupplyItem {
  id: string;
  name: string;
  quantity: number;
}

export type PatientCategory = 'diagnosis' | 'rct' | 'implant' | 'crown' | 'surgery' | 'ortho' | 'other';

export interface Patient {
  id: string;
  name: string;
  phone: string;
  phoneCode?: string; // New field for country code
  age: number;
  gender: 'male' | 'female';
  category?: PatientCategory;
  address?: string;
  medicalHistory: string;
  status: 'active' | 'finished' | 'pending' | 'discontinued'; 
  doctorId: string;
  createdAt: string; // Registration Date
  teeth: Record<number, Tooth>;
  appointments: Appointment[];
  payments: Payment[];
  notes: string;
  rootCanals: RootCanalEntry[];
  treatmentSessions: TreatmentSession[];
  prescriptions: Prescription[];
}

export interface Memo {
  id: string;
  title: string;
  content: string;
  color: string; // tailwind class for background
  date: string;
}

export interface ClinicData {
  clinicName: string;
  doctors: Doctor[];
  patients: Patient[];
  guestAppointments: Appointment[]; // Appointments for non-registered patients
  memos: Memo[];
  supplies: SupplyItem[]; // New Field
  medications: Medication[]; // Master list of meds
  settings: {
    language: Language;
    theme: 'light' | 'dark';
    currency: string;
    defaultCountryCode: string;
    isLoggedIn: boolean; // New Login Persistency Flag
    rxBackgroundImage?: string; // URL for Rx Print Background
  };
  lastSynced?: string;
}

export const INITIAL_DATA: ClinicData = {
  clinicName: "",
  doctors: [],
  patients: [],
  guestAppointments: [],
  memos: [],
  supplies: [],
  medications: [
    { id: '1', name: 'Amoxicillin', dose: '500mg', frequency: '3 times daily', form: 'cap' },
    { id: '2', name: 'Ibuprofen', dose: '400mg', frequency: 'When needed', form: 'tab', notes: 'After food' },
    { id: '3', name: 'Paracetamol', dose: '500mg', frequency: 'Every 6 hours', form: 'tab' },
    { id: '4', name: 'Metronidazole', dose: '500mg', frequency: '3 times daily', form: 'tab' },
    { id: '5', name: 'Augmentin', dose: '625mg', frequency: '2 times daily', form: 'tab' },
  ],
  settings: {
    language: 'ar',
    theme: 'light',
    currency: 'USD',
    defaultCountryCode: '+964', // Default to Iraq
    isLoggedIn: false,
    rxBackgroundImage: ''
  }
};

export const LABELS = {
  en: {
    dashboard: "Dashboard",
    patients: "Patients",
    memos: "Memos",
    calendar: "Calendar",
    finance: "Finance",
    settings: "Settings",
    purchases: "Purchases",
    clinicName: "Clinic Name",
    doctors: "Doctors",
    addDoctor: "Add Doctor",
    selectDoctor: "Select Doctor",
    searchPatients: "Search patients...",
    active: "Active",
    finished: "Finished",
    pending: "Pending",
    discontinued: "Discontinued",
    newPatient: "New Patient",
    name: "Name",
    phone: "Phone",
    age: "Age",
    gender: "Gender",
    male: "Male",
    female: "Female",
    notes: "Notes",
    medicalHistory: "Medical History",
    save: "Save",
    cancel: "Cancel",
    payments: "Payments",
    appointments: "Appointments",
    totalPaid: "Total Paid",
    totalCost: "Total Cost",
    remaining: "Remaining",
    addPayment: "Add Payment",
    addCharge: "Add Charge",
    printPrescription: "Print Prescription",
    printInvoice: "Print Invoice",
    whatsapp: "WhatsApp",
    images: "X-Rays & Images",
    upload: "Upload",
    logout: "Logout",
    welcome: "Welcome to Dentro",
    loginWithGoogle: "Login with Google",
    clinicSetup: "Clinic Setup",
    enterClinicName: "Enter Clinic Name",
    teethChart: "Teeth Chart",
    contactDeveloper: "Developer Contact",
    darkMode: "Dark Mode",
    language: "Language",
    backup: "Download Backup",
    import: "Import Data",
    morning: "AM",
    night: "PM",
    deletePatient: "Delete Patient",
    confirmDelete: "Are you sure you want to delete this patient?",
    address: "Address",
    overview: "Overview",
    files: "Files",
    treatment: "Treatment",
    visitHistory: "Visits",
    financials: "Financials",
    backToPatients: "Back to Patients",
    selectCountry: "Select Country",
    editPatient: "Edit Details",
    registrationDate: "Registered",
    rct: "Root Canal Data",
    sessions: "Treatment Sessions",
    addSession: "Add Session",
    tooth: "Tooth",
    canal: "Canal",
    length: "Length (mm)",
    addRCT: "Add Canal",
    month: "Month",
    week: "Week",
    day: "Day",
    today: "Today",
    newMemo: "New Memo",
    editMemo: "Edit Memo",
    memoTitle: "Title",
    memoContent: "Write your note here...",
    pickColor: "Pick Color",
    category: "Category",
    treatingDoctor: "Treating Doctor",
    setupStep1: "Welcome! Let's set up your clinic.",
    setupStep2: "Now, add the doctors who work here.",
    startApp: "Start Application",
    manageDoctors: "Manage Doctors",
    editClinicName: "Edit Clinic Name",
    treatmentType: "Treatment Type",
    sessionNumber: "Session No.",
    duration: "Duration",
    min: "min",
    session: "Session",
    prescriptions: "Prescriptions",
    newPrescription: "New Prescription",
    drugName: "Drug Name",
    dose: "Dose",
    frequency: "Frequency",
    form: "Form",
    medNotes: "Notes (Optional)",
    addMedication: "Add Medication",
    addMasterDrug: "Add New Drug",
    rxList: "Prescription List",
    print: "Print",
    itemName: "Item Name",
    quantity: "Quantity",
    addItem: "Add Item",
    editItem: "Edit Item",
    installApp: "Install App",
    installDesc: "Install on your device",
    syncing: "Syncing...",
    synced: "Data Synced",
    syncError: "Sync Error",
    landingTitle: "Dentro",
    landingSubtitle: "The complete solution for modern dental clinics.",
    login: "Login",
    requestTrial: "Request Trial / Subscription",
    pricing: "Pricing Plans",
    filter: "Filter",
    ageGroup: "Age Group",
    under18: "Under 18",
    from18to35: "18 - 35",
    over35: "Over 35",
    applyFilters: "Apply Filters",
    clearFilters: "Clear",
    status: "Status",
    completed: "Completed",
    noShow: "No Show",
    none: "None",
    existingPatient: "Existing Patient",
    quickNewPatient: "Guest Appointment",
    addAppointment: "Add Appointment",
    description: "Description",
    addToPatients: "Add to Patients",
    convertGuestTitle: "Convert to Patient",
    rxBgUrl: "Rx Background URL (A5)",
    enterRxUrl: "Enter image URL for A5 print background"
  },
  ar: {
    dashboard: "لوحة التحكم",
    patients: "المرضى",
    memos: "المذكرات",
    calendar: "التقويم",
    finance: "المالية",
    settings: "الإعدادات",
    purchases: "المشتريات",
    clinicName: "اسم العيادة",
    doctors: "الأطباء",
    addDoctor: "إضافة طبيب",
    selectDoctor: "اختر الطبيب",
    searchPatients: "بحث عن مريض...",
    active: "مستمر بالعلاج",
    finished: "منتهي",
    pending: "لم يبدأ",
    discontinued: "لم يستمر",
    newPatient: "مريض جديد",
    name: "الاسم الكامل",
    phone: "رقم الهاتف",
    age: "العمر",
    gender: "الجنس",
    male: "ذكر",
    female: "أنثى",
    notes: "الملاحظات",
    medicalHistory: "التاريخ الطبي",
    save: "حفظ البيانات",
    cancel: "إلغاء",
    payments: "الدفعات",
    appointments: "المواعيد",
    totalPaid: "الواصل",
    totalCost: "الكلي",
    remaining: "المتبقي",
    addPayment: "إضافة دفعة",
    addCharge: "إضافة تكلفة علاج",
    printPrescription: "طباعة وصفة",
    printInvoice: "طباعة وصل",
    whatsapp: "واتساب",
    images: "الأشعة والصور",
    upload: "رفع صورة",
    logout: "تسجيل خروج",
    welcome: "مرحباً بك في Dentro",
    loginWithGoogle: "تسجيل الدخول عبر Google",
    clinicSetup: "إعداد العيادة",
    enterClinicName: "أدخل اسم العيادة",
    teethChart: "مخطط الأسنان",
    contactDeveloper: "تواصل مع المطور",
    darkMode: "الوضع الليلي",
    language: "اللغة",
    backup: "نسخ احتياطي",
    import: "استيراد بيانات",
    morning: "صباحاً",
    night: "مساءً",
    deletePatient: "حذف المريض",
    confirmDelete: "هل أنت متأكد من حذف هذا المريض وكل بياناته؟",
    address: "العنوان",
    overview: "نظرة عامة",
    files: "الملفات",
    treatment: "العلاج",
    visitHistory: "الزيارات",
    financials: "الحسابات",
    backToPatients: "العودة للقائمة",
    selectCountry: "اختر الدولة",
    editPatient: "تعديل المعلومات",
    registrationDate: "تاريخ التسجيل",
    rct: "قياسات القنوات (RCT)",
    sessions: "جلسات العلاج",
    addSession: "إضافة جلسة",
    tooth: "السن",
    canal: "القناة",
    length: "الطول (ملم)",
    addRCT: "إضافة قناة",
    month: "شهر",
    week: "أسبوع",
    day: "يوم",
    today: "اليوم",
    newMemo: "مذكرة جديدة",
    editMemo: "تعديل المذكرة",
    memoTitle: "العنوان",
    memoContent: "اكتب ملاحظتك هنا...",
    pickColor: "اختر لوناً",
    category: "التصنيف",
    treatingDoctor: "الطبيب المعالج",
    setupStep1: "مرحباً! لنقم بإعداد عيادتك.",
    setupStep2: "الآن، أضف أسماء الأطباء العاملين.",
    startApp: "بدء التطبيق",
    manageDoctors: "إدارة الأطباء",
    editClinicName: "تعديل اسم العيادة",
    treatmentType: "نوع العلاج",
    sessionNumber: "رقم الجلسة",
    duration: "مدة الجلسة",
    min: "دقيقة",
    session: "جلسة",
    prescriptions: "الوصفات",
    newPrescription: "وصفة جديدة",
    drugName: "اسم العلاج",
    dose: "الجرعة",
    frequency: "التكرار",
    form: "الشكل",
    medNotes: "ملاحظات (اختياري)",
    addMedication: "إضافة دواء للوصفة",
    addMasterDrug: "إضافة دواء جديد",
    rxList: "قائمة الوصفات",
    print: "طباعة",
    itemName: "اسم المادة",
    quantity: "العدد",
    addItem: "إضافة مادة",
    editItem: "تعديل مادة",
    installApp: "تثبيت التطبيق",
    installDesc: "تثبيت على جهازك",
    syncing: "جاري المزامنة...",
    synced: "تمت المزامنة",
    syncError: "خطأ في المزامنة",
    landingTitle: "Dentro",
    landingSubtitle: "الحل المتكامل لإدارة العيادات الحديثة",
    login: "تسجيل الدخول",
    requestTrial: "طلب نسخة تجريبية / اشتراك",
    pricing: "باقات الاشتراك",
    filter: "فلترة",
    ageGroup: "الفئة العمرية",
    under18: "أقل من 18",
    from18to35: "18 - 35",
    over35: "أكبر من 35",
    applyFilters: "تطبيق الفلتر",
    clearFilters: "مسح",
    status: "الحالة",
    completed: "تم",
    noShow: "لم يأتي",
    none: "بلا",
    existingPatient: "مريض حالي",
    quickNewPatient: "موعد جديد",
    addAppointment: "إضافة موعد",
    description: "الوصف (اختياري)",
    addToPatients: "إضافة للمرضى",
    convertGuestTitle: "تحويل إلى مريض",
    rxBgUrl: "رابط خلفية الوصفة (A5)",
    enterRxUrl: "أدخل رابط الصورة للخلفية"
  },
  ku: {
    dashboard: "داشبۆرد",
    patients: "نەخۆشەکان",
    memos: "تێبینیەکان",
    calendar: "رۆژمێر",
    finance: "ژمێریاری",
    settings: "رێکخستنەکان",
    purchases: "کڕینەکان",
    clinicName: "ناوی کلینیک",
    doctors: "پزیشکەکان",
    addDoctor: "زیادکردنی پزیشک",
    selectDoctor: "پزیشک دیاریبکە",
    searchPatients: "گەڕان بۆ نەخۆش...",
    active: "بەردەوام",
    finished: "تەواوبوو",
    pending: "دەستی پێنەکردووە",
    discontinued: "بەردەوام نەبوو",
    newPatient: "نەخۆشی نوێ",
    name: "ناوی تەواو",
    phone: "ژمارەی مۆبایل",
    age: "تەمەن",
    gender: "ڕەگەز",
    male: "نێر",
    female: "مێ",
    notes: "تێبینی",
    medicalHistory: "مێژووی پزیشکی",
    save: "خەزنکردن",
    cancel: "هەڵوەشاندنەوە",
    payments: "پارەدانەکان",
    appointments: "کاتەکان",
    totalPaid: "دراوە",
    totalCost: "کۆی گشتی",
    remaining: "ماوە",
    addPayment: "زیادکردنی پارە",
    addCharge: "زیادکردنی تێچوو",
    printPrescription: "چاپکردنی ڕەچەتە",
    printInvoice: "چاپکردنی پسوڵە",
    whatsapp: "واتسئەپ",
    images: "وێنە و تیشک",
    upload: "بەرزکردنەوە",
    logout: "دەرچوون",
    welcome: "بەخێربێن بۆ Dentro",
    loginWithGoogle: "چوونەژوورەوە بە گۆگڵ",
    clinicSetup: "رێکخستنی کلینیک",
    enterClinicName: "ناوی کلینیک بنووسە",
    teethChart: "هێڵکاری ددان",
    contactDeveloper: "پەیوەندی بە گەشەپێدەر",
    darkMode: "دۆخی تاریک",
    language: "زمان",
    backup: "هەڵگرتنی داتا",
    import: "هێنانى داتا",
    morning: "بەیانی",
    night: "ئێوارە",
    deletePatient: "سڕینەوەی نەخۆش",
    confirmDelete: "دڵنیای لە سڕینەوەی ئەم نەخۆشە؟",
    address: "ناونیشان",
    overview: "پوختە",
    files: "فایلەکان",
    treatment: "چارەسەر",
    visitHistory: "سەردانەکان",
    financials: "دارایی",
    backToPatients: "گەڕانەوە بۆ لیست",
    selectCountry: "وڵات دیاریبکە",
    editPatient: "دەستکاری زانیاری",
    registrationDate: "بەرواری تۆمار",
    rct: "پێوانی کەناڵەکان",
    sessions: "دانیشتنەکانی چارەسەر",
    addSession: "زیادکردنی دانیشتن",
    tooth: "ددان",
    canal: "کەناڵ",
    length: "درێژی (ملم)",
    addRCT: "زیادکردنی کەناڵ",
    month: "مانگ",
    week: "هەفتە",
    day: "رۆژ",
    today: "ئەمڕۆ",
    newMemo: "تێبینی نوێ",
    editMemo: "دەستکاری تێبینی",
    memoTitle: "ناونیشان",
    memoContent: "تێبینی بنووسە...",
    pickColor: "ڕەنگ هەڵبژێرە",
    category: "جۆر",
    treatingDoctor: "پزیشکی چارەسەرکار",
    setupStep1: "بەخێربێن! با کلینیکەکەت ڕێکبخەین.",
    setupStep2: "ئێستا، ناوی پزیشکەکان زیاد بکە.",
    startApp: "دەستپێکردن",
    manageDoctors: "بەڕێوەبردنی پزیشکەکان",
    editClinicName: "دەستکاری ناوی کلینیک",
    treatmentType: "جۆری چارەسەر",
    sessionNumber: "ژمارەی دانیشتن",
    duration: "ماوە",
    min: "خوولەک",
    session: "دانیشتنی",
    prescriptions: "ڕەچەتەکان",
    newPrescription: "ڕەچەتەی نوێ",
    drugName: "ناوی دەرمان",
    dose: "بڕ",
    frequency: "چەندبارەبوونەوە",
    form: "شێوە",
    medNotes: "تێبینی (ئارەزوومەندانە)",
    addMedication: "زیادکردنی دەرمان",
    addMasterDrug: "زیادکردنی دەرمانی نوێ",
    rxList: "لیستی ڕەچەتەکان",
    print: "چاپ",
    itemName: "ناوی ماددە",
    quantity: "ژمارە",
    addItem: "زیادکردنی ماددە",
    editItem: "دەستکاری ماددە",
    installApp: "دابەزاندنی بەرنامە",
    installDesc: "دابەزاندن بۆ ناو ئامێرەکەت",
    syncing: "هاوکاتکردن...",
    synced: "هاوکاتکرا",
    syncError: "هەڵە لە هاوکاتکردن",
    landingTitle: "Dentro",
    landingSubtitle: "باشترین چارەسەر بۆ بەڕێوەبردنی کلینیکە مۆدێرنەکان",
    login: "چوونەژوورەوە",
    requestTrial: "داواکاری تاقیکردنەوە / بەشداریکردن",
    pricing: "پلانەکانی بەشداریکردن",
    filter: "فیلتەر",
    ageGroup: "تەمەن",
    under18: "کەمتر لە ١٨",
    from18to35: "١٨ - ٣٥",
    over35: "سەروو ٣٥",
    applyFilters: "جێبەجێکردن",
    clearFilters: "پاککردنەوە",
    status: "دۆخ",
    completed: "تەواو",
    noShow: "نەهات",
    none: "هیچ",
    existingPatient: "نەخۆشی تۆمارکراو",
    quickNewPatient: "کاتێکی نوێ",
    addAppointment: "زیادکردنی کات",
    description: "وەسف (ئارەزوومەندانە)",
    addToPatients: "زیادکردن بۆ نەخۆشەکان",
    convertGuestTitle: "گۆڕین بۆ نەخۆش",
    rxBgUrl: "بەستەری وێنەی ڕەچەتە (A5)",
    enterRxUrl: "بەستەرەکە لێرە بنووسە"
  }
};