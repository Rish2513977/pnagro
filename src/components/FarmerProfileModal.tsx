import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Booking, User } from '../types';
import { api } from '../services/api';
import { BookingDetailModal } from './BookingDetailModal';
import {
  X,
  User as UserIcon,
  CalendarCheck,
  Headphones,
  LogOut,
  Camera,
  CreditCard,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Tractor,
  Clock,
  IndianRupee,
  ShieldCheck,
  Send,
  MessageSquare,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';

interface FarmerProfileModalProps {
  onClose: () => void;
  initialTab?: 'profile' | 'bookings' | 'contact';
  onNavigateToBrowse?: () => void;
  language: 'en' | 'hi';
}

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
];

export const FarmerProfileModal: React.FC<FarmerProfileModalProps> = ({
  onClose,
  initialTab = 'profile',
  onNavigateToBrowse,
  language,
}) => {
  const { user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'bookings' | 'contact'>(initialTab);

  // Form State for Profile
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [alternatePhone, setAlternatePhone] = useState(user?.alternatePhone || '');
  const [dob, setDob] = useState(user?.dob || '1985-05-14');
  const [aadhaarNumber, setAadhaarNumber] = useState(user?.aadhaarNumber || '5432 8901 2345');
  const [avatar, setAvatar] = useState(user?.avatar || AVATAR_PRESETS[0]);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [state, setState] = useState(user?.location?.state || 'Punjab');
  const [district, setDistrict] = useState(user?.location?.district || 'Ludhiana');
  const [address, setAddress] = useState(user?.location?.address || 'Village Gill, Pakhowal Road');
  const [pincode, setPincode] = useState(user?.location?.pincode || '141116');

  const [showAadhaar, setShowAadhaar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [saveErrorMsg, setSaveErrorMsg] = useState('');

  // Bookings State
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState<Booking | null>(null);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'>('all');

  // Contact Form State
  const [contactSubject, setContactSubject] = useState('Machine Booking Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAlternatePhone(user.alternatePhone || '');
      setDob(user.dob || '1985-05-14');
      setAadhaarNumber(user.aadhaarNumber || '5432 8901 2345');
      setAvatar(user.avatar || AVATAR_PRESETS[0]);
      setState(user.location?.state || 'Punjab');
      setDistrict(user.location?.district || 'Ludhiana');
      setAddress(user.location?.address || 'Village Gill, Pakhowal Road');
      setPincode(user.location?.pincode || '141116');
    }
  }, [user]);

  // Fetch bookings when bookings tab is clicked
  const fetchMyBookings = async () => {
    try {
      setLoadingBookings(true);
      const res = await api.getBookings();
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchMyBookings();
    }
  }, [activeTab]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');
    setSaveErrorMsg('');

    try {
      await updateProfile({
        name,
        phone,
        alternatePhone,
        dob,
        aadhaarNumber,
        avatar,
        location: {
          state,
          district,
          address,
          pincode,
        },
      });
      setSaveSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSaveSuccessMsg(''), 4000);
    } catch (err: any) {
      setSaveErrorMsg(err.message || 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactMessage.trim()) return;
    setContactSubmitted(true);
    setTimeout(() => {
      setContactMessage('');
    }, 2000);
  };

  const filteredBookings = bookings.filter((b) => {
    if (bookingFilter === 'all') return true;
    return b.status === bookingFilter;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-6 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="p-5 border-b border-stone-800 bg-emerald-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={avatar || AVATAR_PRESETS[0]}
                alt={name}
                className="w-11 h-11 rounded-2xl object-cover border-2 border-emerald-400/60 shadow-xs"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-emerald-950 rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-heading">{name || 'Farmer Profile'}</h2>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700">
                  {user?.role || 'Farmer'}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">{email || user?.email || 'User Account'}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-2 rounded-full hover:bg-emerald-900 text-emerald-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feature Menu Tabs */}
        <div className="grid grid-cols-3 border-b border-stone-200 bg-stone-100/90 text-xs font-bold text-center p-1.5 gap-1 shrink-0">
          {/* Menu Option 1: Profile */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-emerald-800 text-white shadow-xs font-black'
                : 'text-stone-700 hover:bg-white/80 hover:text-stone-900'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>Profile Information</span>
          </button>

          {/* Menu Option 2: My Bookings */}
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'bookings'
                ? 'bg-emerald-800 text-white shadow-xs font-black'
                : 'text-stone-700 hover:bg-white/80 hover:text-stone-900'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>My Bookings</span>
          </button>

          {/* Menu Option 3: Contact Us */}
          <button
            type="button"
            onClick={() => setActiveTab('contact')}
            className={`py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'contact'
                ? 'bg-emerald-800 text-white shadow-xs font-black'
                : 'text-stone-700 hover:bg-white/80 hover:text-stone-900'
            }`}
          >
            <Headphones className="w-4 h-4" />
            <span>Contact Us</span>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: PROFILE EDIT FORM */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-6 max-w-2xl mx-auto">
              {saveSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700" />
                  <span>{saveSuccessMsg}</span>
                </div>
              )}

              {saveErrorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{saveErrorMsg}</span>
                </div>
              )}

              {/* Profile Picture Section */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-700" />
                  <span>Profile Picture</span>
                </label>

                <div className="flex flex-wrap items-center gap-4">
                  <img
                    src={avatar || AVATAR_PRESETS[0]}
                    alt="Current Avatar"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-600 shadow-sm"
                  />

                  <div className="space-y-2 flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl text-xs font-bold text-stone-700 transition flex items-center gap-1.5 shadow-2xs">
                        <Camera className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Upload Photo</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] text-stone-500">or pick a preset:</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatar(preset)}
                          className={`w-7 h-7 rounded-full overflow-hidden border-2 transition ${
                            avatar === preset
                              ? 'border-emerald-600 scale-110 shadow-xs'
                              : 'border-transparent opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal Details: Name, DOB, Aadhaar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Harbhajan Singh Gill"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Date of Birth (DOB) */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Date of Birth (DOB) *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Aadhaar Card Number */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Aadhaar Card Number (12 Digits) *
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type={showAadhaar ? 'text' : 'password'}
                      required
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value)}
                      placeholder="5432 8901 2345"
                      maxLength={14}
                      className="w-full pl-9 pr-10 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono tracking-wider"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAadhaar(!showAadhaar)}
                      className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700"
                    >
                      {showAadhaar ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-stone-500 mt-1">
                    Encrypted and stored securely for verified agricultural equipment rental compliance.
                  </p>
                </div>
              </div>

              {/* Contact Information: Phone, Alternate Phone, Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Mobile Number (Primary) *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Alternate Mobile */}
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Alternate Mobile (Optional)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      value={alternatePhone}
                      onChange={(e) => setAlternatePhone(e.target.value)}
                      placeholder="+91 98123 45678"
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="email"
                      disabled
                      value={email}
                      className="w-full pl-9 pr-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-600 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Farm / Land Location Address */}
              <div className="space-y-3 p-4 bg-stone-50 rounded-2xl border border-stone-200">
                <label className="block text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-700" />
                  <span>Farm / Delivery Location</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">State *</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Punjab, Haryana, UP"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">District / Tehsil *</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Ludhiana, Karnal, Indore"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-stone-700 mb-1">Village & Farm Address</label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Village Name, Landmark, Field Plot Number"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="141116"
                      className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={logout}
                  className="px-4 py-2.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Save Profile Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: MY BOOKINGS LIST */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              {/* Header & Filter Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                <div>
                  <h3 className="text-base font-bold text-stone-900 font-heading">
                    My Machinery Bookings
                  </h3>
                  <p className="text-xs text-stone-500">
                    Click any booking to view complete work details, completion status, and fare breakdown.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={fetchMyBookings}
                    className="p-2 text-stone-600 hover:text-emerald-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
                    title="Refresh Bookings"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingBookings ? 'animate-spin' : ''}`} />
                  </button>

                  <div className="flex flex-wrap gap-1 bg-stone-100 p-1 rounded-xl">
                    {(['all', 'confirmed', 'in_progress', 'completed', 'cancelled'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setBookingFilter(filter)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold capitalize transition ${
                          bookingFilter === filter
                            ? 'bg-emerald-800 text-white shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        {filter.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bookings List */}
              {loadingBookings ? (
                <div className="py-16 text-center">
                  <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin mx-auto mb-2" />
                  <p className="text-xs font-semibold text-stone-600">Loading your bookings...</p>
                </div>
              ) : filteredBookings.length === 0 ? (
                <div className="py-12 px-4 text-center bg-stone-50 rounded-2xl border border-stone-200 max-w-md mx-auto">
                  <Tractor className="w-12 h-12 text-stone-400 mx-auto mb-3" />
                  <h4 className="text-sm font-bold text-stone-800 mb-1">No Bookings Found</h4>
                  <p className="text-xs text-stone-500 mb-4">
                    {bookingFilter !== 'all'
                      ? `No bookings with "${bookingFilter}" status.`
                      : 'You do not have any equipment bookings yet.'}
                  </p>
                  {onNavigateToBrowse && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToBrowse();
                      }}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition"
                    >
                      Find Equipment Now
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {filteredBookings.map((b) => (
                    <button
                      key={b._id}
                      type="button"
                      onClick={() => setSelectedBookingForDetail(b)}
                      className="text-left p-4 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200 hover:border-emerald-500 shadow-2xs hover:shadow-md transition flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                          <span className="text-[11px] font-mono text-stone-500">
                            #{b._id.slice(-6).toUpperCase()}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                              b.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : b.status === 'in_progress'
                                ? 'bg-amber-100 text-amber-800'
                                : b.status === 'confirmed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {b.status.replace('_', ' ')}
                          </span>
                        </div>

                        <div className="flex gap-3 my-3">
                          <img
                            src={
                              b.equipment?.images?.[0] ||
                              'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=300&q=80'
                            }
                            alt={b.equipment?.name}
                            className="w-16 h-16 rounded-xl object-cover border border-stone-200 bg-stone-100 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase">
                              {b.equipment?.category}
                            </span>
                            <h4 className="font-bold text-xs text-stone-900 truncate group-hover:text-emerald-800 transition">
                              {b.equipment?.name || 'Agro Equipment'}
                            </h4>
                            <p className="text-[11px] text-stone-500 mt-0.5">
                              Duration: <strong className="text-stone-800">{b.duration} {b.rentalType === 'daily' ? 'Days' : 'Hours'}</strong>
                            </p>
                            <p className="text-[11px] text-stone-500">
                              Date: {new Date(b.startDate).toLocaleDateString('en-IN')}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-[10px] text-stone-400 block">Total Fare:</span>
                          <span className="font-extrabold text-emerald-800 font-heading">
                            ₹{b.totalAmount?.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition">
                          <span>View Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CONTACT US */}
          {activeTab === 'contact' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-heading">
                  Farmer Support & Helpdesk
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Need machinery support, operator assistance, or billing help? Reach out directly.
                </p>
              </div>

              {/* Direct Support Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* 24x7 Helpline */}
                <a
                  href="tel:18008892476"
                  className="p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl transition flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-emerald-800 text-white flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-emerald-800 tracking-wider">
                      24/7 Farmer Toll-Free
                    </span>
                    <h4 className="text-sm font-bold text-emerald-950">1800-889-AGRO (2476)</h4>
                    <p className="text-[11px] text-emerald-800/80 mt-0.5">
                      Direct operator and machinery breakdown hotline
                    </p>
                  </div>
                </a>

                {/* WhatsApp Support */}
                <a
                  href="https://wa.me/919876543210"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-2xl transition flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-700 text-white flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider">
                      WhatsApp Agro Help
                    </span>
                    <h4 className="text-sm font-bold text-amber-950">+91 98765 43210</h4>
                    <p className="text-[11px] text-amber-800/80 mt-0.5">
                      Instant response on WhatsApp for field assistance
                    </p>
                  </div>
                </a>
              </div>

              {/* Instant Inquiry / Message Form */}
              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Send a Message to PNagro Support</span>
                </h4>

                {contactSubmitted ? (
                  <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
                    <span>
                      Thank you! Your message has been received. Our agro support team will contact you within 15 minutes.
                    </span>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Inquiry Topic / Reason
                      </label>
                      <select
                        value={contactSubject}
                        onChange={(e) => setContactSubject(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-medium"
                      >
                        <option value="Machine Booking Inquiry">Machine Booking Inquiry</option>
                        <option value="Operator Not Reached / Delay">Operator Not Reached / Delay</option>
                        <option value="Equipment Breakdown in Field">Equipment Breakdown in Field</option>
                        <option value="Billing & Fare Issue">Billing & Fare Issue</option>
                        <option value="Other Assistance">Other Assistance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Describe your issue or request
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        placeholder="Please write your field location and details..."
                        className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Inquiry</span>
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Booking Detail Modal Popup if a booking was clicked */}
      {selectedBookingForDetail && (
        <BookingDetailModal
          booking={selectedBookingForDetail}
          onClose={() => setSelectedBookingForDetail(null)}
          onUpdateStatus={async (id, status) => {
            await api.updateBookingStatus(id, status);
            fetchMyBookings();
          }}
        />
      )}
    </div>
  );
};
