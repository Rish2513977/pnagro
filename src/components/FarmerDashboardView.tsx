import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Equipment, EquipmentCategory, Booking } from '../types';
import { EquipmentCard } from './EquipmentCard';
import {
  Search,
  Tractor,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  SlidersHorizontal,
  User as UserIcon,
  CalendarCheck,
  Headphones,
  CheckCircle2,
  AlertCircle,
  Crosshair,
  ArrowRight,
  ShieldCheck,
  Layers,
  RefreshCw,
} from 'lucide-react';

interface FarmerDashboardViewProps {
  equipmentList: Equipment[];
  loading: boolean;
  onSelectEquipment: (eq: Equipment) => void;
  onOpenProfile: (tab?: 'profile' | 'bookings' | 'contact') => void;
  onOpenRadarMap: () => void;
  onSearch: (params: {
    category?: EquipmentCategory;
    attachment?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => void;
}

export const FarmerDashboardView: React.FC<FarmerDashboardViewProps> = ({
  equipmentList,
  loading,
  onSelectEquipment,
  onOpenProfile,
  onOpenRadarMap,
  onSearch,
}) => {
  const { user } = useAuth();

  // Find Equipment Form State (in pure English with minimum needed fields)
  const [category, setCategory] = useState<EquipmentCategory>('All');
  const [attachment, setAttachment] = useState<string>('All');
  const [location, setLocation] = useState<string>(user?.location?.district || '');
  const [startDate, setStartDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState<number>(4);
  const [durationUnit, setDurationUnit] = useState<'hourly' | 'daily'>('hourly');
  const [driverRequired, setDriverRequired] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  const handleGPSLocate = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setLocation(`Nearby (${pos.coords.latitude.toFixed(2)}, ${pos.coords.longitude.toFixed(2)})`);
        },
        () => {
          setIsLocating(false);
          setLocation(user?.location?.district || 'Ludhiana, Punjab');
        },
        { timeout: 6000 }
      );
    }
  };

  const handleFindSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      category: category !== 'All' ? category : undefined,
      attachment: attachment !== 'All' ? attachment : undefined,
      location: location.trim() || undefined,
    });
  };

  // Filter local equipment list according to selection
  const filteredEquipment = equipmentList.filter((eq) => {
    if (category !== 'All' && eq.category !== category) return false;
    if (attachment !== 'All' && eq.attachedImplement && !eq.attachedImplement.toLowerCase().includes(attachment.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner: Farmer Welcome & Quick Navigation */}
      <div className="bg-emerald-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onOpenProfile('profile')}
            className="relative group shrink-0"
            title="Open Profile Settings"
          >
            <img
              src={
                user?.avatar ||
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
              }
              alt={user?.name || 'Farmer'}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-400 group-hover:scale-105 transition"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-emerald-950 rounded-full" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-heading text-white">
                Welcome, {user?.name || 'Farmer'}
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700">
                Verified Farmer
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              {user?.location?.district ? `${user.location.district}, ${user.location.state || 'India'}` : 'Agricultural Land Access'} • ID: #{user?._id?.slice(-5).toUpperCase() || 'FRM99'}
            </p>
          </div>
        </div>

        {/* Quick Menu Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={() => onOpenProfile('profile')}
            className="flex-1 md:flex-none px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <UserIcon className="w-3.5 h-3.5 text-emerald-300" />
            <span>Profile & KYC</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenProfile('bookings')}
            className="flex-1 md:flex-none px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 border border-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <CalendarCheck className="w-3.5 h-3.5 text-amber-300" />
            <span>My Bookings</span>
          </button>

          <button
            type="button"
            onClick={() => onOpenProfile('contact')}
            className="flex-1 md:flex-none px-3.5 py-2 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <Headphones className="w-3.5 h-3.5 text-emerald-300" />
            <span>Contact Us</span>
          </button>
        </div>
      </div>

      {/* MIDDLE OF PAGE: FIND EQUIPMENT FORM (English only, minimum text, only needed information) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-stone-200">
        <div className="flex items-center justify-between mb-5 border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Tractor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900 font-heading">
                Find Equipment
              </h2>
              <p className="text-xs text-stone-500">
                Select equipment, required attachment, and farm location to find verified machinery nearby.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenRadarMap}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-100 hover:bg-emerald-50 text-emerald-900 rounded-xl text-xs font-bold transition"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            <span>View Radar Map</span>
          </button>
        </div>

        {/* The Form */}
        <form onSubmit={handleFindSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Field 1: Equipment Category */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Equipment Type
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="All">All Machinery Types</option>
                <option value="Tractor">Tractor (35 - 75 HP)</option>
                <option value="Combine Harvester">Combine Harvester</option>
                <option value="Loader">Loader & JCB</option>
                <option value="Other Machinery">Rotavator / Leveler / Implements</option>
              </select>
            </div>

            {/* Field 2: Attachment / Work Type */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Attachment / Work
              </label>
              <select
                value={attachment}
                onChange={(e) => setAttachment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="All">Any Attachment / Standard</option>
                <option value="Cultivator">Cultivator (9 / 11 Tynes)</option>
                <option value="Rotavator">Rotavator (6 / 7 / 8 Feet)</option>
                <option value="Disc Harrow">Disc Harrow</option>
                <option value="MB Plough">MB Plough / Reversible</option>
                <option value="Seed Drill">Zero Till Seed Drill</option>
                <option value="Laser Land Leveler">Laser Land Leveler</option>
                <option value="Straw Reaper">Straw Reaper</option>
                <option value="Trolley / Trailer">Trolley / Trailer Transport</option>
                <option value="None / Bare Machine">Bare Machine (No Attachment)</option>
              </select>
            </div>

            {/* Field 3: Location / Village */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Farm Location
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Ludhiana, Karnal, Indore"
                  className="w-full pl-3 pr-9 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleGPSLocate}
                  disabled={isLocating}
                  className="absolute right-2.5 top-2.5 text-stone-400 hover:text-emerald-700"
                  title="Detect GPS Location"
                >
                  <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin text-emerald-600' : ''}`} />
                </button>
              </div>
            </div>

            {/* Field 4: Work Duration & Rental Type */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Work Duration
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={duration}
                  onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none font-mono"
                />
                <select
                  value={durationUnit}
                  onChange={(e) => setDurationUnit(e.target.value as 'hourly' | 'daily')}
                  className="w-full px-2 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs font-medium text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="hourly">Hours</option>
                  <option value="daily">Days</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: Date & Driver option + Find Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t border-stone-100">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-stone-400" />
                <span className="font-semibold text-stone-700">Date:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs font-medium text-stone-800 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={driverRequired}
                  onChange={(e) => setDriverRequired(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 border-stone-300"
                />
                <span className="font-semibold text-stone-700">Include Driver / Operator</span>
              </label>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Find Available Equipment</span>
            </button>
          </div>
        </form>
      </div>

      {/* MATCHED EQUIPMENT FLEET RESULTS */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-black text-stone-900 font-heading">
              Available Farm Machinery
            </h3>
            <p className="text-xs text-stone-500">
              Showing {filteredEquipment.length} verified machines available for field booking.
            </p>
          </div>

          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            ⚡ Direct Owner Rates
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-stone-600">Searching matching tractors & machinery...</p>
          </div>
        ) : filteredEquipment.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 max-w-lg mx-auto">
            <Tractor className="w-12 h-12 text-stone-400 mx-auto mb-3" />
            <h4 className="text-base font-bold text-stone-900 mb-1">No Matching Machinery Found</h4>
            <p className="text-xs text-stone-500 mb-4">
              Try changing the equipment type or attachment to view all available machines in your state.
            </p>
            <button
              type="button"
              onClick={() => {
                setCategory('All');
                setAttachment('All');
                setLocation('');
              }}
              className="px-4 py-2 bg-emerald-800 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredEquipment.map((eq) => (
              <EquipmentCard
                key={eq._id}
                item={eq}
                equipment={eq}
                onSelect={(selected) => onSelectEquipment(selected)}
                onBookNow={(selected) => onSelectEquipment(selected)}
                language="en"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
