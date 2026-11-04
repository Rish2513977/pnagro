import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Tractor,
  PlusCircle,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  CalendarCheck,
  Globe,
  Menu,
  X,
  PhoneCall,
  Activity,
  Compass,
  Layers,
  HelpCircle,
} from 'lucide-react';

interface NavbarProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  openAuthModal: () => void;
  openAddModal: () => void;
  openProfileModal?: (tab?: 'profile' | 'bookings' | 'contact') => void;
  language: 'en' | 'hi';
  setLanguage: (lang: 'en' | 'hi') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  setCurrentView,
  openAuthModal,
  openAddModal,
  openProfileModal,
  language,
  setLanguage,
}) => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);

  const t = {
    en: {
      home: 'Home',
      farmerDashboard: 'Farmer Dashboard',
      ownerDashboard: 'Owner Dashboard',
      browse: 'Find Equipment',
      radar: 'Live Radar Map',
      services: 'Help',
      bookings: 'My Bookings',
      myFleet: 'My Machinery',
      profile: 'Profile & KYC',
      contact: 'Contact Support',
      admin: 'Admin Portal',
      listMachinery: 'List Machinery',
      login: 'Login / Sign Up',
      logout: 'Logout',
      welcome: 'Signed in as',
      helpline: 'Kisan Helpline: 1800-120-PNAGRO',
    },
    hi: {
      home: 'मुख्य पृष्ठ',
      farmerDashboard: 'किसान डैशबोर्ड',
      ownerDashboard: 'ओनर डैशबोर्ड',
      browse: 'उपकरण खोजें',
      radar: 'लाइव रडार मैप',
      services: 'सहायता',
      bookings: 'मेरी बुकिंग',
      myFleet: 'मेरी मशीनें',
      profile: 'मेरी प्रोफाइल',
      contact: 'कस्टमर सपोर्ट',
      admin: 'एडमिन पोर्टल',
      listMachinery: 'मशीन जोड़ें',
      login: 'लॉगिन / साइनअप',
      logout: 'लॉगआउट',
      welcome: 'लॉगिन उपयोगकर्ता',
      helpline: 'किसान हेल्पलाइन: 1800-120-PNAGRO',
    },
  }[language];

  const handleLogoClick = () => {
    if (user?.role === 'admin') {
      setCurrentView('admin');
    } else if (user?.role === 'owner') {
      setCurrentView('owner-dashboard');
    } else if (user?.role === 'farmer') {
      setCurrentView('farmer-dashboard');
    } else {
      setCurrentView('home');
    }
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <div
            onClick={handleLogoClick}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-700 text-amber-400 flex items-center justify-center shadow-md group-hover:scale-105 transition">
              <Tractor className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-emerald-950 font-heading flex items-center gap-1">
                PN<span className="text-emerald-600">agro</span>
              </span>
              <p className="text-[10px] text-stone-500 -mt-1 font-medium hidden sm:block">
                Farm Machinery on Demand
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links (Strictly Role-Based) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {/* GUEST ROLE NAV */}
            {!user && (
              <>
                <button
                  onClick={() => setCurrentView('home')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentView === 'home'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-stone-700 hover:text-emerald-700 hover:bg-stone-50'
                  }`}
                >
                  {t.home}
                </button>
                <button
                  onClick={() => setCurrentView('browse')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentView === 'browse'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-stone-700 hover:text-emerald-700 hover:bg-stone-50'
                  }`}
                >
                  {t.browse}
                </button>
                <button
                  onClick={() => setCurrentView('radar')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1 ${
                    currentView === 'radar'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-stone-700 hover:text-emerald-700 hover:bg-stone-50'
                  }`}
                >
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>{t.radar}</span>
                </button>
                <button
                  onClick={() => setCurrentView('services')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentView === 'services'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-stone-700 hover:text-emerald-700 hover:bg-stone-50'
                  }`}
                >
                  {t.services}
                </button>
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1 ${
                    currentView === 'admin'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-stone-700 hover:text-emerald-700 hover:bg-stone-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>{t.admin}</span>
                </button>
              </>
            )}

            {/* FARMER ROLE NAV */}
            {user?.role === 'farmer' && (
              <>
                <button
                  onClick={() => setCurrentView('farmer-dashboard')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentView === 'farmer-dashboard'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-stone-700 hover:text-emerald-700 hover:bg-stone-50'
                  }`}
                >
                  {t.farmerDashboard}
                </button>
                <button
                  onClick={() => setCurrentView('browse')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentView === 'browse'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-stone-700 hover:text-emerald-700 hover:bg-stone-50'
                  }`}
                >
                  {t.browse}
                </button>
                <button
                  onClick={() => setCurrentView('radar')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition flex items-center gap-1 ${
                    currentView === 'radar'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-stone-700 hover:text-emerald-700 hover:bg-stone-50'
                  }`}
                >
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span>{t.radar}</span>
                </button>
                <button
                  onClick={() => setCurrentView('bookings')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition ${
                    currentView === 'bookings'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-stone-700 hover:text-emerald-700 hover:bg-stone-50'
                  }`}
                >
                  <CalendarCheck className="w-4 h-4 text-emerald-600" />
                  <span>{t.bookings}</span>
                </button>
                <button
                  onClick={() => setCurrentView('services')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentView === 'services'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-stone-700 hover:text-emerald-700 hover:bg-stone-50'
                  }`}
                >
                  {t.services}
                </button>
              </>
            )}

            {/* OWNER ROLE NAV */}
            {user?.role === 'owner' && (
              <>
                <button
                  onClick={() => setCurrentView('owner-dashboard')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition ${
                    currentView === 'owner-dashboard'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-stone-700 hover:text-emerald-700 hover:bg-stone-50'
                  }`}
                >
                  {t.ownerDashboard}
                </button>
                <button
                  onClick={() => setCurrentView('services')}
                  className={`px-3 py-2 rounded-lg text-sm font-semibold transition ${
                    currentView === 'services'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-stone-700 hover:text-emerald-700 hover:bg-stone-50'
                  }`}
                >
                  {t.services}
                </button>
              </>
            )}

            {/* ADMIN ROLE NAV */}
            {user?.role === 'admin' && (
              <>
                <button
                  onClick={() => setCurrentView('admin')}
                  className={`px-3.5 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition ${
                    currentView === 'admin'
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-stone-700 hover:text-emerald-700 hover:bg-stone-50'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Admin Dashboard</span>
                </button>
              </>
            )}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-2.5">
            {/* Language Switch */}
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-2 border border-stone-200 hover:border-emerald-500 rounded-lg text-stone-700 hover:text-emerald-700 bg-stone-50 transition"
              title={language === 'en' ? 'हिन्दी में बदलें' : 'Switch to English'}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
            </button>

            {/* Equipment Owner Quick Action */}
            {user?.role === 'owner' && (
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 bg-amber-500 hover:bg-amber-600 text-emerald-950 rounded-lg shadow-xs transition"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{t.listMachinery}</span>
              </button>
            )}

            {/* User Profile / Auth State */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdown(!profileDropdown)}
                  className="flex items-center gap-2 p-1.5 rounded-full border border-stone-200 hover:border-emerald-500 bg-stone-50 transition"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border border-emerald-600/30"
                  />
                  <div className="text-left pr-2">
                    <span className="text-xs font-bold text-stone-800 max-w-[100px] truncate block">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] font-extrabold uppercase text-emerald-700 block">
                      {user.role}
                    </span>
                  </div>
                </button>

                {profileDropdown && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-3 border-b border-stone-100 bg-stone-50/70">
                      <p className="text-[11px] font-semibold text-stone-500">{t.welcome}</p>
                      <p className="text-sm font-bold text-stone-900 truncate">{user.name}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          {user.role}
                        </span>
                        {user.phone && (
                          <span className="text-[10px] text-stone-500 font-mono">
                            {user.phone}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Profile Link */}
                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        if (openProfileModal) openProfileModal('profile');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 transition"
                    >
                      <UserIcon className="w-4 h-4 text-emerald-700" />
                      <span>{t.profile}</span>
                    </button>

                    {/* Farmer specific menu */}
                    {user.role === 'farmer' && (
                      <button
                        onClick={() => {
                          setProfileDropdown(false);
                          setCurrentView('bookings');
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 transition"
                      >
                        <CalendarCheck className="w-4 h-4 text-emerald-700" />
                        <span>{t.bookings}</span>
                      </button>
                    )}

                    {/* Owner specific menu */}
                    {user.role === 'owner' && (
                      <button
                        onClick={() => {
                          setProfileDropdown(false);
                          setCurrentView('owner-dashboard');
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 transition"
                      >
                        <Tractor className="w-4 h-4 text-amber-600" />
                        <span>Owner Hub</span>
                      </button>
                    )}

                    {/* Admin specific menu */}
                    {user.role === 'admin' && (
                      <button
                        onClick={() => {
                          setCurrentView('admin');
                          setProfileDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-amber-800 hover:bg-amber-50 flex items-center gap-2.5 transition"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        <span>Central Admin Panel</span>
                      </button>
                    )}

                    {/* Contact Support */}
                    <button
                      onClick={() => {
                        setProfileDropdown(false);
                        if (openProfileModal) openProfileModal('contact');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs font-semibold text-stone-700 hover:bg-emerald-50 hover:text-emerald-900 flex items-center gap-2.5 transition"
                    >
                      <PhoneCall className="w-4 h-4 text-emerald-700" />
                      <span>{t.contact}</span>
                    </button>

                    <div className="border-t border-stone-100 my-1"></div>

                    {/* Logout */}
                    <button
                      onClick={() => {
                        logout();
                        setProfileDropdown(false);
                        setCurrentView('home');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-bold transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t.logout}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                {t.login}
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
              className="text-xs font-bold px-2 py-1.5 border border-stone-200 rounded-lg text-stone-700"
            >
              {language === 'en' ? 'HI' : 'EN'}
            </button>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 text-stone-700 hover:text-emerald-700 transition rounded-lg"
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 p-4 space-y-2 animate-in slide-in-from-top-2 duration-150">
          {/* User badge if logged in */}
          {user && (
            <div className="p-3 bg-stone-50 rounded-xl mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-emerald-600/30"
                />
                <div>
                  <p className="font-bold text-xs text-stone-900">{user.name}</p>
                  <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full">
                    {user.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  if (openProfileModal) openProfileModal('profile');
                  setMenuOpen(false);
                }}
                className="text-xs text-emerald-700 font-bold"
              >
                Settings
              </button>
            </div>
          )}

          {/* GUEST MOBILE NAV */}
          {!user && (
            <>
              <button
                onClick={() => {
                  setCurrentView('home');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50 rounded-lg"
              >
                {t.home}
              </button>
              <button
                onClick={() => {
                  setCurrentView('browse');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50 rounded-lg"
              >
                {t.browse}
              </button>
              <button
                onClick={() => {
                  setCurrentView('radar');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50 rounded-lg"
              >
                {t.radar}
              </button>
              <button
                onClick={() => {
                  setCurrentView('services');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50 rounded-lg"
              >
                {t.services}
              </button>
              <button
                onClick={() => {
                  setCurrentView('admin');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50 rounded-lg flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>{t.admin}</span>
              </button>
              <div className="pt-2">
                <button
                  onClick={() => {
                    openAuthModal();
                    setMenuOpen(false);
                  }}
                  className="w-full py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold text-center"
                >
                  {t.login}
                </button>
              </div>
            </>
          )}

          {/* FARMER MOBILE NAV */}
          {user?.role === 'farmer' && (
            <>
              <button
                onClick={() => {
                  setCurrentView('farmer-dashboard');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50 rounded-lg"
              >
                {t.farmerDashboard}
              </button>
              <button
                onClick={() => {
                  setCurrentView('browse');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50 rounded-lg"
              >
                {t.browse}
              </button>
              <button
                onClick={() => {
                  setCurrentView('radar');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50 rounded-lg"
              >
                {t.radar}
              </button>
              <button
                onClick={() => {
                  setCurrentView('bookings');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50 rounded-lg"
              >
                {t.bookings}
              </button>
              <button
                onClick={() => {
                  setCurrentView('services');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50 rounded-lg"
              >
                {t.services}
              </button>
            </>
          )}

          {/* OWNER MOBILE NAV */}
          {user?.role === 'owner' && (
            <>
              <button
                onClick={() => {
                  setCurrentView('owner-dashboard');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50 rounded-lg"
              >
                {t.ownerDashboard}
              </button>
              <button
                onClick={() => {
                  openAddModal();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-bold text-amber-800 bg-amber-50 rounded-lg flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4 text-amber-600" />
                <span>{t.listMachinery}</span>
              </button>
              <button
                onClick={() => {
                  setCurrentView('services');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50 rounded-lg"
              >
                {t.services}
              </button>
            </>
          )}

          {/* ADMIN MOBILE NAV */}
          {user?.role === 'admin' && (
            <>
              <button
                onClick={() => {
                  setCurrentView('admin');
                  setMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-stone-800 hover:bg-stone-50 rounded-lg flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Admin Dashboard</span>
              </button>
            </>
          )}

          {/* Log out for logged in mobile users */}
          {user && (
            <div className="pt-2 border-t border-stone-100">
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                  setCurrentView('home');
                }}
                className="w-full text-left px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>{t.logout}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
