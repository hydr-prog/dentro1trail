import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Calendar, Activity, Settings, Plus, Search, 
  MessageCircle, Trash2, Printer, Moon, Sun, 
  LogOut, DollarSign, FileText, ChevronRight,
  Menu, X, Save, User, Phone, MapPin,
  ClipboardList, Stethoscope, CreditCard, ArrowLeft,
  ChevronDown, LayoutDashboard, Clock, CheckCircle, XCircle,
  Edit2, Ruler, History, ChevronLeft, Download, StickyNote, Palette,
  Pencil, Pin, UserPlus, Filter, Timer, Pill, ShoppingBag,
  Copy, Smartphone, Lock, Mail, Instagram, Cloud, CloudOff, Loader2, Upload,
  ArrowRight, Star, CheckCircle2, Sparkles, Check, X as XIcon, Globe,
  Syringe, Tablet
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, 
  addMonths, subMonths, parseISO, startOfWeek, endOfWeek, 
  addWeeks, subWeeks, addDays, subDays, startOfDay, isSameMonth 
} from 'date-fns';
import { ClinicData, Doctor, Patient, INITIAL_DATA, Appointment, Payment, Tooth, RootCanalEntry, TreatmentSession, Memo, PatientCategory, Prescription, Medication, SupplyItem, LABELS } from './types';
import { storageService } from './services/storage';
import { supabaseService } from './services/supabase';
import { TeethChart } from './components/TeethChart';

// --- Constants ---
const COUNTRY_CODES = [
  { code: '+964', country: 'Iraq', flag: '🇮🇶' },
  { code: '+966', country: 'Saudi Arabia', flag: '🇸🇦' },
  { code: '+971', country: 'UAE', flag: '🇦🇪' },
  { code: '+20', country: 'Egypt', flag: '🇪🇬' },
  { code: '+962', country: 'Jordan', flag: '🇯🇴' },
  { code: '+963', country: 'Syria', flag: '🇸🇾' },
  { code: '+961', country: 'Lebanon', flag: '🇱🇧' },
  { code: '+965', country: 'Kuwait', flag: '🇰🇼' },
  { code: '+974', country: 'Qatar', flag: '🇶🇦' },
  { code: '+973', country: 'Bahrain', flag: '🇧🇭' },
  { code: '+968', country: 'Oman', flag: '🇴🇲' },
  { code: '+967', country: 'Yemen', flag: '🇾🇪' },
  { code: '+970', country: 'Palestine', flag: '🇵🇸' },
  { code: '+213', country: 'Algeria', flag: '🇩🇿' },
  { code: '+212', country: 'Morocco', flag: '🇲🇦' },
  { code: '+216', country: 'Tunisia', flag: '🇹🇳' },
  { code: '+218', country: 'Libya', flag: '🇱🇾' },
  { code: '+249', country: 'Sudan', flag: '🇸🇩' },
  { code: '+222', country: 'Mauritania', flag: '🇲🇷' },
  { code: '+252', country: 'Somalia', flag: '🇸🇴' },
  { code: '+253', country: 'Djibouti', flag: '🇩🇯' },
  { code: '+269', country: 'Comoros', flag: '🇰🇲' },
  { code: '+1', country: 'USA', flag: '🇺🇸' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
];

const TREATMENT_TYPES = [
  { id: 'diagnosis', en: 'Diagnosis', ar: 'تشخيص', ku: 'دەستنیشانكردن' },
  { id: 'filling', en: 'Regular Filling', ar: 'حشوة عادية', ku: 'پڕكردنەوە' },
  { id: 'rct', en: 'Root Canal', ar: 'حشوة جذر', ku: 'دەماربڕین' },
  { id: 'implant', en: 'Implant', ar: 'زراعة', ku: 'چاندن' },
  { id: 'crown', en: 'Crown', ar: 'تغليف', ku: 'رووپۆش' },
  { id: 'extraction', en: 'Extraction', ar: 'قلع', ku: 'كێشان' },
  { id: 'surgery', en: 'Surgery', ar: 'عملية جراحية', ku: 'نەشتەرگەری' },
  { id: 'cleaning', en: 'Cleaning/Scaling', ar: 'تنظيف', ku: 'پاككردنەوە' },
  { id: 'ortho', en: 'Orthodontics', ar: 'تقويم', ku: 'راستكردنەوە' },
  { id: 'other', en: 'Other', ar: 'أخرى', ku: 'هیتر' },
];

const DURATIONS = [15, 30, 45, 60, 90, 120, 180];

const STATUS_COLORS: any = {
  active: 'bg-red-100 text-red-600 border-red-200',
  finished: 'bg-green-100 text-green-600 border-green-200',
  pending: 'bg-yellow-100 text-yellow-600 border-yellow-200',
  discontinued: 'bg-gray-100 text-gray-600 border-gray-200'
};

const CATEGORIES: {id: PatientCategory | 'all', label: string, labelAr: string, labelKu: string}[] = [
    { id: 'all', label: 'All', labelAr: 'الكل', labelKu: 'هەموو' },
    { id: 'diagnosis', label: 'Diagnosis', labelAr: 'تشخيص', labelKu: 'دەستنیشان' },
    { id: 'rct', label: 'RCT', labelAr: 'عصب', labelKu: 'دەمار' },
    { id: 'implant', label: 'Implant', labelAr: 'زراعة', labelKu: 'چاندن' },
    { id: 'crown', label: 'Crown', labelAr: 'تغليف', labelKu: 'رووپۆش' },
    { id: 'surgery', label: 'Surgery', labelAr: 'جراحة', labelKu: 'نەشتەرگەری' },
    { id: 'ortho', label: 'Orthodontics', labelAr: 'تقويم', labelKu: 'راستكردنەوە' },
    { id: 'other', label: 'Other', labelAr: 'أخرى', labelKu: 'هیتر' },
];

const MEMO_COLORS = [
  { id: 'yellow', class: 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-900', bg: '#fef3c7' },
  { id: 'blue', class: 'from-blue-50 to-blue-100 border-blue-200 text-blue-900', bg: '#dbeafe' },
  { id: 'green', class: 'from-green-50 to-green-100 border-green-200 text-green-900', bg: '#dcfce7' },
  { id: 'purple', class: 'from-purple-50 to-purple-100 border-purple-200 text-purple-900', bg: '#f3e8ff' },
  { id: 'pink', class: 'from-pink-50 to-pink-100 border-pink-200 text-pink-900', bg: '#fce7f3' },
  { id: 'gray', class: 'from-gray-50 to-gray-100 border-gray-200 text-gray-900', bg: '#f3f4f6' },
];

const PRICING_PLANS = [
  { id: '1mo', price: 3, duration: 'Month', labelEn: 'Monthly', labelAr: 'شهري', labelKu: 'مانگانە' },
  { id: '3mo', price: 7, duration: '3 Months', labelEn: 'Quarterly', labelAr: '3 أشهر', labelKu: '٣ مانگ' },
  { id: '6mo', price: 13, duration: '6 Months', labelEn: 'Bi-Yearly', labelAr: '6 أشهر', labelKu: '٦ مانگ' },
  { id: '1yr', price: 17, duration: 'Year', labelEn: 'Yearly', labelAr: 'سنوي', labelKu: 'ساڵانە' },
];

const formatTime12 = (time24: string) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  let h = parseInt(hours, 10);
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12;
  h = h ? h : 12;
  return `${h}:${minutes} ${ampm}`;
};

// --- Localization Helpers for Calendar ---
const getLocaleCode = (lang: 'en' | 'ar' | 'ku') => {
    switch(lang) {
        case 'ar': return 'ar-IQ';
        case 'ku': return 'ckb-IQ'; // Central Kurdish
        default: return 'en-US';
    }
}

const getLocalizedDate = (date: Date, type: 'day' | 'month' | 'full' | 'weekday', lang: 'en' | 'ar' | 'ku') => {
    const locale = getLocaleCode(lang);
    if (type === 'day') return new Intl.DateTimeFormat(locale, { day: 'numeric' }).format(date);
    if (type === 'weekday') return new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date);
    if (type === 'month') return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
    if (type === 'full') return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
    return date.toDateString();
}

const NavButton = ({ icon: Icon, label, active, onClick }: any) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30 font-medium' 
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-white'
    }`}
  >
    <Icon size={22} className={active ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
    <span className="text-base">{label}</span>
    {active && <ChevronRight size={16} className="ms-auto opacity-50 rtl:rotate-180" />}
  </button>
);

const TabButton = ({ icon: Icon, label, active, onClick, colorClass = "text-primary-500" }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all duration-200 whitespace-nowrap ${
      active 
        ? 'bg-primary-50 dark:bg-gray-700 text-primary-700 dark:text-white ring-1 ring-primary-100 dark:ring-gray-600 font-bold shadow-sm' 
        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-700'
    }`}
  >
    <Icon size={18} className={active ? colorClass : 'currentColor'} />
    <span className="text-sm">{label}</span>
  </button>
);

const InfoItem = ({ label, value, className = '' }: { label: string, value?: string, className?: string }) => (
  <div className={`flex flex-col ${className}`}>
    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">{label}</span>
    <span className="font-medium text-gray-800 dark:text-white text-lg">{value || '-'}</span>
  </div>
);

export default function App() {
  // --- State ---
  const [data, setData] = useState<ClinicData>(INITIAL_DATA);
  const [appState, setAppState] = useState<'landing' | 'auth' | 'app'>('landing');
  const [onboardingStep, setOnboardingStep] = useState(0); 
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Sync State
  const [syncStatus, setSyncStatus] = useState<'synced' | 'syncing' | 'error'>('synced');
  
  const [currentView, setCurrentView] = useState<'patients' | 'memos' | 'calendar' | 'settings' | 'purchases'>('patients');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Advanced Filters State
  const [showFilter, setShowFilter] = useState(false);
  const [filterDoctor, setFilterDoctor] = useState<string>('');
  const [filterGender, setFilterGender] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterAge, setFilterAge] = useState<string>('');
  
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [patientTab, setPatientTab] = useState<'overview' | 'chart' | 'visits' | 'finance' | 'prescriptions'>('overview');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  
  // Settings State
  const [isEditingClinic, setIsEditingClinic] = useState(false);
  const [isEditingDoctors, setIsEditingDoctors] = useState(false);
  
  // Calendar State
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Modals
  const [showNewPatientModal, setShowNewPatientModal] = useState(false);
  const [showEditPatientModal, setShowEditPatientModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'payment' | 'charge'>('payment'); 
  
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null); 
  const [appointmentMode, setAppointmentMode] = useState<'existing' | 'new'>('existing'); // 'existing' = patient, 'new' = guest

  const [showMemoModal, setShowMemoModal] = useState(false);
  const [selectedMemo, setSelectedMemo] = useState<Memo | null>(null); 

  // Rx State
  const [showRxModal, setShowRxModal] = useState(false);
  const [showAddMasterDrugModal, setShowAddMasterDrugModal] = useState(false);
  const [newRxMeds, setNewRxMeds] = useState<Medication[]>([]);
  const [medSearch, setMedSearch] = useState('');
  const [medForm, setMedForm] = useState<Partial<Medication>>({});
  const [printingRx, setPrintingRx] = useState<Prescription | null>(null);

  // Supply State
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [selectedSupply, setSelectedSupply] = useState<SupplyItem | null>(null);

  // Guest to Patient Conversion State
  const [guestToConvert, setGuestToConvert] = useState<Appointment | null>(null);

  // RCT Input State
  const [rctInput, setRctInput] = useState({ tooth: '', canal: '', length: '' });

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  
  // Landing Page Language State (Temporary before loading user data)
  const [landingLang, setLandingLang] = useState<'en'|'ar'|'ku'>('ar');
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  // --- Derived State ---
  // If app is loaded, use settings lang, otherwise use landing lang
  const currentLang = data.settings.isLoggedIn ? data.settings.language : landingLang;
  const t = LABELS[currentLang];
  const isRTL = currentLang === 'ar' || currentLang === 'ku';
  
  // --- Effects ---
  useEffect(() => {
    // PWA Install Prompt Listener
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    // Language Menu Click Outside
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    // Initialize Auth Session Check
    const checkSession = async () => {
        setAuthLoading(true);
        const user = await supabaseService.getUser();
        if (user) {
            const cloudData = await supabaseService.loadData();
            if (cloudData) {
                setData(cloudData);
                setData(prev => ({...prev, settings: {...prev.settings, isLoggedIn: true}}));
                if (cloudData.clinicName && cloudData.doctors.length > 0) {
                    setAppState('app');
                } else if (cloudData.clinicName) {
                    setOnboardingStep(1);
                    setAppState('app');
                }
            } else {
              setAppState('app'); // Should setup
            }
        } else {
          setAppState('landing');
        }
        setAuthLoading(false);
    };

    checkSession();
    
    if (localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.add('dark');
    }

    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, []);

  // Autosave to Supabase with Debounce
  useEffect(() => {
    if (!data.settings.isLoggedIn) return;

    setSyncStatus('syncing');
    const timer = setTimeout(async () => {
        try {
            await supabaseService.saveData(data);
            setSyncStatus('synced');
        } catch (e) {
            console.error(e);
            setSyncStatus('error');
        }
    }, 2000); // Debounce for 2 seconds

    // Also update local theme immediately
    if (data.settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => clearTimeout(timer);
  }, [data]);

  // Handle Printing
  useEffect(() => {
    if (printingRx) {
       setTimeout(() => {
           window.print();
           setPrintingRx(null);
       }, 500);
    }
  }, [printingRx]);

  // --- Handlers ---
  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  // Auth Handlers
  const handleAuth = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthLoading(true);
      setAuthError('');
      
      try {
          const result = await supabaseService.signIn(loginEmail, loginPassword);
          
          if (result.error) {
              setAuthError(result.error.message);
          } else {
              // Success
              const cloudData = await supabaseService.loadData();
              if (cloudData) {
                setData(cloudData);
                setData(prev => ({...prev, settings: {...prev.settings, isLoggedIn: true}}));
                
                // Determine flow based on data existence
                if (cloudData.clinicName && cloudData.doctors.length > 0) {
                   setAppState('app');
                } else if (cloudData.clinicName) {
                    setOnboardingStep(1);
                    setAppState('app');
                } else {
                    setOnboardingStep(0);
                    setAppState('app');
                }
              }
          }
      } catch (err: any) {
          setAuthError(err.message || 'Authentication failed');
      } finally {
          setAuthLoading(false);
      }
  };

  const goToInstagram = () => {
      window.open('https://instagram.com/dr_haider_00', '_blank');
  };

  const handleClinicNameSubmit = (name: string) => {
    setData(prev => ({ ...prev, clinicName: name }));
    setOnboardingStep(1);
  };

  const handleAddDoctor = (name: string) => {
      if(!name.trim()) return;
      const newDoc: Doctor = { id: Date.now().toString(), name };
      setData(prev => ({ ...prev, doctors: [...prev.doctors, newDoc] }));
  };

  const handleDeleteDoctor = (id: string) => {
      setData(prev => ({ ...prev, doctors: prev.doctors.filter(d => d.id !== id) }));
  }

  const handleFinishSetup = () => {
     setAppState('app');
  };

  const handleLogout = async () => {
    await supabaseService.signOut();
    setData(prev => ({
        ...prev,
        settings: { ...prev.settings, isLoggedIn: false }
    }));
    setLoginEmail('');
    setLoginPassword('');
    setAppState('landing');
  };

  const handleImportData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const imported = await storageService.importBackup(e.target.files[0]);
      if (imported) {
        imported.settings.isLoggedIn = true; 
        setData(imported);
        alert("Data imported successfully!");
        setAppState('app');
      }
    }
  };

  const handleAddPatient = (patientData: any) => {
    const newPatient: Patient = {
      id: Date.now().toString(),
      name: patientData.name || 'New Patient',
      phone: patientData.phone || '',
      phoneCode: patientData.phoneCode || data.settings.defaultCountryCode,
      age: parseInt(patientData.age) || 0,
      gender: patientData.gender || 'male',
      category: patientData.category || 'other',
      medicalHistory: patientData.medicalHistory || '',
      status: 'active', 
      doctorId: patientData.doctorId || (data.doctors[0]?.id || ''),
      createdAt: new Date().toISOString(),
      teeth: {},
      appointments: [],
      payments: [],
      notes: '',
      address: patientData.address,
      rootCanals: [],
      treatmentSessions: [],
      prescriptions: []
    };

    // If converting a guest, move their appointment to this patient
    if (guestToConvert) {
        newPatient.appointments.push({
            ...guestToConvert,
            patientId: newPatient.id,
            patientName: newPatient.name
        });
        
        // Remove from guest list
        setData(prev => ({
            ...prev,
            patients: [newPatient, ...prev.patients],
            guestAppointments: (prev.guestAppointments || []).filter(a => a.id !== guestToConvert.id),
            settings: { ...prev.settings, defaultCountryCode: newPatient.phoneCode || prev.settings.defaultCountryCode }
        }));
        setGuestToConvert(null);
    } else {
        setData(prev => ({ 
          ...prev, 
          patients: [newPatient, ...prev.patients],
          settings: { ...prev.settings, defaultCountryCode: newPatient.phoneCode || prev.settings.defaultCountryCode }
        }));
    }

    setShowNewPatientModal(false);
    return newPatient;
  };

  const updatePatient = (id: string, updates: Partial<Patient>) => {
    setData(prev => ({
      ...prev,
      patients: prev.patients.map(p => p.id === id ? { ...p, ...updates } : p)
    }));
  };

  const handleDeletePatient = (id: string) => {
    if (window.confirm(t.confirmDelete)) {
      setData(prev => ({
        ...prev,
        patients: prev.patients.filter(p => p.id !== id)
      }));
      setSelectedPatientId(null);
    }
  };

  const handleUpdateTooth = (patientId: string, toothId: number, status: Tooth['status']) => {
    const patient = data.patients.find(p => p.id === patientId);
    if (!patient) return;
    const newTeeth = { ...patient.teeth, [toothId]: { id: toothId, status } };
    updatePatient(patientId, { teeth: newTeeth });
  };

  const handleAddPayment = (patientId: string, amount: number, type: 'payment' | 'charge', description: string) => {
    const patient = data.patients.find(p => p.id === patientId);
    if (!patient) return;
    const newPayment: Payment = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      amount,
      type,
      description
    };
    updatePatient(patientId, { payments: [newPayment, ...patient.payments] });
    setShowPaymentModal(false);
  };

  const handleAddAppointment = (patientId: string | null, apptData: Partial<Appointment>) => {
    const newApptId = selectedAppointment ? selectedAppointment.id : Date.now().toString();

    // Case 1: Existing Patient Appointment
    if (patientId) {
        const patient = data.patients.find(p => p.id === patientId);
        if (patient) {
            if (selectedAppointment) {
                // Update
                const updatedApps = patient.appointments.map(a => 
                    a.id === selectedAppointment.id ? { ...a, ...apptData } : a
                );
                updatePatient(patientId, { appointments: updatedApps });
            } else {
                // New
                const newAppt: Appointment = {
                    id: newApptId,
                    patientId,
                    patientName: patient.name,
                    date: apptData.date!,
                    time: apptData.time!,
                    duration: apptData.duration,
                    treatmentType: apptData.treatmentType,
                    sessionNumber: apptData.sessionNumber,
                    notes: apptData.notes,
                    status: 'scheduled'
                };
                updatePatient(patientId, { appointments: [...patient.appointments, newAppt] });
            }
        }
    } 
    // Case 2: Guest Appointment (Calendar Quick Add)
    else {
        // Only allow adding new guests, not editing to remove patientId (though UI prevents this)
        if (selectedAppointment && selectedAppointment.patientId) {
             // This shouldn't happen via this function for real patients, handled above
             return; 
        }

        const guestAppt: Appointment = {
            id: newApptId,
            patientId: '', // Guest
            patientName: apptData.patientName || 'Guest',
            date: apptData.date!,
            time: apptData.time!,
            duration: apptData.duration,
            treatmentType: apptData.treatmentType,
            sessionNumber: apptData.sessionNumber,
            notes: apptData.notes,
            status: 'scheduled'
        };
        
        if (selectedAppointment) {
             // Edit Guest Appt
             setData(prev => ({
                 ...prev,
                 guestAppointments: prev.guestAppointments.map(a => a.id === selectedAppointment.id ? { ...a, ...apptData } : a)
             }));
        } else {
             // New Guest Appt
             setData(prev => ({
                 ...prev,
                 guestAppointments: [...(prev.guestAppointments || []), guestAppt]
             }));
        }
    }
    
    setShowAppointmentModal(false);
    setSelectedAppointment(null);
  };

  const handleDeleteAppointment = (patientId: string, appId: string) => {
      if(!window.confirm("Delete this appointment?")) return;
      
      if (patientId) {
        const patient = data.patients.find(p => p.id === patientId);
        if(!patient) return;
        updatePatient(patientId, { appointments: patient.appointments.filter(a => a.id !== appId) });
      } else {
        // Guest Appointment Delete
        setData(prev => ({
            ...prev,
            guestAppointments: prev.guestAppointments.filter(a => a.id !== appId)
        }));
      }
  };

  const handleUpdateAppointmentStatus = (patientId: string, appId: string, status: 'scheduled' | 'completed' | 'cancelled' | 'noshow') => {
      if (patientId) {
          const patient = data.patients.find(p => p.id === patientId);
          if (!patient) return;
          const updatedApps = patient.appointments.map(a => 
              a.id === appId ? { ...a, status } : a
          );
          updatePatient(patientId, { appointments: updatedApps });
      } else {
          // Guest
          setData(prev => ({
              ...prev,
              guestAppointments: prev.guestAppointments.map(a => a.id === appId ? { ...a, status } : a)
          }));
      }
  };
  
  // Rx Handlers
  const handleAddMedicationToRx = () => {
     if(!medForm.name) return;
     
     // Check if existing in master list
     let medToAdd = data.medications.find(m => m.name.toLowerCase() === medForm.name?.toLowerCase());
     
     if (!medToAdd) {
         // Create new master med on the fly if user types new name
         // (Keep this just in case, though we have explicit button now)
         medToAdd = {
             id: Date.now().toString(),
             name: medForm.name,
             dose: medForm.dose || '',
             frequency: medForm.frequency || '',
             form: medForm.form || 'tab',
             notes: ''
         };
         setData(prev => ({ ...prev, medications: [...prev.medications, medToAdd!] }));
     }

     // Add to current RX
     setNewRxMeds(prev => [...prev, {
         id: Date.now().toString(),
         name: medForm.name!,
         dose: medForm.dose || medToAdd!.dose,
         frequency: medForm.frequency || medToAdd!.frequency,
         form: medForm.form || medToAdd!.form,
         notes: medForm.notes || ''
     }]);

     setMedForm({});
     setMedSearch('');
  };

  const handleAddMasterDrug = (drug: Omit<Medication, 'id'>) => {
    const newDrug: Medication = {
        ...drug,
        id: Date.now().toString()
    };
    setData(prev => ({ ...prev, medications: [...prev.medications, newDrug] }));
    setShowAddMasterDrugModal(false);
  }

  const handleSaveRx = () => {
      if(!selectedPatientId || newRxMeds.length === 0) return;
      const newRx: Prescription = {
          id: Date.now().toString(),
          date: new Date().toISOString(),
          medications: newRxMeds
      };
      
      const patient = data.patients.find(p => p.id === selectedPatientId);
      if(patient) {
          updatePatient(selectedPatientId, { prescriptions: [newRx, ...(patient.prescriptions || [])] });
      }
      setShowRxModal(false);
      setNewRxMeds([]);
  };

  const handleDeleteRx = (rxId: string) => {
  if (!window.confirm("Are you sure you want to delete this prescription record?")) return;

  if (!selectedPatientId) return; // ← الحل الأساسي

  const patient = data.patients.find(p => p.id === selectedPatientId);

  if (patient) {
    updatePatient(selectedPatientId, {
      prescriptions: patient.prescriptions.filter(r => r.id !== rxId)
    });
  }
};

  // New RCT & Session Handlers
  const handleAddRCT = (patientId: string, rct: Omit<RootCanalEntry, 'id'>) => {
      const patient = data.patients.find(p => p.id === patientId);
      if(!patient) return;
      const newRCT = { ...rct, id: Date.now().toString() };
      updatePatient(patientId, { rootCanals: [...(patient.rootCanals || []), newRCT] });
      setRctInput({ tooth: '', canal: '', length: '' });
  }

  const handleDeleteRCT = (patientId: string, rctId: string) => {
      const patient = data.patients.find(p => p.id === patientId);
      if(!patient) return;
      updatePatient(patientId, { rootCanals: patient.rootCanals.filter(r => r.id !== rctId) });
  }

  // Memo Handlers
  const handleSaveMemo = (title: string, content: string, color: string) => {
    if (selectedMemo) {
      // Edit
      setData(prev => ({
        ...prev,
        memos: prev.memos.map(m => m.id === selectedMemo.id ? { ...m, title, content, color } : m)
      }));
    } else {
      // Add
      const newMemo: Memo = {
        id: Date.now().toString(),
        title,
        content,
        color,
        date: new Date().toISOString()
      };
      setData(prev => ({
        ...prev,
        memos: [newMemo, ...(prev.memos || [])]
      }));
    }
    setShowMemoModal(false);
    setSelectedMemo(null);
  };

  const handleDeleteMemo = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if(window.confirm('Delete this note?')) {
      setData(prev => ({
        ...prev,
        memos: prev.memos.filter(m => m.id !== id)
      }));
    }
  };

  // Supply Handlers
  const handleSaveSupply = (name: string, quantity: number) => {
      if (selectedSupply) {
          setData(prev => ({
              ...prev,
              supplies: prev.supplies.map(s => s.id === selectedSupply.id ? { ...s, name, quantity } : s)
          }));
      } else {
          const newItem: SupplyItem = {
              id: Date.now().toString(),
              name,
              quantity
          };
          setData(prev => ({
              ...prev,
              supplies: [newItem, ...(prev.supplies || [])]
          }));
      }
      setShowSupplyModal(false);
      setSelectedSupply(null);
  };

  const handleDeleteSupply = (id: string) => {
      if(window.confirm("Remove this item?")) {
          setData(prev => ({
              ...prev,
              supplies: prev.supplies.filter(s => s.id !== id)
          }));
      }
  };

  // --- Helper for Appointment Display ---
  const getTreatmentLabel = (typeId?: string) => {
      if(!typeId) return '';
      const type = TREATMENT_TYPES.find(t => t.id === typeId);
      if(isRTL) return currentLang === 'ku' ? type?.ku : type?.ar;
      return type?.en;
  };

  const resetFilters = () => {
    setFilterDoctor('');
    setFilterGender('');
    setFilterStatus('');
    setFilterAge('');
    setShowFilter(false);
  };

  // Combine Patient Apps and Guest Apps for Calendar
  const allAppointments = [
      ...data.patients.flatMap(p => p.appointments.map(a => ({...a, patient: p}))),
      ...(data.guestAppointments || []).map(a => ({...a, patient: null as Patient | null})) // Guests have null patient object
  ];

  // --- Views ---

  // 1. LANDING PAGE
  if (appState === 'landing') {
    return (
      <div className={`min-h-screen bg-gradient-to-br from-indigo-50 to-teal-50 dark:from-gray-900 dark:to-gray-800 font-${isRTL ? 'cairo' : 'sans'} overflow-x-hidden`} dir={isRTL ? 'rtl' : 'ltr'}>
        {/* Navigation */}
        <nav className="container mx-auto px-6 py-6 flex justify-between items-center relative">
            <div className="flex items-center gap-2">
                <div className="bg-gradient-to-tr from-primary-600 to-secondary-500 p-2 rounded-xl text-white shadow-lg">
                    <Activity size={24} />
                </div>
                <span className="text-2xl font-bold text-gray-800 dark:text-white tracking-tight">Dentro</span>
            </div>
            <div className="flex gap-4 items-center">
                {/* Click-based Dropdown */}
                <div className="relative group" ref={langMenuRef}>
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsLangMenuOpen(!isLangMenuOpen);
                        }}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/50 backdrop-blur dark:bg-gray-700 text-gray-700 dark:text-white text-sm font-bold active:scale-95 transition hover:bg-white"
                    >
                        <Globe size={16} />
                        {landingLang === 'en' ? 'English' : landingLang === 'ar' ? 'العربية' : 'Kurdî'}
                        <ChevronDown size={14} className={`transition-transform duration-200 ${isLangMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {isLangMenuOpen && (
                        <div className="absolute top-full end-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden animate-fade-in">
                            <button onClick={() => { setLandingLang('en'); setIsLangMenuOpen(false); }} className="block w-full text-start px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm border-b border-gray-50 dark:border-gray-700/50">English</button>
                            <button onClick={() => { setLandingLang('ar'); setIsLangMenuOpen(false); }} className="block w-full text-start px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm border-b border-gray-50 dark:border-gray-700/50">العربية</button>
                            <button onClick={() => { setLandingLang('ku'); setIsLangMenuOpen(false); }} className="block w-full text-start px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm">Kurdî</button>
                        </div>
                    )}
                </div>
                
                <button 
                    onClick={() => setAppState('auth')}
                    className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-2.5 rounded-full font-bold shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5"
                >
                    {t.login}
                </button>
            </div>
        </nav>

        {/* Hero Section */}
        <header className="container mx-auto px-6 py-16 md:py-24 flex flex-col items-center text-center animate-fade-in">
            <div className="inline-block px-4 py-1.5 bg-white dark:bg-white/10 text-primary-600 dark:text-primary-300 rounded-full text-sm font-bold mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
                ✨ {t.landingTitle} v2.1
            </div>
            <h1 className="text-4xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-secondary-600 dark:from-white dark:to-gray-300 mb-6 !leading-relaxed max-w-4xl py-2">
                {isRTL ? (landingLang === 'ku' ? 'بەڕێوەبردنی کلینیکەکەت ئاسانتر و زیرەکتر بووە' : 'إدارة عيادتك أصبحت أسهل وأكثر ذكاءً') : 'Manage your clinic smarter, faster, and better.'}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                {t.landingSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                <button 
                    onClick={() => setAppState('auth')}
                    className="px-8 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-primary-500/30 transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                    {t.login} <ArrowRight className="rtl:rotate-180" />
                </button>
                <button 
                    onClick={goToInstagram}
                    className="px-8 py-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 rounded-2xl font-bold text-lg shadow-lg transition transform hover:-translate-y-1 flex items-center justify-center gap-2"
                >
                    <Instagram size={20} />
                    {t.requestTrial}
                </button>
            </div>
        </header>

        {/* Pricing Section */}
        <section className="container mx-auto px-6 py-16">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{t.pricing}</h2>
                <div className="w-20 h-1.5 bg-gradient-to-r from-primary-500 to-secondary-500 mx-auto rounded-full"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                {PRICING_PLANS.map((plan) => (
                    <div key={plan.id} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-primary-400 to-secondary-400" />
                        
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">{landingLang === 'ar' ? plan.labelAr : landingLang === 'ku' ? plan.labelKu : plan.labelEn}</h3>
                        <div className="flex items-end gap-1 mb-6">
                            <span className="text-4xl font-extrabold text-gray-900 dark:text-white">${plan.price}</span>
                            <span className="text-gray-500 dark:text-gray-400 mb-1">/ {plan.duration}</span>
                        </div>

                        <ul className="space-y-3 mb-8">
                            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <CheckCircle2 size={16} className="text-secondary-500" /> Full Access
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <CheckCircle2 size={16} className="text-secondary-500" /> Cloud Sync
                            </li>
                            <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <CheckCircle2 size={16} className="text-secondary-500" /> 24/7 Support
                            </li>
                        </ul>

                        <button onClick={goToInstagram} className="w-full py-3 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white font-bold hover:bg-gray-100 dark:hover:bg-gray-600 transition">
                            Subscribe
                        </button>
                    </div>
                ))}
            </div>
        </section>

        <footer className="bg-white dark:bg-gray-900 py-8 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">© 2024 Dentro. All rights reserved.</p>
        </footer>
      </div>
    );
  }

  // 2. AUTH SCREEN
  if (appState === 'auth') {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4 font-cairo" dir="rtl">
              <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-100 dark:border-gray-700 animate-scale-up relative">
                  <button onClick={() => setAppState('landing')} className="absolute top-4 start-4 text-gray-400 hover:text-gray-600"><X size={24} /></button>
                  <div className="text-center mb-8">
                      <div className="w-20 h-20 bg-gradient-to-tr from-primary-600 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary-500/30">
                          <Activity className="text-white w-10 h-10" />
                      </div>
                      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                          {t.login}
                      </h1>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Dentro Management System</p>
                  </div>
                  
                  {authError && (
                      <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-xl text-sm border border-red-200">
                          {authError}
                      </div>
                  )}
                  
                  <form onSubmit={handleAuth} className="space-y-4">
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">البريد الإلكتروني</label>
                          <div className="relative">
                              <Mail className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" size={18} />
                              <input 
                                  type="email" 
                                  value={loginEmail}
                                  onChange={(e) => setLoginEmail(e.target.value)}
                                  className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                                  placeholder="example@mail.com"
                                  required
                              />
                          </div>
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">كلمة المرور</label>
                          <div className="relative">
                              <Lock className="absolute top-1/2 -translate-y-1/2 start-3 text-gray-400" size={18} />
                              <input 
                                  type="password" 
                                  value={loginPassword}
                                  onChange={(e) => setLoginPassword(e.target.value)}
                                  className="w-full ps-10 pe-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500"
                                  placeholder="••••••••"
                                  required
                                  minLength={6}
                              />
                          </div>
                      </div>

                      <button 
                          type="submit" 
                          disabled={authLoading}
                          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl transition shadow-lg shadow-primary-500/20 flex items-center justify-center gap-2"
                      >
                          {authLoading && <Loader2 className="animate-spin" size={20} />}
                          {t.login}
                      </button>
                  </form>

                  <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-3">
                      <button 
                          onClick={goToInstagram}
                          className="w-full flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition text-sm font-medium"
                      >
                          نسيت كلمة المرور؟
                      </button>
                      
                      <button 
                          onClick={goToInstagram}
                          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-pink-500/20 hover:opacity-90 transition transform active:scale-95"
                      >
                          <Instagram size={18} />
                          {t.requestTrial}
                      </button>
                  </div>
                  
                  <div className="mt-6 text-center text-xs text-gray-400">
                      للتواصل المباشر: @dr_haider_00
                  </div>
              </div>
          </div>
      )
  }

  // APP Logic
  const activePatient = selectedPatientId ? data.patients.find(p => p.id === selectedPatientId) : null;
  const filteredPatients = data.patients.filter(p => {
    // Basic Filters
    const matchCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.phone.includes(searchQuery);
    
    // Advanced Filters
    const matchDoctor = !filterDoctor || p.doctorId === filterDoctor;
    const matchGender = !filterGender || p.gender === filterGender;
    const matchStatus = !filterStatus || p.status === filterStatus;
    
    let matchAge = true;
    if (filterAge === 'under18') matchAge = p.age < 18;
    else if (filterAge === '18-35') matchAge = p.age >= 18 && p.age <= 35;
    else if (filterAge === 'over35') matchAge = p.age > 35;

    return matchCategory && matchSearch && matchDoctor && matchGender && matchStatus && matchAge;
  });

  if (!data.settings.isLoggedIn || (data.clinicName && data.doctors.length === 0 && onboardingStep === 1)) {
    // Clinic Setup Screen (same as before)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 font-sans p-4" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl max-w-md w-full border border-gray-100 dark:border-gray-700">
          <div className="text-center mb-10">
            <div className="w-24 h-24 bg-gradient-to-tr from-primary-400 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-primary-500/30">
              <Stethoscope className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 font-cairo">Dentro</h1>
            <p className="text-gray-500 dark:text-gray-400">{t.clinicSetup}</p>
          </div>
          
          <div className="space-y-4">
            {onboardingStep === 0 && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                handleClinicNameSubmit(fd.get('clinicName') as string);
              }}>
                 <p className="text-center text-gray-600 dark:text-gray-300 mb-4">{t.setupStep1}</p>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-start">
                  {t.enterClinicName}
                </label>
                <input 
                  name="clinicName"
                  type="text" 
                  defaultValue={data.clinicName}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none transition"
                  placeholder="My Dental Clinic"
                />
                <button 
                  type="submit"
                  className="w-full mt-6 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold py-4 rounded-xl transition shadow-lg shadow-primary-500/30 flex items-center justify-center gap-2"
                >
                  Next <ChevronRight className="rtl:rotate-180" />
                </button>
              </form>
            )}

            {onboardingStep === 1 && (
               <div className="animate-fade-in">
                  <p className="text-center text-gray-600 dark:text-gray-300 mb-4">{t.setupStep2}</p>
                  
                  <div className="space-y-3 mb-6 max-h-[200px] overflow-y-auto">
                      {data.doctors.map(doc => (
                          <div key={doc.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                              <span className="font-bold text-gray-800 dark:text-white">{doc.name}</span>
                              <button onClick={() => handleDeleteDoctor(doc.id)} className="text-red-500 hover:bg-red-50 p-1 rounded"><Trash2 size={16} /></button>
                          </div>
                      ))}
                      {data.doctors.length === 0 && <p className="text-center text-gray-400 text-sm">No doctors added yet.</p>}
                  </div>

                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      handleAddDoctor(fd.get('doctorName') as string);
                      (e.target as HTMLFormElement).reset();
                  }} className="flex gap-2 mb-6">
                      <input name="doctorName" className="flex-1 px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" placeholder={t.addDoctor} required />
                      <button type="submit" className="bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-700"><Plus /></button>
                  </form>

                  <button 
                    onClick={handleFinishSetup}
                    disabled={data.doctors.length === 0}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 rounded-xl transition shadow-lg shadow-green-500/30"
                  >
                    {t.startApp}
                  </button>
               </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. MAIN APP
  return (
    <div className={`min-h-screen flex bg-gray-50 dark:bg-gray-900 font-${isRTL ? 'cairo' : 'sans'} overflow-hidden`} dir={isRTL ? 'rtl' : 'ltr'}>
      
      {/* PRINT AREA FOR Rx */}
      <div id="print-section" className="hidden" style={{backgroundImage: `url(${data.settings.rxBackgroundImage || ''})`}}>
          {printingRx && (
              <div className="w-full h-full flex flex-col p-8 pt-32">
                 {/* Header Spacer - assuming image has logo */}
                 <div className="h-20 w-full mb-8"></div> 

                 {/* Patient Info Row */}
                 <div className="flex justify-between text-lg font-bold border-b-2 border-black pb-2 mb-6 text-black">
                     <div>
                        <span className="opacity-60 mr-2 text-sm uppercase">Name:</span> 
                        {data.patients.find(p => p.prescriptions.includes(printingRx))?.name}
                     </div>
                     <div className="flex gap-6">
                        <div>
                             <span className="opacity-60 mr-2 text-sm uppercase">Age:</span>
                             {data.patients.find(p => p.prescriptions.includes(printingRx))?.age}
                        </div>
                        <div>
                             <span className="opacity-60 mr-2 text-sm uppercase">Date:</span>
                             {new Date(printingRx.date).toLocaleDateString(currentLang === 'en' ? 'en-US' : 'en-GB')}
                        </div>
                     </div>
                 </div>

                 {/* Rx List */}
                 <div className="flex-1">
                     <div className="text-4xl font-serif font-bold italic mb-6 text-black ml-4">Rx</div>
                     <div className="space-y-6">
                         {printingRx.medications.map((m, i) => (
                             <div key={i} className="pl-6 text-black">
                                 <div className="font-bold text-xl flex items-baseline gap-2">
                                     <span className="text-sm font-normal opacity-50 w-6">{i+1})</span>
                                     {m.name}
                                     <span className="text-base font-normal opacity-80 ml-2">{m.dose}</span>
                                 </div>
                                 <div className="pl-8 mt-1 text-lg">
                                     {m.form} - {m.frequency}
                                 </div>
                                 {m.notes && (
                                     <div className="pl-8 mt-1 text-sm italic opacity-70">
                                         Note: {m.notes}
                                     </div>
                                 )}
                             </div>
                         ))}
                     </div>
                 </div>

                 {/* Footer Signature Area */}
                 <div className="mt-auto pt-8 flex justify-end">
                     <div className="w-48 border-t border-black text-center pt-2 text-black">
                         Doctor Signature
                     </div>
                 </div>
              </div>
          )}
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)}></div>
      )}

      {/* Main Sidebar */}
      <div className={`fixed inset-y-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')} lg:relative lg:translate-x-0 flex flex-col border-e dark:border-gray-700 no-print`}>
        {/* ... (Sidebar Header) ... */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-500 to-secondary-500 flex items-center justify-center text-white shadow-lg shadow-primary-500/30">
               <Activity size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white truncate max-w-[140px] leading-tight">{data.clinicName}</h2>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500">
            <X size={24} />
          </button>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          <NavButton icon={Users} label={t.patients} active={currentView === 'patients'} onClick={() => { setCurrentView('patients'); setSidebarOpen(false); setSelectedPatientId(null); }} />
          <NavButton icon={StickyNote} label={t.memos} active={currentView === 'memos'} onClick={() => { setCurrentView('memos'); setSidebarOpen(false); }} />
          <NavButton icon={Calendar} label={t.calendar} active={currentView === 'calendar'} onClick={() => { setCurrentView('calendar'); setSidebarOpen(false); }} />
          <NavButton icon={ShoppingBag} label={t.purchases} active={currentView === 'purchases'} onClick={() => { setCurrentView('purchases'); setSidebarOpen(false); }} />
          <NavButton icon={Settings} label={t.settings} active={currentView === 'settings'} onClick={() => { setCurrentView('settings'); setSidebarOpen(false); }} />
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 w-full p-3 rounded-xl transition font-medium">
            <LogOut size={20} />
            <span>{t.logout}</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative bg-gray-100 dark:bg-gray-900 no-print">
        {/* Header (Mobile) */}
        <header className="lg:hidden bg-white dark:bg-gray-800 p-4 shadow-sm flex items-center justify-between z-30 shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 dark:text-gray-300">
            <Menu size={24} />
          </button>
          <span className="font-bold text-gray-800 dark:text-white">{data.clinicName}</span>
          <div className="w-6"></div> 
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-auto p-4 lg:p-8 relative custom-scrollbar">
          
          {/* Memos View */}
          {currentView === 'memos' && (
             /* ... Memos Code ... */
            <div className="w-full animate-fade-in pb-10">
               {/* ... (Existing Memos Code) ... */}
               <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.memos}</h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your quick notes and reminders</p>
                </div>
                <button 
                  onClick={() => { setSelectedMemo(null); setShowMemoModal(true); }}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl shadow-lg shadow-primary-500/30 transition"
                >
                  <Plus size={20} />
                  <span>{t.newMemo}</span>
                </button>
              </div>

              {(!data.memos || data.memos.length === 0) ? (
                 <div className="flex flex-col items-center justify-center py-20 text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-3xl">
                   <StickyNote size={64} className="mb-4 opacity-20" />
                   <p>No memos yet. Click add to create one.</p>
                 </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {data.memos.map(memo => {
                    const colorStyle = MEMO_COLORS.find(c => c.id === memo.color) || MEMO_COLORS[0];
                    return (
                      <div 
                        key={memo.id} 
                        onClick={() => { setSelectedMemo(memo); setShowMemoModal(true); }}
                        className={`p-6 rounded-3xl shadow-sm border relative group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer bg-gradient-to-br ${colorStyle.class}`}
                      >
                         <div className="absolute top-4 right-4 text-black/20 dark:text-white/20">
                            <Pin size={20} className="transform rotate-45" fill="currentColor" />
                         </div>
                         <div className="flex justify-between items-start mb-4 pr-6">
                           <h3 className="font-bold text-xl leading-tight text-gray-900 dark:text-gray-100">{memo.title}</h3>
                         </div>
                         <p className="whitespace-pre-wrap text-sm leading-relaxed min-h-[80px] opacity-90 text-gray-800 dark:text-gray-200">{memo.content}</p>
                         <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/10 text-xs opacity-70 flex justify-between items-center font-medium">
                            <span>{getLocalizedDate(parseISO(memo.date), 'full', currentLang)}</span>
                            <button 
                                onClick={(e) => handleDeleteMemo(memo.id, e)}
                                className="p-2 bg-white/40 dark:bg-black/20 rounded-full hover:bg-red-500 hover:text-white transition group-hover:opacity-100 opacity-0"
                            >
                                <Trash2 size={14} />
                            </button>
                         </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Purchases View */}
          {currentView === 'purchases' && (
             /* ... Purchases Code ... */
             <div className="w-full animate-fade-in pb-10">
               {/* ... (Existing Purchases Code) ... */}
               <div className="flex justify-between items-center mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.purchases}</h1>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Track materials and supplies needed for the clinic</p>
                </div>
                <button 
                  onClick={() => { setSelectedSupply(null); setShowSupplyModal(true); }}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl shadow-lg shadow-primary-500/30 transition"
                >
                  <Plus size={20} />
                  <span>{t.addItem}</span>
                </button>
              </div>

               <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                   {(data.supplies || []).length === 0 ? (
                       <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                           <ShoppingBag size={48} className="mb-4 opacity-20" />
                           <p>No items in the list.</p>
                       </div>
                   ) : (
                       <table className="w-full text-start">
                           <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700">
                               <tr>
                                   <th className="px-6 py-4 text-start font-bold text-gray-700 dark:text-gray-200">{t.itemName}</th>
                                   <th className="px-6 py-4 text-start font-bold text-gray-700 dark:text-gray-200">{t.quantity}</th>
                                   <th className="px-6 py-4 text-end font-bold text-gray-700 dark:text-gray-200">Action</th>
                               </tr>
                           </thead>
                           <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                               {(data.supplies || []).map(item => (
                                   <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                       <td className="px-6 py-4 text-gray-800 dark:text-white font-medium">{item.name}</td>
                                       <td className="px-6 py-4">
                                           <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg font-bold">
                                               {item.quantity}
                                           </span>
                                       </td>
                                       <td className="px-6 py-4 flex justify-end gap-2">
                                           <button onClick={() => { setSelectedSupply(item); setShowSupplyModal(true); }} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 size={18} /></button>
                                           <button onClick={() => handleDeleteSupply(item.id)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={18} /></button>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   )}
               </div>
             </div>
          )}

          {/* Patients View */}
          {currentView === 'patients' && !activePatient && (
             /* ... Patient List Code ... */
             <div className="flex flex-col w-full pb-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                 <div>
                   <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{t.patients}</h1>
                   <p className="text-sm text-gray-500">{data.patients.length} registered patients</p>
                 </div>
                 <button 
                  onClick={() => setShowNewPatientModal(true)}
                  className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-3 rounded-xl shadow-lg shadow-primary-500/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus size={20} />
                  <span>{t.newPatient}</span>
                </button>
              </div>

              {/* ... (Existing Filters and List) ... */}
              <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar">
                  {CATEGORIES.map(cat => (
                      <button 
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-4 py-2 rounded-xl whitespace-nowrap text-sm font-bold transition ${
                            selectedCategory === cat.id 
                            ? 'bg-gray-800 text-white dark:bg-white dark:text-gray-900 shadow-md' 
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-700'
                        }`}
                      >
                          {isRTL ? (currentLang === 'ku' ? cat.labelKu : cat.labelAr) : cat.label}
                      </button>
                  ))}
              </div>

              <div className="mb-6 relative flex gap-2">
                <div className="relative flex-1">
                   <Search className="absolute top-1/2 -translate-y-1/2 start-4 text-gray-400" size={20} />
                   <input 
                     type="text" 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     placeholder={t.searchPatients}
                     className="w-full ps-12 pe-4 py-4 rounded-xl border-none shadow-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:ring-2 focus:ring-primary-500 transition"
                   />
                </div>
                <button 
                    onClick={() => setShowFilter(!showFilter)}
                    className={`px-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-2 font-bold transition ${showFilter ? 'bg-primary-50 text-primary-600' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400'}`}
                >
                    <Filter size={20} />
                    <span className="hidden sm:inline">{t.filter}</span>
                </button>
              </div>

              {/* ADVANCED FILTER PANEL */}
              {showFilter && (
                  <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 animate-fade-in grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                      {/* ... (Existing Filter Options) ... */}
                       <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">{t.doctors}</label>
                          <select value={filterDoctor} onChange={(e) => setFilterDoctor(e.target.value)} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border-none text-sm outline-none">
                              <option value="">{t.selectDoctor}</option>
                              {data.doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">{t.gender}</label>
                          <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border-none text-sm outline-none">
                              <option value="">All</option>
                              <option value="male">{t.male}</option>
                              <option value="female">{t.female}</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">{t.ageGroup}</label>
                          <select value={filterAge} onChange={(e) => setFilterAge(e.target.value)} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border-none text-sm outline-none">
                              <option value="">All</option>
                              <option value="under18">{t.under18}</option>
                              <option value="18-35">{t.from18to35}</option>
                              <option value="over35">{t.over35}</option>
                          </select>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">{t.status}</label>
                          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full p-2 rounded-lg bg-gray-50 dark:bg-gray-700 border-none text-sm outline-none capitalize">
                              <option value="">All</option>
                              <option value="active">{t.active}</option>
                              <option value="finished">{t.finished}</option>
                              <option value="pending">{t.pending}</option>
                              <option value="discontinued">{t.discontinued}</option>
                          </select>
                      </div>
                      <div className="sm:col-span-2 md:col-span-4 flex justify-end">
                           <button onClick={resetFilters} className="text-sm text-red-500 hover:underline">{t.clearFilters}</button>
                      </div>
                  </div>
              )}

              {/* VERTICAL LIST LAYOUT */}
              <div className="flex flex-col gap-3">
                {filteredPatients.length === 0 ? (
                    <div className="text-center py-10 text-gray-400 bg-white dark:bg-gray-800 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                        {searchQuery || showFilter ? "No patients match your search filters." : "No patients found in this category."}
                    </div>
                ) : (
                    filteredPatients.map(patient => (
                    <div key={patient.id} className="group bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md hover:border-primary-200 dark:hover:border-primary-900 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        
                        {/* Clickable Area for Profile */}
                        <div 
                        className="flex items-center gap-4 cursor-pointer flex-1"
                        onClick={() => { setSelectedPatientId(patient.id); setPatientTab('overview'); }}
                        >
                        <div className="relative">
                            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl overflow-hidden shrink-0 border-2 border-white dark:border-gray-600 shadow-sm">
                                <span>{patient.gender === 'male' ? '👨' : '👩'}</span>
                            </div>
                            <div className={`absolute bottom-0 end-0 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800 ${STATUS_COLORS[patient.status].split(' ')[0].replace('bg-', 'bg-')}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-gray-800 dark:text-white group-hover:text-primary-600 transition">{patient.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <span dir="ltr">{patient.phoneCode} {patient.phone}</span>
                            <span>•</span>
                            <span className="uppercase text-xs font-bold bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">{t[patient.status] || patient.status}</span>
                            <span className="hidden sm:inline">•</span>
                            <span className="hidden sm:inline text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">
                                {patient.category ? (CATEGORIES.find(c => c.id === patient.category)?.[isRTL ? (currentLang === 'ku' ? 'labelKu' : 'labelAr') : 'label'] || patient.category) : 'Other'}
                            </span>
                            </div>
                        </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 self-end sm:self-center">
                            <a 
                                href={`https://wa.me/${patient.phoneCode?.replace('+','')}${patient.phone}`}
                                target="_blank" 
                                rel="noreferrer"
                                className="p-3 bg-green-100 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition"
                                title="Contact on WhatsApp"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <MessageCircle size={20} />
                            </a>
                            <button 
                                onClick={(e) => { e.stopPropagation(); setSelectedPatientId(patient.id); setPatientTab('overview'); }}
                                className="p-3 bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-xl transition"
                            >
                                <ChevronRight size={20} className="rtl:rotate-180" />
                            </button>
                        </div>

                    </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* Individual Patient Detail View */}
          {currentView === 'patients' && activePatient && (
             /* ... Detail View Code ... */
             <div className="flex flex-col gap-6 animate-fade-in w-full pb-10">
               {/* ... (Existing Header and Tabs) ... */}
               <div className="shrink-0 bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 flex flex-col">
                <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                    
                    <button onClick={() => setSelectedPatientId(null)} className="md:hidden mb-2 flex items-center gap-2 text-gray-500">
                        <ArrowLeft size={20} className="rtl:rotate-180" /> Back
                    </button>

                    <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-4xl relative shadow-inner overflow-hidden group shrink-0 mx-auto md:mx-0">
                        <span>{activePatient.gender === 'male' ? '👨' : '👩'}</span>
                    </div>

                    <div className="flex-1 text-center md:text-start w-full">
                        <div className="flex flex-col md:flex-row justify-between items-center mb-2">
                            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{activePatient.name}</h2>
                            <div className="flex gap-2 mt-3 md:mt-0">
                                <button onClick={() => setSelectedPatientId(null)} className="hidden md:flex items-center gap-2 text-gray-400 hover:text-gray-800 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                                    <ArrowLeft size={20} className="rtl:rotate-180" /> {t.backToPatients}
                                </button>
                                <button onClick={() => setShowEditPatientModal(true)} className="p-2 text-gray-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"><Edit2 size={20} /></button>
                                <button onClick={() => handleDeletePatient(activePatient.id)} className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"><Trash2 size={20} /></button>
                            </div>
                        </div>
                        
                        <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                    <Phone size={14} />
                                    <span dir="ltr">{activePatient.phoneCode} {activePatient.phone}</span>
                                </div>
                                <button 
                                    onClick={() => navigator.clipboard.writeText(`${activePatient.phoneCode}${activePatient.phone}`)}
                                    className="text-gray-400 hover:text-primary-500 transition"
                                    title="Copy Phone"
                                >
                                    <Copy size={14} />
                                </button>
                            </div>
                            <span className="hidden md:inline">•</span>
                            <div className="flex items-center gap-1">
                                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                                    {CATEGORIES.find(c => c.id === activePatient.category)?.labelAr || 'Other'}
                                </span>
                            </div>
                             <span className="hidden md:inline">•</span>
                            <a 
                                href={`https://wa.me/${activePatient.phoneCode?.replace('+','')}${activePatient.phone}`}
                                target="_blank" 
                                rel="noreferrer"
                                className="flex items-center gap-1 text-green-600 hover:underline"
                            >
                                <MessageCircle size={14} /> WhatsApp
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-t border-gray-100 dark:border-gray-700 pt-4">
                  <TabButton icon={User} label={t.overview} active={patientTab === 'overview'} onClick={() => setPatientTab('overview')} />
                  <TabButton icon={Activity} label={t.treatment} active={patientTab === 'chart'} onClick={() => setPatientTab('chart')} />
                  <TabButton icon={Calendar} label={t.visitHistory} active={patientTab === 'visits'} onClick={() => setPatientTab('visits')} />
                  <TabButton icon={CreditCard} label={t.financials} active={patientTab === 'finance'} onClick={() => setPatientTab('finance')} />
                  <TabButton icon={Pill} label={t.prescriptions} active={patientTab === 'prescriptions'} onClick={() => setPatientTab('prescriptions')} />
                </div>
              </div>

              {/* Detail Content Area */}
              <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 lg:p-8">
                {patientTab === 'overview' && (
                  <div className="space-y-8 animate-fade-in">
                     {/* ... (Existing Overview code) ... */}
                      <div>
                       <div className="flex justify-between items-center mb-4">
                           <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                             <User size={20} className="text-primary-500" />
                             Patient Details
                           </h3>
                           <div className="flex gap-2">
                               <select 
                                   value={activePatient.status}
                                   onChange={(e) => updatePatient(activePatient.id, { status: e.target.value as any })}
                                   className={`px-3 py-1.5 rounded-lg border text-sm font-bold outline-none capitalize ${STATUS_COLORS[activePatient.status]}`}
                               >
                                   <option value="active">{t.active}</option>
                                   <option value="finished">{t.finished}</option>
                                   <option value="pending">{t.pending}</option>
                                   <option value="discontinued">{t.discontinued}</option>
                               </select>
                           </div>
                       </div>
                       
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 dark:bg-gray-700/50 p-5 rounded-2xl">
                         <InfoItem label={t.name} value={activePatient.name} />
                         <InfoItem label={t.phone} value={`${activePatient.phoneCode || ''} ${activePatient.phone}`} />
                         <InfoItem label={t.age} value={activePatient.age.toString()} />
                         <InfoItem label={t.gender} value={activePatient.gender === 'male' ? t.male : t.female} />
                         <InfoItem label={t.treatingDoctor} value={data.doctors.find(d => d.id === activePatient.doctorId)?.name} />
                         <InfoItem label={t.category} value={CATEGORIES.find(c => c.id === activePatient.category)?.labelAr} />
                         <InfoItem label={t.registrationDate} value={getLocalizedDate(parseISO(activePatient.createdAt), 'full', currentLang)} className="md:col-span-2" />
                         <InfoItem label={t.address} value={activePatient.address || '-'} className="md:col-span-2" />
                       </div>
                     </div>

                     {/* Editable Medical History */}
                     <div>
                       <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                         <ClipboardList size={20} className="text-primary-500" />
                         {t.medicalHistory}
                       </h3>
                       <textarea 
                           className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-gray-700 border-none outline-none focus:ring-2 focus:ring-primary-500 dark:text-white min-h-[120px]"
                           value={activePatient.medicalHistory}
                           onChange={(e) => updatePatient(activePatient.id, { medicalHistory: e.target.value })}
                           placeholder="No medical history recorded."
                       />
                     </div>
                     
                     {/* Notes */}
                     <div>
                       <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                         <StickyNote size={20} className="text-primary-500" />
                         {t.notes}
                       </h3>
                       <textarea 
                           className="w-full p-4 rounded-2xl bg-yellow-50 dark:bg-gray-700 border-none outline-none focus:ring-2 focus:ring-yellow-400 dark:text-white min-h-[120px]"
                           value={activePatient.notes}
                           onChange={(e) => updatePatient(activePatient.id, { notes: e.target.value })}
                           placeholder="Add notes here..."
                       />
                     </div>
                  </div>
                )}
                
                {patientTab === 'chart' && (
                  <div className="space-y-8 animate-fade-in">
                    <TeethChart 
                      teeth={activePatient.teeth} 
                      onToothClick={(id, status) => handleUpdateTooth(activePatient.id, id, status)} 
                      language={currentLang}
                    />

                    {/* RCT Table */}
                    <div className="mt-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white">{t.rct}</h3>
                        </div>

                         {/* New Input Row for RCT */}
                        <div className="flex flex-wrap items-end gap-2 mb-4 bg-gray-50 dark:bg-gray-700/30 p-3 rounded-xl border border-gray-100 dark:border-gray-600">
                             <div>
                                 <label className="text-xs font-bold text-gray-500 mb-1 block pl-1">{t.tooth}</label>
                                 <input 
                                    className="w-16 p-2 rounded-lg text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 outline-none" 
                                    placeholder="#"
                                    value={rctInput.tooth}
                                    onChange={e => setRctInput({...rctInput, tooth: e.target.value})}
                                 />
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-gray-500 mb-1 block pl-1">{t.canal}</label>
                                 <input 
                                    className="w-24 p-2 rounded-lg text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 outline-none" 
                                    placeholder="MB/DB/P"
                                    value={rctInput.canal}
                                    onChange={e => setRctInput({...rctInput, canal: e.target.value})}
                                 />
                             </div>
                             <div>
                                 <label className="text-xs font-bold text-gray-500 mb-1 block pl-1">{t.length}</label>
                                 <input 
                                    className="w-24 p-2 rounded-lg text-sm border border-gray-200 dark:border-gray-600 dark:bg-gray-800 outline-none" 
                                    placeholder="mm"
                                    value={rctInput.length}
                                    onChange={e => setRctInput({...rctInput, length: e.target.value})}
                                 />
                             </div>
                             <button 
                                onClick={() => {
                                    if(rctInput.tooth && rctInput.canal && rctInput.length) {
                                        handleAddRCT(activePatient.id, { 
                                            toothNumber: rctInput.tooth, 
                                            canalName: rctInput.canal, 
                                            length: rctInput.length, 
                                            date: new Date().toISOString() 
                                        });
                                    }
                                }}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg font-bold text-sm shadow-md hover:bg-primary-700 transition"
                             >
                                 + {t.addRCT}
                             </button>
                        </div>
                        
                        {(activePatient.rootCanals || []).length > 0 ? (
                           <div className="bg-gray-50 dark:bg-gray-700/50 rounded-2xl p-4 overflow-x-auto">
                              <table className="w-full text-sm">
                                  <thead>
                                      <tr className="text-gray-500 text-start">
                                          <th className="pb-2 px-2">{t.tooth}</th>
                                          <th className="pb-2 px-2">{t.canal}</th>
                                          <th className="pb-2 px-2">{t.length}</th>
                                          <th className="pb-2 px-2">Date</th>
                                          <th className="pb-2 px-2">Action</th>
                                      </tr>
                                  </thead>
                                  <tbody>
                                      {activePatient.rootCanals.map((r) => (
                                          <tr key={r.id} className="border-t border-gray-200 dark:border-gray-600">
                                              <td className="py-2 px-2 font-bold">{r.toothNumber}</td>
                                              <td className="py-2 px-2">{r.canalName}</td>
                                              <td className="py-2 px-2">{r.length}</td>
                                              <td className="py-2 px-2 text-xs opacity-70">{new Date(r.date).toLocaleDateString()}</td>
                                              <td className="py-2 px-2">
                                                  <button onClick={() => handleDeleteRCT(activePatient.id, r.id)} className="text-red-500 hover:text-red-700"><Trash2 size={14}/></button>
                                              </td>
                                          </tr>
                                      ))}
                                  </tbody>
                              </table>
                           </div>
                        ) : (
                            <p className="text-gray-400 text-sm italic text-center py-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl">No RCT data.</p>
                        )}
                    </div>
                  </div>
                )}
                
                {patientTab === 'visits' && (
                  <div className="animate-fade-in">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">Appointment History</h3>
                      <button 
                        onClick={() => { setSelectedAppointment(null); setShowAppointmentModal(true); setAppointmentMode('existing'); }}
                        className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-primary-700"
                      >
                        <Plus size={16} /> {t.addAppointment}
                      </button>
                    </div>

                    <div className="space-y-3">
                      {activePatient.appointments.length === 0 ? (
                         <div className="text-center py-8 text-gray-400 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-600">
                             No visits recorded.
                         </div>
                      ) : (
                         [...activePatient.appointments].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(appt => (
                          <div key={appt.id} className="flex flex-col sm:flex-row gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-600 items-start sm:items-center">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="font-bold text-gray-800 dark:text-white">
                                        {getLocalizedDate(parseISO(appt.date), 'full', currentLang)} at {formatTime12(appt.time)}
                                    </span>
                                    <span className={`px-2 py-0.5 text-xs rounded uppercase font-bold ${
                                        appt.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                        appt.status === 'cancelled' ? 'bg-red-100 text-red-700' : 
                                        'bg-blue-100 text-blue-700'
                                    }`}>{(t as any)[appt.status] ?? appt.status}</span>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {getTreatmentLabel(appt.treatmentType) || 'Checkup'} • {appt.duration || 30} min
                                    {appt.sessionNumber && ` • Session ${appt.sessionNumber}`}
                                </div>
                                {appt.notes && <div className="text-sm text-gray-400 mt-1 italic">"{appt.notes}"</div>}
                            </div>
                            <div className="flex gap-2 self-end sm:self-center">
                                <button onClick={() => { setSelectedAppointment(appt); setShowAppointmentModal(true); setAppointmentMode('existing'); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                <button onClick={() => handleDeleteAppointment(activePatient.id, appt.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
                
                {patientTab === 'finance' && (
                  <div className="animate-fade-in space-y-8">
                     {/* ... (Existing Finance logic) ... */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-2xl border border-green-100 dark:border-green-800">
                            <span className="text-xs font-bold text-green-600 dark:text-green-400 uppercase">{t.totalPaid}</span>
                            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                                {data.settings.currency} {activePatient.payments.filter(p => p.type === 'payment').reduce((acc, curr) => acc + curr.amount, 0)}
                            </div>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-100 dark:border-blue-800">
                            <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">{t.totalCost}</span>
                            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                                {data.settings.currency} {activePatient.payments.filter(p => p.type === 'charge').reduce((acc, curr) => acc + curr.amount, 0)}
                            </div>
                        </div>
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-100 dark:border-orange-800">
                            <span className="text-xs font-bold text-orange-600 dark:text-orange-400 uppercase">{t.remaining}</span>
                            <div className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                                {data.settings.currency} {
                                    activePatient.payments.filter(p => p.type === 'charge').reduce((acc, curr) => acc + curr.amount, 0) - 
                                    activePatient.payments.filter(p => p.type === 'payment').reduce((acc, curr) => acc + curr.amount, 0)
                                }
                            </div>
                        </div>
                      </div>

                      <div className="flex gap-4">
                          <button 
                            onClick={() => { setPaymentType('charge'); setShowPaymentModal(true); }}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-500/30 transition flex justify-center items-center gap-2"
                          >
                             <Plus size={18} /> {t.addCharge}
                          </button>
                          <button 
                            onClick={() => { setPaymentType('payment'); setShowPaymentModal(true); }}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-green-500/30 transition flex justify-center items-center gap-2"
                          >
                             <DollarSign size={18} /> {t.addPayment}
                          </button>
                      </div>

                      <div className="space-y-3">
                          <h3 className="font-bold text-gray-800 dark:text-white mt-4">Transaction History</h3>
                          {activePatient.payments.length === 0 ? (
                              <p className="text-center text-gray-400 italic py-4">No transactions yet.</p>
                          ) : (
                              activePatient.payments.map(p => (
                                  <div key={p.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-100 dark:border-gray-600">
                                      <div>
                                          <div className={`text-sm font-bold uppercase mb-1 ${p.type === 'payment' ? 'text-green-600' : 'text-blue-600'}`}>
                                              {p.type === 'payment' ? 'Payment Received' : 'Treatment Cost'}
                                          </div>
                                          <div className="text-gray-800 dark:text-white font-medium">{p.description}</div>
                                          <div className="text-xs text-gray-500">{new Date(p.date).toLocaleDateString()}</div>
                                      </div>
                                      <div className="text-xl font-bold text-gray-800 dark:text-white">
                                          {p.type === 'payment' ? '+' : '-'}{p.amount}
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
                )}

                {patientTab === 'prescriptions' && (
                    <div className="animate-fade-in space-y-6">
                        {/* Header & Add Button */}
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                <Pill className="text-primary-500" /> {t.prescriptions}
                            </h3>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setShowAddMasterDrugModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-xl font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                                >
                                    <Plus size={16} /> {t.addMasterDrug}
                                </button>
                                <button 
                                    onClick={() => setShowRxModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl font-bold text-sm shadow-md hover:bg-primary-700 transition"
                                >
                                    <Plus size={16} /> {t.newPrescription}
                                </button>
                            </div>
                        </div>

                        {/* List of Prescriptions */}
                        {(!activePatient.prescriptions || activePatient.prescriptions.length === 0) ? (
                            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-600">
                                <Pill size={48} className="mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-500">No prescriptions recorded yet.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {activePatient.prescriptions.map((rx) => (
                                    <div key={rx.id} className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl p-5 shadow-sm hover:shadow-md transition">
                                        <div className="flex justify-between items-start mb-4 border-b border-gray-100 dark:border-gray-600 pb-3">
                                            <div>
                                                <div className="text-sm font-bold text-gray-400 uppercase tracking-wide">Date</div>
                                                <div className="font-bold text-lg text-gray-800 dark:text-white">
                                                    {getLocalizedDate(parseISO(rx.date), 'full', currentLang)}
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                 <button 
                                                    onClick={() => handleDeleteRx(rx.id)}
                                                    className="p-2 text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={20} />
                                                </button>
                                                <button 
                                                    onClick={() => setPrintingRx(rx)}
                                                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg font-bold text-sm hover:bg-gray-200 transition"
                                                >
                                                    <Printer size={16} /> {t.print}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            {rx.medications.map((med, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                                                    <span className="font-bold text-gray-800 dark:text-white min-w-[20px]">{idx + 1}.</span>
                                                    <span className="font-bold text-primary-700 dark:text-primary-300 text-lg">{med.name}</span>
                                                    <span className="text-gray-600 dark:text-gray-300 text-sm bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded-md">{med.dose}</span>
                                                    <span className="text-gray-500 dark:text-gray-400 italic text-sm">- {med.form} {med.frequency}</span>
                                                    {med.notes && <span className="text-xs text-gray-400 ml-2">({med.notes})</span>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

              </div>
             </div>
          )}

          {/* Calendar View */}
          {currentView === 'calendar' && (
             /* ... Calendar Code ... */
            <div className="w-full animate-fade-in pb-10">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                 <div>
                   <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{t.calendar}</h1>
                   <p className="text-gray-500 dark:text-gray-400 mt-1">Manage appointments and schedules</p>
                 </div>
                 <div className="flex bg-gray-100 dark:bg-gray-700 p-1 rounded-xl">
                    {(['month', 'week', 'day'] as const).map(v => (
                        <button
                            key={v}
                            onClick={() => setCalendarView(v)}
                            className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition ${calendarView === v ? 'bg-white dark:bg-gray-600 shadow text-gray-800 dark:text-white' : 'text-gray-500'}`}
                        >
                            {t[v]}
                        </button>
                    ))}
                 </div>
              </div>

              {/* Calendar Controls */}
              <div className="flex items-center justify-between mb-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                      <button onClick={() => setCurrentDate(calendarView === 'month' ? subMonths(currentDate, 1) : calendarView === 'week' ? subWeeks(currentDate, 1) : subDays(currentDate, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronLeft /></button>
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white min-w-[140px] text-center">
                          {getLocalizedDate(currentDate, 'month', currentLang)}
                      </h2>
                      <button onClick={() => setCurrentDate(calendarView === 'month' ? addMonths(currentDate, 1) : calendarView === 'week' ? addWeeks(currentDate, 1) : addDays(currentDate, 1))} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"><ChevronRight className="rtl:rotate-180" /></button>
                  </div>
                  <button onClick={() => setCurrentDate(new Date())} className="text-primary-600 font-bold hover:bg-primary-50 px-3 py-1.5 rounded-lg transition">{t.today}</button>
              </div>

              {/* Month View */}
              {calendarView === 'month' && (
                  <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                      <div className="grid grid-cols-7 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                              <div key={d} className="py-3 text-center text-sm font-bold text-gray-500">{d}</div>
                          ))}
                      </div>
                      <div className="grid grid-cols-7 auto-rows-[100px] md:auto-rows-[120px]">
                          {eachDayOfInterval({ start: startOfWeek(startOfMonth(currentDate)), end: endOfWeek(endOfMonth(currentDate)) }).map((day, idx) => {
                              const isToday = isSameDay(day, new Date());
                              const isCurrentMonth = isSameMonth(day, currentDate);
                              const dayAppointments = allAppointments.filter(a => isSameDay(parseISO(a.date), day));
                              
                              return (
                                  <div 
                                    key={idx} 
                                    onClick={() => { setCurrentDate(day); setCalendarView('day'); }}
                                    className={`border-b border-r border-gray-100 dark:border-gray-700 p-2 transition hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer flex flex-col items-start gap-1 ${!isCurrentMonth ? 'bg-gray-50/50 dark:bg-gray-900/50' : ''}`}
                                  >
                                      <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary-600 text-white' : isCurrentMonth ? 'text-gray-700 dark:text-gray-300' : 'text-gray-300 dark:text-gray-600'}`}>
                                          {format(day, 'd')}
                                      </span>
                                      
                                      {/* Mini Names Logic */}
                                      <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                                          {dayAppointments.slice(0, 3).map((appt, i) => (
                                              <div key={i} className="text-[10px] text-gray-600 dark:text-gray-300 truncate w-full px-1 leading-tight bg-blue-50/50 dark:bg-blue-900/20 rounded-sm border-l-2 border-blue-400">
                                                  {appt.patientName}
                                              </div>
                                          ))}
                                          {dayAppointments.length > 3 && <span className="text-[9px] text-gray-400 pl-1">+{dayAppointments.length - 3}</span>}
                                      </div>
                                  </div>
                              )
                          })}
                      </div>
                  </div>
              )}

              {/* Day View */}
              {calendarView === 'day' && (
                  <div className="space-y-4">
                      {/* Localized Full Day Name */}
                      <h2 className="text-2xl font-bold text-gray-800 dark:text-white px-2">
                        {getLocalizedDate(currentDate, 'weekday', currentLang)}, {getLocalizedDate(currentDate, 'full', currentLang)}
                      </h2>
                      
                      <button 
                        onClick={() => {
                            setSelectedAppointment(null);
                            setAppointmentMode('new'); // Guest Mode
                            setShowAppointmentModal(true);
                        }}
                        className="w-full py-4 bg-primary-50 dark:bg-gray-700 border-2 border-dashed border-primary-200 dark:border-gray-600 rounded-2xl text-primary-600 dark:text-primary-300 font-bold hover:bg-primary-100 dark:hover:bg-gray-600 transition flex items-center justify-center gap-2"
                      >
                          <Plus size={20} /> {t.addAppointment}
                      </button>

                      <div className="space-y-3">
                          {allAppointments.filter(a => isSameDay(parseISO(a.date), currentDate))
                             .sort((a,b) => a.time.localeCompare(b.time))
                             .map(appt => (
                                 <div key={appt.id} className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-wrap gap-4 items-center">
                                     <div className="w-20 text-center border-r border-gray-100 dark:border-gray-700 pr-4">
                                         <div className="text-lg font-bold text-gray-800 dark:text-white">{formatTime12(appt.time)}</div>
                                         <div className="text-xs text-gray-500">{appt.duration} min</div>
                                     </div>
                                     <div className="flex-1 min-w-[200px]">
                                         <div className="flex items-center gap-2 mb-1">
                                             <h3 className="font-bold text-lg text-gray-800 dark:text-white">{appt.patientName}</h3>
                                             {!appt.patientId && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">Guest</span>}
                                         </div>
                                         <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                             {getTreatmentLabel(appt.treatmentType) || 'General'}
                                             {appt.sessionNumber && <span>• Session {appt.sessionNumber}</span>}
                                         </div>
                                     </div>
                                     
                                     {/* Status Toggles */}
                                     <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                                         <button 
                                            onClick={() => handleUpdateAppointmentStatus(appt.patientId, appt.id, 'completed')}
                                            className={`p-2 rounded-md transition ${appt.status === 'completed' ? 'bg-green-500 text-white shadow' : 'text-gray-400 hover:text-green-500'}`}
                                            title="Completed"
                                         >
                                             <Check size={18} />
                                         </button>
                                         <button 
                                            onClick={() => handleUpdateAppointmentStatus(appt.patientId, appt.id, 'noshow')}
                                            className={`p-2 rounded-md transition ${appt.status === 'noshow' ? 'bg-red-500 text-white shadow' : 'text-gray-400 hover:text-red-500'}`}
                                            title="No Show"
                                         >
                                             <XIcon size={18} />
                                         </button>
                                         {/* Reset Status */}
                                         {(appt.status === 'completed' || appt.status === 'noshow') && (
                                            <button 
                                                onClick={() => handleUpdateAppointmentStatus(appt.patientId, appt.id, 'scheduled')}
                                                className="p-2 ml-1 text-gray-400 hover:text-blue-500"
                                                title="Reset"
                                            >
                                                <History size={16} />
                                            </button>
                                         )}
                                     </div>

                                     <div className="flex gap-2">
                                         {appt.patientId ? (
                                             <button 
                                                onClick={() => { setSelectedPatientId(appt.patientId); setCurrentView('patients'); setPatientTab('overview'); }}
                                                className="px-3 py-2 bg-primary-50 text-primary-600 rounded-lg font-bold text-sm hover:bg-primary-100 transition"
                                             >
                                                 Profile
                                             </button>
                                         ) : (
                                             <button 
                                                onClick={() => { setGuestToConvert(appt); setShowNewPatientModal(true); }}
                                                className="px-3 py-2 bg-green-50 text-green-600 rounded-lg font-bold text-sm hover:bg-green-100 transition"
                                             >
                                                 {t.addToPatients}
                                             </button>
                                         )}
                                         <button onClick={() => handleDeleteAppointment(appt.patientId, appt.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                                     </div>
                                 </div>
                             ))}
                          {allAppointments.filter(a => isSameDay(parseISO(a.date), currentDate)).length === 0 && (
                              <div className="text-center py-12 text-gray-400">No appointments for this day.</div>
                          )}
                      </div>
                  </div>
              )}
            </div>
          )}

           {/* Settings View */}
           {currentView === 'settings' && (
              <div className="animate-fade-in pb-10">
                  <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">{t.settings}</h1>
                  
                  <div className="space-y-6 max-w-2xl">
                    {/* Clinic & Doctors */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg border-b border-gray-100 dark:border-gray-700 pb-2">Clinic Details</h3>
                        
                        <div className="mb-6">
                            <label className="text-sm font-bold text-gray-500 mb-1 block">{t.clinicName}</label>
                            <div className="flex gap-2 items-center">
                                {isEditingClinic ? (
                                    <div className="flex-1 flex gap-2">
                                        <input 
                                            type="text" 
                                            value={data.clinicName} 
                                            onChange={(e) => setData(prev => ({ ...prev, clinicName: e.target.value }))}
                                            className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:text-white outline-none"
                                        />
                                        <button onClick={() => setIsEditingClinic(false)} className="bg-green-500 text-white p-2 rounded-lg"><Check size={18} /></button>
                                    </div>
                                ) : (
                                    <div className="flex-1 flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                                        <span className="font-medium text-gray-800 dark:text-white">{data.clinicName}</span>
                                        <button onClick={() => setIsEditingClinic(true)} className="text-blue-500"><Edit2 size={18} /></button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-sm font-bold text-gray-500">{t.doctors}</label>
                                <button onClick={() => setIsEditingDoctors(!isEditingDoctors)} className="text-xs font-bold text-primary-600 hover:underline">{isEditingDoctors ? 'Done' : t.manageDoctors}</button>
                            </div>
                            <div className="space-y-2">
                                {data.doctors.map(doc => (
                                    <div key={doc.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-xl">
                                        <span className="font-medium text-gray-800 dark:text-white">{doc.name}</span>
                                        {isEditingDoctors && (
                                            <button onClick={() => handleDeleteDoctor(doc.id)} className="text-red-500 bg-white dark:bg-gray-600 p-1.5 rounded-lg shadow-sm"><Trash2 size={14} /></button>
                                        )}
                                    </div>
                                ))}
                                {isEditingDoctors && (
                                    <form onSubmit={(e) => {
                                        e.preventDefault();
                                        const fd = new FormData(e.currentTarget);
                                        handleAddDoctor(fd.get('newDoc') as string);
                                        (e.target as HTMLFormElement).reset();
                                    }} className="flex gap-2 mt-2">
                                        <input name="newDoc" placeholder="Dr. Name" className="flex-1 p-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white outline-none" required />
                                        <button type="submit" className="bg-primary-600 text-white p-2 rounded-lg"><Plus size={18} /></button>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Preferences */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                       <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg border-b border-gray-100 dark:border-gray-700 pb-2">Preferences</h3>
                       
                       <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{t.darkMode}</span>
                          <button 
                             onClick={() => setData(prev => ({ ...prev, settings: { ...prev.settings, theme: prev.settings.theme === 'light' ? 'dark' : 'light' } }))}
                             className={`w-14 h-8 rounded-full p-1 transition duration-300 flex items-center ${data.settings.theme === 'dark' ? 'bg-indigo-600 justify-end' : 'bg-gray-200 justify-start'}`}
                          >
                             <div className="w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center text-gray-700">
                                {data.settings.theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                             </div>
                          </button>
                       </div>

                       <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-700 dark:text-gray-300">{t.language}</span>
                          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                             {(['en', 'ar', 'ku'] as const).map(lang => (
                                <button
                                   key={lang}
                                   onClick={() => setData(prev => ({ ...prev, settings: { ...prev.settings, language: lang } }))}
                                   className={`px-3 py-1.5 rounded-md text-sm font-bold transition ${data.settings.language === lang ? 'bg-white dark:bg-gray-600 shadow text-primary-600 dark:text-white' : 'text-gray-500'}`}
                                >
                                   {lang.toUpperCase()}
                                </button>
                             ))}
                          </div>
                       </div>
                       
                       <div>
                           <label className="block text-sm font-bold text-gray-500 mb-2">{t.rxBgUrl}</label>
                           <input 
                              type="text"
                              className="w-full p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                              placeholder={t.enterRxUrl}
                              value={data.settings.rxBackgroundImage || ''}
                              onChange={(e) => setData(prev => ({ ...prev, settings: { ...prev.settings, rxBackgroundImage: e.target.value } }))}
                           />
                           <p className="text-xs text-gray-400 mt-1">Paste a direct image link (e.g., from Imgur/Dropbox) for your A5 letterhead.</p>
                       </div>
                    </div>
                    
                    {/* Data Management */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-4 text-lg border-b border-gray-100 dark:border-gray-700 pb-2">Data</h3>
                        
                        <div className="flex flex-col gap-3">
                             <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl">
                                <div className="flex items-center gap-3">
                                   <Cloud size={24} className={syncStatus === 'synced' ? 'text-blue-600' : 'text-gray-400'} />
                                   <div>
                                      <div className="font-bold text-gray-800 dark:text-white">Cloud Sync</div>
                                      <div className="text-xs text-gray-500">{syncStatus === 'synced' ? t.synced : syncStatus === 'syncing' ? t.syncing : t.syncError}</div>
                                   </div>
                                </div>
                             </div>

                             <div className="flex gap-4 mt-2">
                                <button onClick={() => storageService.exportBackup(data)} className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 p-3 rounded-xl font-medium text-gray-700 dark:text-white transition">
                                    <Download size={18} /> {t.backup}
                                </button>
                                <label className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 p-3 rounded-xl font-medium text-gray-700 dark:text-white transition cursor-pointer">
                                    <Upload size={18} /> {t.import}
                                    <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
                                </label>
                             </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                        <div className="flex items-center justify-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
                            <Instagram size={18} /> @dr_haider_00
                        </div>
                        {deferredPrompt && (
                             <button onClick={handleInstallApp} className="mt-4 bg-primary-600 text-white px-6 py-2 rounded-full font-bold shadow-lg hover:bg-primary-700 transition">
                                 {t.installApp}
                             </button>
                        )}
                    </div>

                  </div>
              </div>
           )}

        </main>
      </div>

      {/* --- MODALS --- */}
      
      {/* New Patient Modal */}
      {showNewPatientModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{guestToConvert ? t.convertGuestTitle : t.newPatient}</h2>
              <button onClick={() => { setShowNewPatientModal(false); setGuestToConvert(null); }} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            
            <form 
              className="p-6 overflow-y-auto"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const patient = handleAddPatient(Object.fromEntries(fd));
                setSelectedPatientId(patient.id);
                setPatientTab('overview');
              }}
            >
              <div className="space-y-4">
                {/* Name */}
                <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.name} <span className="text-red-500">*</span></label>
                   <input name="name" defaultValue={guestToConvert?.patientName || ''} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" placeholder="Full Name" />
                </div>

                {/* Phone with Country Code (NOT REQUIRED) */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Country</label>
                        <select 
                            name="phoneCode" 
                            defaultValue={data.settings.defaultCountryCode} 
                            className="w-full px-2 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none text-sm"
                        >
                            {COUNTRY_CODES.map(c => (
                                <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-2">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.phone}</label>
                        <input name="phone" type="tel" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" placeholder="123 456 7890" />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.age}</label>
                        <input name="age" type="number" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" placeholder="0" />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.gender}</label>
                        <select name="gender" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none">
                            <option value="male">{t.male}</option>
                            <option value="female">{t.female}</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.treatingDoctor}</label>
                        <select name="doctorId" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none">
                            {data.doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.category}</label>
                        <select name="category" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none">
                            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                                <option key={c.id} value={c.id}>{isRTL ? (currentLang === 'ku' ? c.labelKu : c.labelAr) : c.label}</option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div>
                   <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.address}</label>
                   <input name="address" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none focus:ring-2 focus:ring-primary-500" placeholder="City, Street..." />
                </div>

                <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/30 transition mt-4">
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Patient Modal (Simplified version of New Patient) */}
      {showEditPatientModal && activePatient && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.editPatient}</h2>
                    <button onClick={() => setShowEditPatientModal(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
                  </div>
                  <form className="p-6 overflow-y-auto space-y-4" onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      updatePatient(activePatient.id, {
                          name: fd.get('name') as string,
                          phone: fd.get('phone') as string,
                          phoneCode: fd.get('phoneCode') as string,
                          age: parseInt(fd.get('age') as string) || 0,
                          gender: fd.get('gender') as any,
                          address: fd.get('address') as string,
                          doctorId: fd.get('doctorId') as string,
                          category: fd.get('category') as any
                      });
                      setShowEditPatientModal(false);
                  }}>
                      {/* Similar fields to New Patient but with defaultValues */}
                       <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.name}</label>
                          <input name="name" defaultValue={activePatient.name} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" />
                       </div>
                       <div className="grid grid-cols-3 gap-2">
                           <div className="col-span-1">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Code</label>
                                <select name="phoneCode" defaultValue={activePatient.phoneCode} className="w-full px-2 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none text-sm">
                                    {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.code}</option>)}
                                </select>
                           </div>
                           <div className="col-span-2">
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.phone}</label>
                                <input name="phone" defaultValue={activePatient.phone} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" />
                           </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                           <div>
                               <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.age}</label>
                               <input name="age" type="number" defaultValue={activePatient.age} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" />
                           </div>
                           <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.gender}</label>
                                <select name="gender" defaultValue={activePatient.gender} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none">
                                    <option value="male">{t.male}</option>
                                    <option value="female">{t.female}</option>
                                </select>
                           </div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.treatingDoctor}</label>
                                <select name="doctorId" defaultValue={activePatient.doctorId} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none">
                                    {data.doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.category}</label>
                                <select name="category" defaultValue={activePatient.category} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none">
                                    {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                                        <option key={c.id} value={c.id}>{isRTL ? (currentLang === 'ku' ? c.labelKu : c.labelAr) : c.label}</option>
                                    ))}
                                </select>
                            </div>
                       </div>
                       <div>
                           <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.address}</label>
                           <input name="address" defaultValue={activePatient.address} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" />
                       </div>
                       <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/30 transition mt-2">
                          {t.save}
                       </button>
                  </form>
              </div>
          </div>
      )}
      
      {/* Appointment Modal */}
      {showAppointmentModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                  {selectedAppointment ? 'Edit Appointment' : (appointmentMode === 'new' ? t.quickNewPatient : t.addAppointment)}
              </h2>
              <button onClick={() => setShowAppointmentModal(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
            </div>
            <form 
              className="p-6 space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                
                // If existing mode but we are in calendar "Quick Add", we need to ensure patient ID is passed if selected
                // But current logic for Quick Add is `appointmentMode === 'new'` -> No patient ID.
                // If `appointmentMode === 'existing'`, we expect `selectedPatientId` to be set.
                
                const apptData = {
                    date: fd.get('date') as string,
                    time: fd.get('time') as string,
                    duration: parseInt(fd.get('duration') as string),
                    treatmentType: fd.get('treatmentType') as string,
                    sessionNumber: parseInt(fd.get('sessionNumber') as string) || 1,
                    notes: fd.get('notes') as string,
                    patientName: fd.get('guestName') as string // Only used if mode is 'new'
                };
                
                handleAddAppointment(selectedPatientId, apptData);
              }}
            >
              {appointmentMode === 'existing' && selectedPatientId ? (
                   <div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-xl text-primary-700 dark:text-primary-300 font-bold text-center">
                       {data.patients.find(p => p.id === selectedPatientId)?.name}
                   </div>
              ) : (
                   <div>
                       <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.name} <span className="text-red-500">*</span></label>
                       <input name="guestName" required defaultValue={selectedAppointment?.patientName} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" placeholder="Guest Name" />
                   </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input name="date" type="date" defaultValue={selectedAppointment ? selectedAppointment.date.split('T')[0] : format(currentDate, 'yyyy-MM-dd')} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Time</label>
                  <input name="time" type="time" defaultValue={selectedAppointment ? selectedAppointment.time : '09:00'} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.treatmentType}</label>
                      <select name="treatmentType" defaultValue={selectedAppointment?.treatmentType || 'diagnosis'} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none">
                          {TREATMENT_TYPES.map(t => (
                              <option key={t.id} value={t.id}>{isRTL ? (currentLang === 'ku' ? t.ku : t.ar) : t.en}</option>
                          ))}
                      </select>
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.duration}</label>
                      <select name="duration" defaultValue={selectedAppointment?.duration || 30} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none">
                          {DURATIONS.map(d => <option key={d} value={d}>{d} {t.min}</option>)}
                      </select>
                  </div>
              </div>
              
              <div className="grid grid-cols-4 gap-4">
                   <div className="col-span-1">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.session}</label>
                      <input name="sessionNumber" type="number" min="1" defaultValue={selectedAppointment?.sessionNumber || 1} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" />
                   </div>
                   <div className="col-span-3">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.notes}</label>
                      <input name="notes" defaultValue={selectedAppointment?.notes} className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" placeholder="Optional notes" />
                   </div>
              </div>

              <button type="submit" className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/30 transition mt-4">
                {t.save}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && activePatient && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl shadow-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{paymentType === 'payment' ? t.addPayment : t.addCharge}</h3>
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      handleAddPayment(activePatient.id, parseFloat(fd.get('amount') as string), paymentType, fd.get('description') as string);
                  }} className="space-y-4">
                      {/* Reordered fields: Description First, Amount Second */}
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">{t.description}</label>
                          <input name="description" className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" placeholder="e.g. Consultation" />
                      </div>
                      <div>
                          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">Amount ({data.settings.currency})</label>
                          <input name="amount" type="number" required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none text-xl font-bold" placeholder="0.00" autoFocus />
                      </div>
                      <div className="flex gap-2 pt-2">
                          <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">{t.cancel}</button>
                          <button type="submit" className={`flex-1 py-3 text-white font-bold rounded-xl shadow-lg ${paymentType === 'payment' ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}>{t.save}</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Memo Modal */}
      {showMemoModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-3xl shadow-2xl p-6">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">{selectedMemo ? t.editMemo : t.newMemo}</h3>
              <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  handleSaveMemo(fd.get('title') as string, fd.get('content') as string, fd.get('color') as string);
              }} className="space-y-4">
                 <div>
                    <input name="title" defaultValue={selectedMemo?.title} required placeholder={t.memoTitle} className="w-full text-lg font-bold border-b border-gray-200 dark:border-gray-600 pb-2 mb-2 bg-transparent dark:text-white outline-none placeholder-gray-300" />
                 </div>
                 <div>
                    <textarea name="content" defaultValue={selectedMemo?.content} required placeholder={t.memoContent} className="w-full h-32 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border-none outline-none dark:text-white resize-none" />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">{t.pickColor}</label>
                    <div className="flex gap-2">
                       {MEMO_COLORS.map(c => (
                          <label key={c.id} className="cursor-pointer relative">
                             <input type="radio" name="color" value={c.id} defaultChecked={selectedMemo?.color === c.id || (!selectedMemo && c.id === 'yellow')} className="peer sr-only" />
                             <div className="w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-gray-400 shadow-sm transition hover:scale-110" style={{backgroundColor: c.bg}}></div>
                          </label>
                       ))}
                    </div>
                 </div>
                 <div className="flex gap-3 pt-4">
                    <button type="button" onClick={() => setShowMemoModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">{t.cancel}</button>
                    <button type="submit" className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg">{t.save}</button>
                 </div>
              </form>
           </div>
        </div>
      )}

      {/* Prescription Modal */}
      {showRxModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh]">
               <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                   <h2 className="text-xl font-bold text-gray-800 dark:text-white">{t.newPrescription}</h2>
                   <button onClick={() => { setShowRxModal(false); setNewRxMeds([]); }} className="text-gray-400 hover:text-gray-600"><X /></button>
               </div>
               
               <div className="p-6 overflow-y-auto space-y-6">
                   {/* Add Medication Form (Modern Card) */}
                   <div className="bg-gray-50 dark:bg-gray-700/50 p-5 rounded-2xl border border-gray-100 dark:border-gray-600">
                       <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                           <Sparkles size={14} className="text-secondary-500" />
                           {t.addMedication}
                       </h3>
                       
                       <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
                           <div className="md:col-span-5 relative group">
                               <Search className="absolute top-3 left-3 text-gray-400" size={16} />
                               <input 
                                   className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-secondary-500 transition" 
                                   placeholder={t.drugName} 
                                   value={medForm.name || medSearch}
                                   onChange={(e) => {
                                       setMedSearch(e.target.value);
                                       setMedForm(prev => ({ ...prev, name: e.target.value }));
                                   }}
                               />
                               {/* Auto-complete List */}
                               {medSearch && !data.medications.find(m => m.name === medSearch) && (
                                   <div className="absolute top-full left-0 w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-600 rounded-xl shadow-xl z-20 mt-1 max-h-40 overflow-y-auto">
                                       {data.medications.filter(m => m.name.toLowerCase().includes(medSearch.toLowerCase())).map(m => (
                                           <div 
                                               key={m.id} 
                                               onClick={() => {
                                                   // Auto-add logic
                                                   setNewRxMeds(prev => [...prev, {
                                                       id: Date.now().toString(),
                                                       name: m.name,
                                                       dose: m.dose,
                                                       frequency: m.frequency,
                                                       form: m.form,
                                                       notes: m.notes || ''
                                                   }]);
                                                   setMedSearch('');
                                                   setMedForm({});
                                               }}
                                               className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer text-sm"
                                           >
                                               <div className="font-bold text-gray-800 dark:text-white">{m.name}</div>
                                               <div className="text-xs text-gray-500">{m.dose} • {m.form}</div>
                                           </div>
                                       ))}
                                   </div>
                               )}
                           </div>
                           <div className="md:col-span-3">
                               <input 
                                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-secondary-500" 
                                  placeholder={t.dose}
                                  value={medForm.dose || ''}
                                  onChange={e => setMedForm({...medForm, dose: e.target.value})}
                               />
                           </div>
                           <div className="md:col-span-2">
                               <input 
                                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-secondary-500" 
                                  placeholder={t.form}
                                  value={medForm.form || ''}
                                  onChange={e => setMedForm({...medForm, form: e.target.value})}
                               />
                           </div>
                           <div className="md:col-span-2">
                               <button 
                                  onClick={handleAddMedicationToRx}
                                  disabled={!medForm.name}
                                  className="w-full h-full bg-secondary-600 hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-sm shadow-md transition flex items-center justify-center"
                               >
                                  <Plus size={18} />
                               </button>
                           </div>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                           <input 
                               className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-secondary-500" 
                               placeholder={t.frequency}
                               value={medForm.frequency || ''}
                               onChange={e => setMedForm({...medForm, frequency: e.target.value})}
                           />
                           <input 
                               className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white text-sm outline-none focus:ring-2 focus:ring-secondary-500" 
                               placeholder={t.medNotes}
                               value={medForm.notes || ''}
                               onChange={e => setMedForm({...medForm, notes: e.target.value})}
                           />
                       </div>
                   </div>

                   {/* Rx Timeline List */}
                   <div>
                       <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 ml-1">{t.rxList}</h3>
                       {newRxMeds.length === 0 ? (
                           <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl text-gray-400 text-sm">
                               Items will appear here...
                           </div>
                       ) : (
                           <div className="space-y-3 relative before:absolute before:inset-y-0 before:left-4 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                               {newRxMeds.map((med, idx) => (
                                   <div key={idx} className="relative pl-10">
                                       <div className="absolute left-1.5 top-3 w-5 h-5 rounded-full border-4 border-white dark:border-gray-800 bg-secondary-500 shadow-sm z-10"></div>
                                       <div className="bg-white dark:bg-gray-700 p-4 rounded-2xl border border-gray-100 dark:border-gray-600 shadow-sm flex justify-between items-center group">
                                           <div>
                                               <div className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                                                   {med.name} 
                                                   <span className="text-xs bg-gray-100 dark:bg-gray-600 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300 font-normal">{med.dose}</span>
                                               </div>
                                               <div className="text-sm text-gray-500 dark:text-gray-400">
                                                   {med.form} • {med.frequency}
                                                   {med.notes && <span className="block text-xs italic text-gray-400 mt-1">"{med.notes}"</span>}
                                               </div>
                                           </div>
                                           <button 
                                              onClick={() => setNewRxMeds(prev => prev.filter((_, i) => i !== idx))}
                                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition opacity-0 group-hover:opacity-100"
                                           >
                                               <XIcon size={18} />
                                           </button>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       )}
                   </div>
               </div>
               
               <div className="p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                   <button 
                      onClick={handleSaveRx}
                      disabled={newRxMeds.length === 0}
                      className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/30 transition"
                   >
                       {t.save}
                   </button>
               </div>
           </div>
        </div>
      )}

      {/* Add Master Drug Modal */}
      {showAddMasterDrugModal && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl shadow-2xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{t.addMasterDrug}</h3>
                  <form onSubmit={(e) => {
                      e.preventDefault();
                      const fd = new FormData(e.currentTarget);
                      handleAddMasterDrug({
                          name: fd.get('name') as string,
                          dose: fd.get('dose') as string,
                          frequency: fd.get('frequency') as string,
                          form: fd.get('form') as string
                      });
                  }} className="space-y-3">
                      <input name="name" required placeholder={t.drugName} className="w-full px-4 py-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                      <div className="grid grid-cols-2 gap-3">
                          <input name="dose" placeholder={t.dose} className="w-full px-4 py-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                          <input name="form" placeholder={t.form} className="w-full px-4 py-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                      </div>
                      <input name="frequency" placeholder={t.frequency} className="w-full px-4 py-3 rounded-xl border dark:bg-gray-700 dark:text-white outline-none" />
                      <div className="flex gap-2 pt-2">
                          <button type="button" onClick={() => setShowAddMasterDrugModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl">{t.cancel}</button>
                          <button type="submit" className="flex-1 py-3 bg-primary-600 text-white font-bold rounded-xl shadow-lg">{t.save}</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Supply Modal */}
      {showSupplyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
           <div className="bg-white dark:bg-gray-800 w-full max-w-sm rounded-3xl shadow-2xl p-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">{selectedSupply ? t.editItem : t.addItem}</h3>
              <form onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  handleSaveSupply(fd.get('name') as string, parseInt(fd.get('quantity') as string));
              }} className="space-y-4">
                  <div>
                      <label className="block text-sm font-bold text-gray-500 mb-1">{t.itemName}</label>
                      <input name="name" defaultValue={selectedSupply?.name} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" />
                  </div>
                  <div>
                      <label className="block text-sm font-bold text-gray-500 mb-1">{t.quantity}</label>
                      <input name="quantity" type="number" defaultValue={selectedSupply?.quantity || 1} required className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white outline-none" />
                  </div>
                  <div className="flex gap-2 pt-2">
                      <button type="button" onClick={() => setShowSupplyModal(false)} className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">{t.cancel}</button>
                      <button type="submit" className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-xl shadow-lg">{t.save}</button>
                  </div>
              </form>
           </div>
        </div>
      )}

    </div>
  );
}
