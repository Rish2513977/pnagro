import React, { useState, useEffect, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Hero } from './components/Hero';
import { HomeOverview } from './components/HomeOverview';
import { CategoryCards } from './components/CategoryCards';
import { EquipmentRadarMap } from './components/EquipmentRadarMap';
import { EquipmentCard } from './components/EquipmentCard';
import { EquipmentDetailModal } from './components/EquipmentDetailModal';
import { AddEquipmentModal } from './components/AddEquipmentModal';
import { AuthModal } from './components/AuthModal';
import { BookingsView } from './components/BookingsView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { ServicesHelpView } from './components/ServicesHelpView';
import { GeminiChatbot } from './components/GeminiChatbot';
import { SplashScreen } from './components/SplashScreen';
import { FarmerDashboardView } from './components/FarmerDashboardView';
import { OwnerDashboardView } from './components/OwnerDashboardView';
import { FarmerProfileModal } from './components/FarmerProfileModal';
import { Equipment, EquipmentCategory } from './types';
import { api } from './services/api';
import {
  Filter,
  Search,
  SlidersHorizontal,
  RefreshCw,
  Tractor,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  ArrowRight,
  TrendingUp,
  MapPin,
  Map as MapIcon,
  LayoutGrid,
  Bot,
  MessageSquare,
  X,
  Mic,
  Crosshair,
  Compass,
  Navigation,
  Eye,
  EyeOff,
  ChevronDown,
} from 'lucide-react';

export function AppContent() {
  const { user } = useAuth();

  // Splash screen state (shown on initial website opening)
  const [showSplash, setShowSplash] = useState(true);

  // Navigation state: 'home' | 'farmer-dashboard' | 'radar' | 'browse' | 'services' | 'bookings' | 'admin'
  const [currentView, setCurrentView] = useState<string>('home');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');

  // Modals state
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [isFloatingAIChatOpen, setIsFloatingAIChatOpen] = useState(false);
  const [isFarmerProfileModalOpen, setIsFarmerProfileModalOpen] = useState(false);
  const [farmerProfileTab, setFarmerProfileTab] = useState<'profile' | 'bookings' | 'contact'>('profile');

  const openProfileModal = (tab: 'profile' | 'bookings' | 'contact' = 'profile') => {
    setFarmerProfileTab(tab);
    setIsFarmerProfileModalOpen(true);
  };

  // Automatically switch view based on user role upon login/session
  useEffect(() => {
    if (user?.role === 'farmer' && (currentView === 'home' || currentView === 'owner-dashboard')) {
      setCurrentView('farmer-dashboard');
    } else if (user?.role === 'owner' && (currentView === 'home' || currentView === 'farmer-dashboard' || currentView === 'bookings')) {
      setCurrentView('owner-dashboard');
    } else if (user?.role === 'admin' && (currentView === 'farmer-dashboard' || currentView === 'owner-dashboard')) {
      setCurrentView('admin');
    }
  }, [user?.role]);

  // Equipment Data state
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory>('All');
  const [selectedAttachment, setSelectedAttachment] = useState<string>('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedDistrict, setSelectedDistrict] = useState('All');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);
  const [browseLayout, setBrowseLayout] = useState<'both' | 'map' | 'grid'>('grid');
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const mapSectionRef = useRef<HTMLDivElement>(null);

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Fetch equipment from MongoDB backend
  const fetchEquipment = async () => {
    try {
      setLoading(true);
      setError(null);
      const combinedSearch = [searchQuery.trim(), addressQuery.trim()].filter(Boolean).join(' ');
      const res = await api.getEquipment({
        search: combinedSearch || undefined,
        category: selectedCategory,
        attachment: selectedAttachment !== 'All' ? selectedAttachment : undefined,
        state: selectedState !== 'All' ? selectedState : undefined,
        district: selectedDistrict !== 'All' ? selectedDistrict : undefined,
        minPrice,
        maxPrice,
        sort: sortBy,
      });
      setEquipmentList(res.data);
    } catch (err: any) {
      console.error('Failed to fetch machinery:', err);
      setError(err.message || 'Could not load machinery listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, [selectedCategory, selectedAttachment, selectedState, selectedDistrict, sortBy, minPrice, maxPrice]);

  const handleHeroSearch = (query: string, category?: string, state?: string) => {
    setSearchQuery(query);
    if (category) setSelectedCategory(category as EquipmentCategory);
    if (state) setSelectedState(state);
    setIsMapOpen(true);
    setCurrentView('browse');
    setTimeout(() => {
      fetchEquipment();
    }, 50);
  };

  // Trigger search and explicitly reveal map
  const handleOpenMapAndSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsMapOpen(true);
    fetchEquipment();
    setTimeout(() => {
      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  // Detect GPS location for Address field
  const handleDetectGPSLocation = () => {
    if ('geolocation' in navigator) {
      setIsDetectingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetectingLocation(false);
          setAddressQuery(`Lat: ${pos.coords.latitude.toFixed(2)}, Lng: ${pos.coords.longitude.toFixed(2)}`);
          setIsMapOpen(true);
          showToast(language === 'hi' ? 'स्थान का पता लगा लिया गया है!' : 'GPS location detected! Opening live map...');
          fetchEquipment();
        },
        () => {
          setIsDetectingLocation(false);
          showToast(language === 'hi' ? 'GPS अनुमति अस्वीकृत हुई।' : 'GPS location access denied or unavailable.');
        },
        { timeout: 8000 }
      );
    } else {
      showToast(language === 'hi' ? 'GPS समर्थित नहीं है।' : 'Geolocation not supported by browser.');
    }
  };

  const handleCategorySelect = (cat: EquipmentCategory) => {
    setSelectedCategory(cat);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 text-stone-900 selection:bg-emerald-200">
      {/* Branded Splash Screen on Website Opening */}
      {showSplash && (
        <SplashScreen
          onComplete={() => setShowSplash(false)}
          language={language}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-700 flex items-center gap-2 text-xs font-semibold animate-slide-up">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openAuthModal={() => setIsAuthModalOpen(true)}
        openAddModal={() => setIsAddModalOpen(true)}
        openProfileModal={openProfileModal}
        language={language}
        setLanguage={setLanguage}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {/* DEDICATED FARMER DASHBOARD (For Farmer Users) */}
        {(currentView === 'farmer-dashboard' || (user?.role === 'farmer' && currentView === 'home')) && (
          <FarmerDashboardView
            equipmentList={equipmentList}
            loading={loading}
            onSelectEquipment={(eq) => setSelectedEquipment(eq)}
            onOpenProfile={openProfileModal}
            onOpenRadarMap={() => setCurrentView('radar')}
            onSearch={({ category, attachment, location }) => {
              if (category) setSelectedCategory(category);
              if (attachment) setSelectedAttachment(attachment);
              if (location) setSearchQuery(location);
              fetchEquipment();
            }}
          />
        )}

        {/* DEDICATED OWNER DASHBOARD (For Equipment Owners) */}
        {(currentView === 'owner-dashboard' || (user?.role === 'owner' && currentView === 'home')) && (
          <OwnerDashboardView
            onAddEquipment={() => setIsAddModalOpen(true)}
            language={language}
            onOpenProfile={openProfileModal}
          />
        )}

        {/* VIEW 1: HOME - Informational & Feature Navigation (For Guest Users) */}
        {currentView === 'home' && !user && (
          <div className="space-y-0">
            {/* Hero Banner with Search Console */}
            <Hero
              onSearch={handleHeroSearch}
              openAuthModal={() => setIsAuthModalOpen(true)}
              language={language}
            />

            {/* Platform Details, Value Pillars & Feature Hub */}
            <HomeOverview
              onNavigate={(view, cat) => {
                if (cat) setSelectedCategory(cat);
                setCurrentView(view);
                if (view === 'browse' || view === 'radar') {
                  setTimeout(() => fetchEquipment(), 50);
                }
              }}
              openAddModal={() => {
                if (!user) setIsAuthModalOpen(true);
                else setIsAddModalOpen(true);
              }}
              openAuthModal={() => setIsAuthModalOpen(true)}
              openAIChat={() => setIsFloatingAIChatOpen(true)}
              language={language}
            />
          </div>
        )}

        {/* VIEW 2: DEDICATED LIVE EQUIPMENT MAP */}
        {currentView === 'radar' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            <EquipmentRadarMap
              equipmentList={equipmentList}
              onSelectEquipment={(eq) => setSelectedEquipment(eq)}
              onBookNow={(eq) => setSelectedEquipment(eq)}
              language={language}
            />

            {/* Available Equipment List below map */}
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-xs">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-stone-900 font-heading">
                    {language === 'en' ? 'Available Equipment Fleet' : 'उपलब्ध उपकरणों की सूची'}
                  </h3>
                  <p className="text-xs text-stone-500">
                    {equipmentList.length} {language === 'en' ? 'machines ready for dispatch' : 'मशीनें कार्य हेतु उपलब्ध'}
                  </p>
                </div>
                <button
                  onClick={() => setCurrentView('browse')}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1"
                >
                  <span>{language === 'en' ? 'Open Detailed Filters' : 'विस्तृत फिल्टर देखें'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {equipmentList.map((item) => (
                  <EquipmentCard
                    key={item._id}
                    item={item}
                    onSelect={(eq) => setSelectedEquipment(eq)}
                    onBookNow={(eq) => setSelectedEquipment(eq)}
                    language={language}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: FIND EQUIPMENT WITH SEARCH FORM (EQUIPMENT, ADDRESS, SEARCH BAR) & CONDITIONAL MAP */}
        {currentView === 'browse' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
            {/* Prominent Search Machinery & Location Form Card */}
            <div className="bg-white rounded-3xl border border-stone-200/90 shadow-md p-5 sm:p-7 relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 mb-5 border-b border-stone-100">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold mb-2 border border-emerald-200/60">
                    <Tractor className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{language === 'hi' ? 'स्मार्ट उपकरण खोज प्रणाली' : 'Smart Machinery Locator'}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-heading tracking-tight">
                    {language === 'hi' ? 'कृषि उपकरण, पता एवं स्थान खोजें' : 'Search Farm Machinery & Location'}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 mt-1">
                    {language === 'hi'
                      ? 'मशीनरी का प्रकार और अपना खेत/गांव का पता दर्ज करें। सर्च बार पर क्लिक करते ही लाइव मैप खुल जाएगा।'
                      : 'Select your equipment type and enter your farm/village address. Clicking the search bar launches the interactive map.'}
                  </p>
                </div>

                {/* Map visibility toggle button */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsMapOpen(!isMapOpen)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs border ${
                      isMapOpen
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border-stone-200'
                    }`}
                  >
                    <MapIcon className="w-4 h-4" />
                    <span>
                      {isMapOpen
                        ? language === 'hi'
                          ? 'मैप चालू है (क्लिक कर बंद करें)'
                          : 'Map Active (Click to Hide)'
                        : language === 'hi'
                        ? '🗺️ लाइव मैप खोलें'
                        : '🗺️ Open Live Map'}
                    </span>
                  </button>
                </div>
              </div>

              <form onSubmit={handleOpenMapAndSearch} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
                  {/* 1. Equipment Category */}
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                      {language === 'hi' ? '1. उपकरण / मशीनरी प्रकार' : '1. Equipment Type / Machinery'}
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as EquipmentCategory)}
                      className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white transition cursor-pointer"
                    >
                      <option value="All">All Categories (सभी मशीनरी)</option>
                      <option value="Tractor">Tractor (ट्रैक्टर 35HP-90HP)</option>
                      <option value="Loader">Loader (लोडर / जेसीबी)</option>
                      <option value="Combine Harvester">Combine Harvester (कंबाइन हार्वेस्टर)</option>
                      <option value="Other Machinery">Other Machinery (अन्य कृषि उपकरण)</option>
                    </select>
                  </div>

                  {/* 2. Attached Implement */}
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                      {language === 'hi' ? 'संलग्न उपकरण (Implement)' : 'Attached Implement'}
                    </label>
                    <select
                      value={selectedAttachment}
                      onChange={(e) => setSelectedAttachment(e.target.value)}
                      className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white transition cursor-pointer"
                    >
                      <option value="All">All Implements (सभी उपकरण)</option>
                      <option value="Cultivator">Cultivator (कल्टीवेटर - 9/11 टाइन)</option>
                      <option value="Rotavator">Rotavator (रोटावेटर 6-8 फीट)</option>
                      <option value="Disc Harrow">Disc Harrow (डिस्क हैरो)</option>
                      <option value="MB Plough">MB Plough (हाइड्रोलिक पलाऊ)</option>
                      <option value="Seed Drill">Seed Drill (सीड कम फर्टिलाइजर ड्रिल)</option>
                      <option value="Straw Reaper">Straw Reaper (स्ट्रॉ रीपर)</option>
                      <option value="Front Bucket Loader">Front Loader Bucket (लोडर बकेट)</option>
                      <option value="Laser Land Leveler">Laser Land Leveler (लेजर लेवलर)</option>
                    </select>
                  </div>

                  {/* 3. State / Region */}
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                      {language === 'hi' ? 'राज्य / State' : 'State / Province'}
                    </label>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-emerald-600 focus:bg-white transition cursor-pointer"
                    >
                      <option value="All">All States (पूरा भारत)</option>
                      <option value="Punjab">Punjab (पंजाब)</option>
                      <option value="Haryana">Haryana (हरियाणा)</option>
                      <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
                      <option value="Rajasthan">Rajasthan (राजस्थान)</option>
                      <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
                      <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
                      <option value="Gujarat">Gujarat (गुजरात)</option>
                    </select>
                  </div>
                </div>

                {/* Address / Farm Location Field with GPS button */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5 pt-1">
                  <div className="md:col-span-12 space-y-1.5">
                    <label className="block text-[11px] font-bold text-stone-600 uppercase tracking-wider">
                      {language === 'hi' ? '2. खेत का पता / गांव / तहसील / जिला' : '2. Farm Address / Village / Tehsil / District'}
                    </label>
                    <div className="relative flex items-center">
                      <MapPin className="w-4 h-4 text-emerald-700 absolute left-3.5" />
                      <input
                        type="text"
                        value={addressQuery}
                        onChange={(e) => setAddressQuery(e.target.value)}
                        placeholder={
                          language === 'hi'
                            ? 'उदा. गांव समराला, लुधियाना, पंजाब या अपना पिन कोड लिखें...'
                            : 'e.g. Village Samrala, Ludhiana, Punjab or Tehsil / Pincode...'
                        }
                        className="w-full pl-10 pr-32 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none transition"
                      />
                      <button
                        type="button"
                        onClick={handleDetectGPSLocation}
                        disabled={isDetectingLocation}
                        className="absolute right-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[11px] font-bold border border-emerald-200 flex items-center gap-1 transition cursor-pointer"
                        title="Detect Farm GPS Location"
                      >
                        <Crosshair className={`w-3.5 h-3.5 ${isDetectingLocation ? 'animate-spin' : 'text-emerald-700'}`} />
                        <span>{isDetectingLocation ? 'Locating...' : 'GPS Auto-Fill'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Interactive Search Bar (Clicking on this search bar or button opens the map!) */}
                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>
                      {language === 'hi'
                        ? '3. सर्च बार (क्लिक करने पर लाइव मैप खुलेगा):'
                        : '3. Search Bar (Clicking below opens the interactive map):'}
                    </span>
                  </label>
                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative flex-1 w-full flex items-center">
                      <Search className="w-4 h-4 text-emerald-700 absolute left-3.5 pointer-events-none" />
                      <input
                        type="text"
                        value={searchQuery}
                        onClick={() => setIsMapOpen(true)}
                        onFocus={() => setIsMapOpen(true)}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleOpenMapAndSearch(e)}
                        placeholder={
                          language === 'hi'
                            ? 'यहाँ क्लिक करें या मॉडल / ब्रांड (उदा. महिन्द्रा 575, जॉन डियर, 50HP) खोजें (मैप खुलेगा)...'
                            : 'Click here or type machinery model / brand (e.g. Mahindra 575, John Deere, 50HP) to open map...'
                        }
                        className="w-full pl-10 pr-4 py-3 bg-emerald-50/40 border-2 border-emerald-500/60 hover:border-emerald-600 rounded-2xl text-xs sm:text-sm font-semibold text-stone-900 placeholder:text-stone-500 focus:bg-white focus:ring-3 focus:ring-emerald-500/30 focus:outline-none transition shadow-inner"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleOpenMapAndSearch}
                      className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-700 to-teal-700 hover:from-emerald-800 hover:to-teal-800 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center justify-center gap-2 shrink-0 active:scale-95 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-amber-300 animate-bounce" />
                      <span>{language === 'hi' ? 'खोजें एवं मैप खोलें' : 'Search & Open Map'}</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* MAP CONTAINER (ONLY OPENED WHEN isMapOpen IS TRUE) */}
            {isMapOpen ? (
              <div ref={mapSectionRef} className="space-y-3 transition-all duration-300">
                {/* Map Header Status Bar */}
                <div className="bg-emerald-900 text-white px-4 py-3 rounded-2xl border border-emerald-700/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    <span className="font-bold text-sm">
                      {language === 'hi' ? '🗺️ लाइव लोकेशन व उपकरण रडार मैप' : '🗺️ Live Equipment & Location Radar Map'}
                    </span>
                    <span className="bg-emerald-800 text-emerald-200 px-2 py-0.5 rounded-md font-semibold text-[11px] border border-emerald-600/50">
                      {equipmentList.length} {language === 'hi' ? 'मशीनें रडार पर' : 'units live'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setIsMapOpen(false)}
                      className="px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg border border-white/20 flex items-center gap-1 transition"
                    >
                      <X className="w-3.5 h-3.5 text-amber-300" />
                      <span>{language === 'hi' ? 'मैप बंद करें' : 'Close Map'}</span>
                    </button>
                  </div>
                </div>

                {/* Leaflet Radar Map Component */}
                <EquipmentRadarMap
                  equipmentList={equipmentList}
                  onSelectEquipment={(eq) => setSelectedEquipment(eq)}
                  onBookNow={(eq) => setSelectedEquipment(eq)}
                  language={language}
                />
              </div>
            ) : (
              /* Map is closed banner */
              <div className="bg-emerald-50/70 border border-dashed border-emerald-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-emerald-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                    <MapIcon className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div>
                    <p className="font-bold text-stone-900">
                      {language === 'hi' ? 'मैप वर्तमान में छिपा हुआ है' : 'Interactive Map is Currently Closed'}
                    </p>
                    <p className="text-stone-600 text-[11px]">
                      {language === 'hi'
                        ? 'ऊपर सर्च बार पर क्लिक करें या "खोजें एवं मैप खोलें" बटन दबाकर नजदीकी ट्रैक्टर देखें।'
                        : 'Click on the Search Bar above or tap "Search & Open Map" to view equipment markers.'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsMapOpen(true);
                    setTimeout(() => {
                      mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 100);
                  }}
                  className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition shrink-0"
                >
                  <MapPin className="w-3.5 h-3.5 text-amber-300" />
                  <span>{language === 'hi' ? 'लाइव मैप खोलें' : 'Open Live Map'}</span>
                </button>
              </div>
            )}

            {/* Equipment Results & Cards Section */}
            <div className="space-y-4 pt-2">
              {/* Active Filter Pills Bar & Sorting */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-stone-700">
                    {language === 'hi' ? 'उपलब्ध उपकरण:' : 'Available Machinery:'}
                  </span>
                  <span className="bg-emerald-100 text-emerald-900 font-extrabold px-2.5 py-0.5 rounded-lg">
                    {equipmentList.length} units
                  </span>

                  {(selectedCategory !== 'All' || selectedAttachment !== 'All' || selectedState !== 'All' || searchQuery || addressQuery) && (
                    <>
                      {selectedCategory !== 'All' && (
                        <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md font-semibold border border-stone-200">
                          {selectedCategory}
                        </span>
                      )}
                      {selectedAttachment !== 'All' && (
                        <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md font-semibold border border-stone-200">
                          + {selectedAttachment}
                        </span>
                      )}
                      {selectedState !== 'All' && (
                        <span className="bg-stone-100 text-stone-800 px-2 py-0.5 rounded-md font-semibold border border-stone-200">
                          📍 {selectedState}
                        </span>
                      )}
                      {(searchQuery || addressQuery) && (
                        <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-semibold border border-amber-200">
                          "{[searchQuery, addressQuery].filter(Boolean).join(' ')}"
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCategory('All');
                          setSelectedAttachment('All');
                          setSelectedState('All');
                          setSelectedDistrict('All');
                          setSearchQuery('');
                          setAddressQuery('');
                          fetchEquipment();
                        }}
                        className="text-emerald-700 hover:text-emerald-900 font-bold underline ml-1"
                      >
                        {language === 'hi' ? 'फिल्टर हटाएं' : 'Reset all'}
                      </button>
                    </>
                  )}
                </div>

                {/* Sort Select */}
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-stone-500 font-medium whitespace-nowrap">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="py-1.5 px-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer"
                  >
                    <option value="featured">Featured First</option>
                    <option value="price_asc">Rate: Low to High</option>
                    <option value="price_desc">Rate: High to Low</option>
                    <option value="rating_desc">Top Customer Rated</option>
                    <option value="hp_desc">Horsepower (HP)</option>
                  </select>
                </div>
              </div>

              {/* Equipment Cards Grid */}
              {loading ? (
                <div className="py-20 text-center">
                  <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin mx-auto mb-3" />
                  <p className="text-xs font-semibold text-stone-600">
                    {language === 'hi' ? 'मशीनरी सूची लोड हो रही है...' : 'Fetching machinery catalog from MongoDB...'}
                  </p>
                </div>
              ) : equipmentList.length === 0 ? (
                <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-md mx-auto my-6">
                  <Tractor className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                  <h3 className="text-base font-bold text-stone-900 mb-1">
                    {language === 'hi' ? 'कोई मशीन नहीं मिली' : 'No Machinery Found'}
                  </h3>
                  <p className="text-xs text-stone-500 mb-4">
                    {language === 'hi'
                      ? 'आपके चुने गए फिल्टर या पते पर कोई उपकरण नहीं मिला। कृपया अन्य श्रेणी चुनें या फिल्टर हटाएं।'
                      : 'No equipment matched your location and category filters. Try selecting a different implement or reset.'}
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedAttachment('All');
                      setSelectedState('All');
                      setSelectedDistrict('All');
                      setSearchQuery('');
                      setAddressQuery('');
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    {language === 'hi' ? 'सभी उपकरण दिखाएं' : 'Reset All Filters'}
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {equipmentList.map((item) => (
                    <EquipmentCard
                      key={item._id}
                      item={item}
                      onSelect={(eq) => setSelectedEquipment(eq)}
                      onBookNow={(eq) => setSelectedEquipment(eq)}
                      language={language}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 4: MY BOOKINGS */}
        {currentView === 'bookings' && (
          <BookingsView
            onBrowseEquipment={() => setCurrentView('browse')}
            language={language}
          />
        )}

        {/* VIEW 5: ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          <AdminDashboardView
            onAddEquipment={() => setIsAddModalOpen(true)}
            language={language}
            onNavigateHome={() => setCurrentView('home')}
          />
        )}

        {/* VIEW 6: SERVICES & HELP */}
        {currentView === 'services' && (
          <ServicesHelpView
            onBrowseEquipment={() => setCurrentView('browse')}
            onNavigateToRadar={() => setCurrentView('radar')}
            language={language}
          />
        )}
      </main>

      {/* Floating Gemini AI Chat Launcher Button (Bottom-Right) */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Floating Chat Window when opened */}
        {isFloatingAIChatOpen && (
          <div className="animate-in fade-in slide-in-from-bottom-5 duration-200">
            <GeminiChatbot
              onNavigateToBrowse={() => {
                setCurrentView('browse');
                setIsFloatingAIChatOpen(false);
              }}
              onNavigateToRadar={() => {
                setCurrentView('radar');
                setIsFloatingAIChatOpen(false);
              }}
              language={language}
              isEmbedded={false}
              onCloseFloating={() => setIsFloatingAIChatOpen(false)}
            />
          </div>
        )}

        {/* Floating Launcher Pill Button */}
        <button
          onClick={() => setIsFloatingAIChatOpen(!isFloatingAIChatOpen)}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-full shadow-xl transition-all transform hover:scale-105 ${
            isFloatingAIChatOpen
              ? 'bg-stone-900 text-white border border-stone-700'
              : 'bg-gradient-to-r from-emerald-800 via-emerald-900 to-stone-900 text-white border border-emerald-500/40 ring-4 ring-emerald-500/20'
          }`}
          title="Ask Google Gemini Kisan AI"
        >
          {isFloatingAIChatOpen ? (
            <>
              <X className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-bold font-heading">
                {language === 'hi' ? 'बंद करें' : 'Close Voice AI'}
              </span>
            </>
          ) : (
            <>
              <div className="relative flex items-center gap-1">
                <Bot className="w-4 h-4 text-amber-400" />
                <Mic className="w-4 h-4 text-emerald-300 animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <span className="text-xs font-bold font-heading">
                {language === 'hi' ? 'किसान AI वॉयस' : 'Kisan Voice AI'}
              </span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-amber-400 text-stone-950">
                Gemini 3.7
              </span>
            </>
          )}
        </button>
      </div>

      {/* Modals */}
      {selectedEquipment && (
        <EquipmentDetailModal
          equipment={selectedEquipment}
          onClose={() => setSelectedEquipment(null)}
          onBookingSuccess={() => {
            setSelectedEquipment(null);
            showToast('Booking successfully placed! View in "My Bookings" tab.');
            setCurrentView('bookings');
          }}
          openAuthModal={() => {
            setSelectedEquipment(null);
            setIsAuthModalOpen(true);
          }}
          language={language}
        />
      )}

      {isAddModalOpen && (
        <AddEquipmentModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            setIsAddModalOpen(false);
            showToast('Equipment listing published to MongoDB & pinned to live radar map!');
            fetchEquipment();
            setCurrentView('radar');
          }}
          language={language}
        />
      )}

      {isAuthModalOpen && (
        <AuthModal
          onClose={() => {
            setIsAuthModalOpen(false);
            showToast('Signed in successfully!');
          }}
          language={language}
        />
      )}

      {isFarmerProfileModalOpen && (
        <FarmerProfileModal
          onClose={() => setIsFarmerProfileModalOpen(false)}
          initialTab={farmerProfileTab}
          onNavigateToBrowse={() => setCurrentView('browse')}
          language={language}
        />
      )}

      {/* Footer */}
      <Footer
        setCurrentView={setCurrentView}
        setCategoryFilter={(cat) => setSelectedCategory(cat as EquipmentCategory)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

