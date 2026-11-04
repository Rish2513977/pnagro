import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Equipment, Booking } from '../types';
import { api } from '../services/api';
import {
  Tractor,
  CalendarCheck,
  IndianRupee,
  RefreshCw,
  PlusCircle,
  Trash2,
  Edit,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Check,
  X,
  User as UserIcon,
  ShieldCheck,
  Activity,
  Layers,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Search,
} from 'lucide-react';

interface OwnerDashboardViewProps {
  onAddEquipment: () => void;
  language: 'en' | 'hi';
  onOpenProfile: (tab?: 'profile' | 'bookings' | 'contact') => void;
}

export const OwnerDashboardView: React.FC<OwnerDashboardViewProps> = ({
  onAddEquipment,
  language,
  onOpenProfile,
}) => {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'equipment' | 'requests' | 'active' | 'history' | 'earnings'>('equipment');
  const [myEquipment, setMyEquipment] = useState<Equipment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionInProgressId, setActionInProgressId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  // Contact farmer modal
  const [contactModalBooking, setContactModalBooking] = useState<Booking | null>(null);

  // Edit equipment state
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [editHourlyRate, setEditHourlyRate] = useState<number>(0);
  const [editDailyRate, setEditDailyRate] = useState<number>(0);
  const [editStatus, setEditStatus] = useState<'available' | 'rented' | 'maintenance'>('available');

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadOwnerData = async () => {
    setRefreshing(true);
    try {
      const [equipRes, bookRes] = await Promise.allSettled([
        api.getMyEquipment(),
        api.getBookings(),
      ]);

      if (equipRes.status === 'fulfilled') {
        setMyEquipment(equipRes.value.data);
      }
      if (bookRes.status === 'fulfilled') {
        setBookings(bookRes.value.data);
      }
    } catch (err: any) {
      console.error('Owner dashboard data error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOwnerData();
  }, []);

  // Filter bookings
  const pendingRequests = bookings.filter((b) => b.status === 'pending');
  const activeRentals = bookings.filter((b) => b.status === 'confirmed' || b.status === 'in_progress');
  const completedHistory = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  // Metrics
  const totalEquipmentCount = myEquipment.length;
  const pendingRequestsCount = pendingRequests.length;
  const activeRentalsCount = activeRentals.length;
  const completedCount = bookings.filter((b) => b.status === 'completed').length;
  const totalEarnings = bookings
    .filter((b) => b.status === 'completed')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Status transitions by owner
  const handleBookingAction = async (bookingId: string, newStatus: 'confirmed' | 'cancelled' | 'in_progress' | 'completed') => {
    try {
      setActionInProgressId(bookingId);
      await api.updateBookingStatus(bookingId, newStatus);
      showToast(
        newStatus === 'confirmed'
          ? 'Booking request accepted!'
          : newStatus === 'cancelled'
          ? 'Booking request cancelled'
          : newStatus === 'in_progress'
          ? 'Machinery rental operation started'
          : 'Booking marked as completed! Payment recorded.'
      );
      await loadOwnerData();
    } catch (err: any) {
      showToast(err.message || 'Action failed', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Toggle equipment availability
  const handleToggleEquipmentStatus = async (equip: Equipment) => {
    const nextStatus = equip.status === 'available' ? 'maintenance' : 'available';
    try {
      setActionInProgressId(equip._id);
      await api.updateEquipment(equip._id, { status: nextStatus });
      setMyEquipment((prev) =>
        prev.map((e) => (e._id === equip._id ? { ...e, status: nextStatus } : e))
      );
      showToast(`Status updated to ${nextStatus}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update equipment status', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Delete equipment
  const handleDeleteEquipment = async (equipId: string) => {
    if (!window.confirm('Are you sure you want to remove this equipment listing from PNagro?')) {
      return;
    }
    try {
      setActionInProgressId(equipId);
      await api.deleteEquipment(equipId);
      setMyEquipment((prev) => prev.filter((e) => e._id !== equipId));
      showToast('Equipment removed successfully');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete equipment', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  // Save edited equipment
  const handleSaveEquipmentEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEquipment) return;
    try {
      setActionInProgressId(editingEquipment._id);
      const res = await api.updateEquipment(editingEquipment._id, {
        hourlyRate: editHourlyRate,
        dailyRate: editDailyRate,
        status: editStatus,
      });
      setMyEquipment((prev) =>
        prev.map((item) => (item._id === editingEquipment._id ? res.data : item))
      );
      setEditingEquipment(null);
      showToast('Machinery details updated');
    } catch (err: any) {
      showToast(err.message || 'Failed to update equipment', 'error');
    } finally {
      setActionInProgressId(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 py-8 px-4 sm:px-6 lg:px-8 space-y-8 max-w-7xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-2 border animate-fade-in ${
            toastType === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          {toastType === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertCircle className="w-5 h-5 text-rose-400" />}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner: Equipment Owner Hub */}
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
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
              }
              alt={user?.name || 'Equipment Owner'}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 group-hover:scale-105 transition"
            />
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-amber-500 border-2 border-emerald-950 rounded-full" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-heading text-white">
                {user?.name || 'Equipment Owner'}
              </h1>
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                Equipment Owner
              </span>
            </div>
            <p className="text-xs text-emerald-200/80 mt-0.5">
              {user?.location?.district ? `${user.location.district}, ${user.location.state || 'India'}` : 'Machinery Fleet Manager'} • ID: #{user?._id?.slice(-5).toUpperCase() || 'OWN99'}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            type="button"
            onClick={onAddEquipment}
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-emerald-950 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List New Machinery</span>
          </button>

          <button
            type="button"
            onClick={loadOwnerData}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/15 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">My Fleet</span>
            <Tractor className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-stone-900 font-heading">
            {totalEquipmentCount}
          </p>
          <span className="text-[11px] text-stone-500 mt-1 block">Listed Machines</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Requests</span>
            <AlertCircle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-700 font-heading">
            {pendingRequestsCount}
          </p>
          <span className="text-[11px] text-stone-500 mt-1 block">Needs Approval</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Active</span>
            <Activity className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-blue-700 font-heading">
            {activeRentalsCount}
          </p>
          <span className="text-[11px] text-stone-500 mt-1 block">In Field / Confirmed</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-800 font-heading">
            {completedCount}
          </p>
          <span className="text-[11px] text-stone-500 mt-1 block">Rentals Finished</span>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Earnings</span>
            <IndianRupee className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-900 font-heading truncate">
            ₹{totalEarnings.toLocaleString()}
          </p>
          <span className="text-[11px] text-emerald-700 font-bold mt-1 block">Total Payouts</span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
        {[
          { id: 'equipment', label: 'My Equipment', count: totalEquipmentCount, icon: Tractor },
          { id: 'requests', label: 'Booking Requests', count: pendingRequestsCount, icon: AlertCircle, badgeColor: 'bg-amber-500 text-emerald-950' },
          { id: 'active', label: 'Active Rentals', count: activeRentalsCount, icon: Activity, badgeColor: 'bg-blue-600 text-white' },
          { id: 'history', label: 'Booking History', count: completedHistory.length, icon: CalendarCheck },
          { id: 'earnings', label: 'Earnings & Insights', icon: TrendingUp },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                isActive
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                    tab.badgeColor || (isActive ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-200 text-stone-700')
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab 1: My Equipment */}
      {activeTab === 'equipment' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-stone-900 font-heading">
                My Listed Farm Machinery ({myEquipment.length})
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Manage your tractors, harvesters, hourly rates, and live availability.
              </p>
            </div>
            <button
              type="button"
              onClick={onAddEquipment}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Equipment</span>
            </button>
          </div>

          {loading ? (
            <div className="py-20 text-center">
              <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin mx-auto mb-3" />
              <p className="text-xs font-bold text-stone-500">Loading your equipment listings...</p>
            </div>
          ) : myEquipment.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
                <Tractor className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">No Equipment Listed Yet</h3>
              <p className="text-xs text-stone-500 mb-6 leading-relaxed">
                Add your tractors, multi-crop harvesters, or agricultural implements to receive booking requests from nearby farmers.
              </p>
              <button
                type="button"
                onClick={onAddEquipment}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                <span>List Your First Machine</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {myEquipment.map((equip) => (
                <div
                  key={equip._id}
                  className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    {/* Image & Status Tag */}
                    <div className="relative rounded-xl overflow-hidden mb-3 aspect-video bg-stone-100 border border-stone-100">
                      <img
                        src={
                          equip.images?.[0] ||
                          'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80'
                        }
                        alt={equip.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full shadow-xs ${
                            equip.status === 'available'
                              ? 'bg-emerald-600 text-white'
                              : equip.status === 'rented'
                              ? 'bg-blue-600 text-white'
                              : 'bg-amber-600 text-white'
                          }`}
                        >
                          {equip.status}
                        </span>
                      </div>
                    </div>

                    {/* Titles */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                          {equip.category} • {equip.brand}
                        </span>
                        <h3 className="font-bold text-sm text-stone-900 mt-0.5 line-clamp-1">
                          {equip.name}
                        </h3>
                      </div>
                      <span className="text-xs font-black text-emerald-800 bg-emerald-50 px-2 py-1 rounded-lg shrink-0">
                        {equip.hp} HP
                      </span>
                    </div>

                    {/* Specs / Implements */}
                    <div className="mt-3 space-y-1 text-xs text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <p className="flex items-center justify-between">
                        <span className="text-stone-500">Implement:</span>
                        <strong className="text-stone-800">{equip.attachedImplement || 'Standard'}</strong>
                      </p>
                      <p className="flex items-center justify-between">
                        <span className="text-stone-500">Location:</span>
                        <span className="text-stone-800 truncate max-w-[160px]">
                          {equip.location?.district}, {equip.location?.state}
                        </span>
                      </p>
                      <p className="flex items-center justify-between">
                        <span className="text-stone-500">Rental Rate:</span>
                        <strong className="text-emerald-700">₹{equip.hourlyRate}/hr • ₹{equip.dailyRate}/day</strong>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleEquipmentStatus(equip)}
                      disabled={actionInProgressId === equip._id}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition ${
                        equip.status === 'available'
                          ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                          : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                      }`}
                    >
                      {equip.status === 'available' ? 'Mark In Maintenance' : 'Set Available'}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingEquipment(equip);
                          setEditHourlyRate(equip.hourlyRate);
                          setEditDailyRate(equip.dailyRate);
                          setEditStatus(equip.status);
                        }}
                        className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg transition"
                        title="Edit Price & Status"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEquipment(equip._id)}
                        disabled={actionInProgressId === equip._id}
                        className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                        title="Delete Equipment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Booking Requests (Pending) */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900 font-heading">
              New Farmer Booking Requests ({pendingRequests.length})
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Farmers requesting machinery in your area. Accept or decline based on equipment availability.
            </p>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">No Pending Requests</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                You have addressed all incoming booking requests. When farmers in your district place new requests, they will appear here instantly.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {pendingRequests.map((b) => (
                <div
                  key={b._id}
                  className="bg-white rounded-2xl border-2 border-amber-200/80 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <span className="text-[11px] font-mono text-stone-500">
                        Order #{b._id.slice(-6).toUpperCase()}
                      </span>
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        Pending Request
                      </span>
                    </div>

                    <div className="flex gap-3.5 my-4">
                      <img
                        src={
                          b.equipment?.images?.[0] ||
                          'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=300&q=80'
                        }
                        alt={b.equipment?.name}
                        className="w-20 h-20 rounded-xl object-cover border border-stone-200 bg-stone-100 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase">
                          {b.equipment?.category}
                        </span>
                        <h4 className="font-bold text-sm text-stone-900 truncate">
                          {b.equipment?.name}
                        </h4>
                        <p className="text-xs text-stone-500 mt-1">
                          Duration: <strong className="text-stone-800">{b.duration} {b.rentalType === 'daily' ? 'Days' : 'Hours'}</strong>
                        </p>
                        <p className="text-xs text-stone-500">
                          Date: <strong>{new Date(b.startDate).toLocaleDateString()}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Farmer details */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1.5 text-xs text-stone-700">
                      <p className="font-bold flex items-center gap-1.5 text-stone-900">
                        <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Farmer: {b.farmerName}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{b.contactNumber}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          {b.deliveryAddress?.street}, {b.deliveryAddress?.villageOrDistrict}, {b.deliveryAddress?.state}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-stone-500 block uppercase font-bold">Total Payout</span>
                      <span className="text-base font-extrabold text-emerald-800 font-heading">
                        ₹{b.totalAmount?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleBookingAction(b._id, 'confirmed')}
                        disabled={actionInProgressId === b._id}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Accept</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBookingAction(b._id, 'cancelled')}
                        disabled={actionInProgressId === b._id}
                        className="px-3 py-2 border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Active Rentals */}
      {activeTab === 'active' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900 font-heading">
              Active Machinery Rentals ({activeRentals.length})
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Confirmed bookings and in-progress field operations. Mark completed once cultivation is finished.
            </p>
          </div>

          {activeRentals.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
                <Tractor className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">No Active Rentals in Field</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Accepted booking requests will move here so you can track driver dispatch, start operation, and mark completion.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeRentals.map((b) => (
                <div
                  key={b._id}
                  className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                      <span className="text-[11px] font-mono text-stone-500">
                        Order #{b._id.slice(-6).toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                          b.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex gap-3.5 my-4">
                      <img
                        src={
                          b.equipment?.images?.[0] ||
                          'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=300&q=80'
                        }
                        alt={b.equipment?.name}
                        className="w-20 h-20 rounded-xl object-cover border border-stone-200 bg-stone-100 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] font-bold text-emerald-700 uppercase">
                          {b.equipment?.category}
                        </span>
                        <h4 className="font-bold text-sm text-stone-900 truncate">
                          {b.equipment?.name}
                        </h4>
                        <p className="text-xs text-stone-500 mt-1">
                          Duration: <strong className="text-stone-800">{b.duration} {b.rentalType === 'daily' ? 'Days' : 'Hours'}</strong>
                        </p>
                        <p className="text-xs text-stone-500">
                          Date: <strong>{new Date(b.startDate).toLocaleDateString()}</strong>
                        </p>
                      </div>
                    </div>

                    {/* Farmer Details */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1.5 text-xs text-stone-700">
                      <p className="font-bold flex items-center gap-1.5 text-stone-900">
                        <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Farmer: {b.farmerName}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">
                          {b.deliveryAddress?.street}, {b.deliveryAddress?.villageOrDistrict}, {b.deliveryAddress?.state}
                        </span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{b.contactNumber}</span>
                      </p>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-stone-500 block uppercase font-bold">Total Amount</span>
                      <span className="text-base font-extrabold text-emerald-800 font-heading">
                        ₹{b.totalAmount?.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setContactModalBooking(b)}
                        className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                        title="Contact Farmer"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Call</span>
                      </button>

                      {b.status === 'confirmed' && (
                        <button
                          type="button"
                          onClick={() => handleBookingAction(b._id, 'in_progress')}
                          disabled={actionInProgressId === b._id}
                          className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
                        >
                          Start Operation
                        </button>
                      )}

                      {b.status === 'in_progress' && (
                        <button
                          type="button"
                          onClick={() => handleBookingAction(b._id, 'completed')}
                          disabled={actionInProgressId === b._id}
                          className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
                        >
                          Mark Completed
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Booking History */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900 font-heading">
              Rental History & Archives ({completedHistory.length})
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Completed agricultural contracts, invoices, and cancellation logs.
            </p>
          </div>

          {completedHistory.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto mb-4">
                <CalendarCheck className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">No Past History</h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                As your equipment completes operations in the field, full invoices and rental records will be archived here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedHistory.map((b) => (
                <div
                  key={b._id}
                  className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={
                        b.equipment?.images?.[0] ||
                        'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={b.equipment?.name}
                      className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-sm text-stone-900 truncate">
                          {b.equipment?.name}
                        </h4>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            b.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Farmer: {b.farmerName} • Date: {new Date(b.startDate).toLocaleDateString()} • {b.duration} {b.rentalType === 'daily' ? 'Days' : 'Hours'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] text-stone-500 block">Payout Amount</span>
                      <span className="text-sm font-black text-emerald-800">
                        ₹{b.totalAmount?.toLocaleString()}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-stone-400 font-mono">
                      #{b._id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Earnings & Insights */}
      {activeTab === 'earnings' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-stone-900 font-heading">
              Equipment Rental Earnings & Analytics
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Financial performance, payout history, and utilization rates across your machinery fleet.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-md border border-emerald-800">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Total Realized Revenue
              </span>
              <p className="text-3xl font-black mt-2 font-heading">
                ₹{totalEarnings.toLocaleString()}
              </p>
              <p className="text-xs text-emerald-200/80 mt-2">
                Settled directly via Cash on Delivery and Direct Kisan Transfers.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Completed Jobs
              </span>
              <p className="text-3xl font-black mt-2 font-heading text-stone-900">
                {completedCount}
              </p>
              <p className="text-xs text-stone-500 mt-2">
                Zero cancellation penalty on completed agricultural jobs.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs">
              <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
                Active Fleet Units
              </span>
              <p className="text-3xl font-black mt-2 font-heading text-stone-900">
                {myEquipment.filter((e) => e.status === 'available').length} / {myEquipment.length}
              </p>
              <p className="text-xs text-stone-500 mt-2">
                Machines actively discoverable on the farmer radar map.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Edit Equipment Modal */}
      {editingEquipment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm font-heading">Edit Machinery Listing</h3>
              <button
                onClick={() => setEditingEquipment(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEquipmentEdit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Equipment Name</label>
                <input
                  type="text"
                  disabled
                  value={editingEquipment.name}
                  className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-xl text-xs text-stone-600 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={editHourlyRate}
                    onChange={(e) => setEditHourlyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Daily Rate (₹)</label>
                  <input
                    type="number"
                    min="500"
                    step="100"
                    value={editDailyRate}
                    onChange={(e) => setEditDailyRate(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Current Availability Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="available">Available (Discoverable on Radar)</option>
                  <option value="rented">Rented (Currently in Field)</option>
                  <option value="maintenance">Maintenance / Service</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingEquipment(null)}
                  className="px-4 py-2 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionInProgressId === editingEquipment._id}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Farmer Modal */}
      {contactModalBooking && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl border border-stone-200 overflow-hidden">
            <div className="p-4 bg-emerald-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-sm font-heading">Farmer Contact & Delivery</h3>
              <button
                onClick={() => setContactModalBooking(null)}
                className="p-1 hover:bg-white/20 rounded-lg transition text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-center">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-700">
                <Phone className="w-7 h-7" />
              </div>

              <div>
                <h4 className="font-bold text-stone-900 text-base">{contactModalBooking.farmerName}</h4>
                <p className="text-xs text-stone-500 mt-0.5">Order #{contactModalBooking._id.slice(-6).toUpperCase()}</p>
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 text-xs text-stone-700 text-left space-y-1">
                <p><strong>Phone:</strong> {contactModalBooking.contactNumber}</p>
                <p>
                  <strong>Address:</strong> {contactModalBooking.deliveryAddress?.street},{' '}
                  {contactModalBooking.deliveryAddress?.villageOrDistrict},{' '}
                  {contactModalBooking.deliveryAddress?.state}
                </p>
                {contactModalBooking.notes && (
                  <p><strong>Farmer Note:</strong> {contactModalBooking.notes}</p>
                )}
              </div>

              <div className="flex gap-2">
                <a
                  href={`tel:${contactModalBooking.contactNumber}`}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Now</span>
                </a>
                <button
                  type="button"
                  onClick={() => setContactModalBooking(null)}
                  className="px-4 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-xs font-bold hover:bg-stone-100 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
