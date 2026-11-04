import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Equipment, Booking, AdminStats } from '../types';
import { api } from '../services/api';
import {
  ShieldCheck,
  Users,
  Tractor,
  CalendarCheck,
  IndianRupee,
  RefreshCw,
  PlusCircle,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Search,
  Check,
  X,
  Eye,
  KeyRound,
  ArrowRight,
  UserCheck,
  Clock,
  Briefcase,
  Layers,
  Settings,
} from 'lucide-react';

interface AdminDashboardViewProps {
  onAddEquipment: () => void;
  language: 'en' | 'hi';
  onNavigateHome?: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  onAddEquipment,
  language,
  onNavigateHome,
}) => {
  const { user, login } = useAuth();

  // Admin access gate state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Active section: 'users' | 'fleet' | 'bookings' | 'settings'
  const [activeTab, setActiveTab] = useState<'users' | 'fleet' | 'bookings' | 'settings'>('users');

  // Master Data
  const [users, setUsers] = useState<User[]>([]);
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [bookingsList, setBookingsList] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters
  const [userRoleFilter, setUserRoleFilter] = useState<'all' | 'farmer' | 'owner'>('all');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [fleetSearchQuery, setFleetSearchQuery] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('all');

  // Selected User Detail Modal (Farmer or Owner)
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Quick OTP Modal
  const [otpBooking, setOtpBooking] = useState<Booking | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpType, setOtpType] = useState<'start' | 'complete'>('start');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadData = async () => {
    setRefreshing(true);
    try {
      const [usersRes, equipRes, bookRes] = await Promise.allSettled([
        api.getAdminUsers(),
        api.getEquipment({}),
        api.getAdminBookings({}),
      ]);

      if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data);
      if (equipRes.status === 'fulfilled') setEquipmentList(equipRes.value.data);
      if (bookRes.status === 'fulfilled') setBookingsList(bookRes.value.data);
    } catch (err: any) {
      console.error('Admin data fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user?.role]);

  // Handle Admin Direct Sign In
  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsAuthenticating(true);
    try {
      await login(adminEmail, adminPassword);
      showToast('Welcome, Administrator');
    } catch (err: any) {
      setAuthError(err.message || 'Invalid administrator credentials');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // User Actions
  const handleToggleVerify = async (targetUser: User) => {
    try {
      await api.toggleUserVerification(targetUser._id, !targetUser.verified);
      setUsers((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, verified: !u.verified } : u))
      );
      if (selectedUser && selectedUser._id === targetUser._id) {
        setSelectedUser((prev) => (prev ? { ...prev, verified: !prev.verified } : null));
      }
      showToast(`User verification updated`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update verification');
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'farmer' | 'owner' | 'admin') => {
    try {
      await api.updateUserRole(userId, newRole);
      setUsers((prev) => prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)));
      if (selectedUser && selectedUser._id === userId) {
        setSelectedUser((prev) => (prev ? { ...prev, role: newRole } : null));
      }
      showToast(`Role updated to ${newRole}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.deleteUser(userId);
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setSelectedUser(null);
      showToast('User deleted from platform');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete user');
    }
  };

  // Fleet Actions
  const handleToggleEquipmentStatus = async (equip: Equipment) => {
    const nextStatus = equip.status === 'available' ? 'rented' : 'available';
    try {
      await api.updateEquipmentStatus(equip._id, nextStatus as any);
      setEquipmentList((prev) =>
        prev.map((e) => (e._id === equip._id ? { ...e, status: nextStatus as any } : e))
      );
      showToast(`Machinery status set to ${nextStatus}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update machinery status');
    }
  };

  const handleDeleteEquipment = async (equipId: string) => {
    if (!window.confirm('Delete this machinery listing?')) return;
    try {
      await api.deleteEquipment(equipId);
      setEquipmentList((prev) => prev.filter((e) => e._id !== equipId));
      showToast('Machinery removed');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete machinery');
    }
  };

  // Booking Actions
  const handleUpdateBookingStatus = async (bookingId: string, newStatus: string) => {
    try {
      await api.updateAdminBookingStatus(bookingId, newStatus);
      setBookingsList((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status: newStatus as any } : b))
      );
      showToast(`Order status updated to ${newStatus}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update order status');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpBooking || !otpCode) return;
    try {
      await api.verifyAdminOtp(otpBooking._id, otpCode, otpType);
      showToast(`OTP Verified: Task marked ${otpType === 'start' ? 'In Progress' : 'Completed'}`);
      setOtpBooking(null);
      setOtpCode('');
      loadData();
    } catch (err: any) {
      showToast(err.message || 'Invalid OTP');
    }
  };

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== 'all' && u.role !== userRoleFilter) return false;
    if (userSearchQuery) {
      const q = userSearchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phone && u.phone.includes(q)) ||
        (u.location?.district && u.location.district.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const filteredFleet = equipmentList.filter((e) => {
    if (!fleetSearchQuery) return true;
    const q = fleetSearchQuery.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.location.state.toLowerCase().includes(q) ||
      e.location.district.toLowerCase().includes(q)
    );
  });

  const filteredBookings = bookingsList.filter((b) => {
    if (bookingStatusFilter !== 'all' && b.status !== bookingStatusFilter) return false;
    return true;
  });

  // Calculate Metrics
  const totalFarmers = users.filter((u) => u.role === 'farmer').length;
  const totalOwners = users.filter((u) => u.role === 'owner').length;
  const totalMachines = equipmentList.length;
  const totalOrders = bookingsList.length;
  const totalRevenue = bookingsList
    .filter((b) => b.status === 'completed' || b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + (b.totalAmount || b.totalPrice || 0), 0);

  // --- ACCESS GATE FOR NON-ADMIN USERS ---
  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4 bg-stone-100">
        <div className="bg-white max-w-md w-full p-6 sm:p-8 rounded-2xl shadow-xl border border-stone-200 text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-900 text-amber-400 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-stone-900 mb-1">Founder & Admin Console</h2>
          <p className="text-xs text-stone-500 mb-6">Sign in with administrator credentials to access platform controls.</p>

          {authError && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleAdminSignIn} className="space-y-3.5 text-left">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="Enter admin email"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              {isAuthenticating ? 'Signing in...' : 'Sign In as Administrator'}
            </button>
          </form>

          {onNavigateHome && (
            <button
              type="button"
              onClick={onNavigateHome}
              className="mt-4 text-xs font-semibold text-stone-500 hover:text-stone-800"
            >
              ← Back to Homepage
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 py-6 px-3 sm:px-6 lg:px-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-xs border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider">
                Founder Admin
              </span>
              <h1 className="text-xl font-extrabold text-stone-900">PNagro Control Dashboard</h1>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Full administrative access for managing farmers, machinery owners, fleet listings, and rental bookings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              disabled={refreshing}
              className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              onClick={onAddEquipment}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Machinery</span>
            </button>
          </div>
        </div>

        {/* 5 High-Level Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-[11px] font-bold uppercase">Farmers</span>
              <Users className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-black text-stone-900">{totalFarmers}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-[11px] font-bold uppercase">Machinery Owners</span>
              <Tractor className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-2xl font-black text-stone-900">{totalOwners}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-[11px] font-bold uppercase">Total Fleet</span>
              <Layers className="w-4 h-4 text-blue-700" />
            </div>
            <div className="text-2xl font-black text-stone-900">{totalMachines}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-[11px] font-bold uppercase">Total Bookings</span>
              <CalendarCheck className="w-4 h-4 text-purple-700" />
            </div>
            <div className="text-2xl font-black text-stone-900">{totalOrders}</div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-2xs col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-stone-500 mb-1">
              <span className="text-[11px] font-bold uppercase">Platform GMV</span>
              <IndianRupee className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="text-2xl font-black text-stone-900">₹{totalRevenue.toLocaleString()}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-white rounded-xl p-1 gap-1 shadow-2xs">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'users'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Farmers & Owners ({users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('fleet')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'fleet'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Tractor className="w-4 h-4" />
            <span>Machinery Fleet ({equipmentList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('bookings')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'bookings'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Orders & Bookings ({bookingsList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>System Settings</span>
          </button>
        </div>

        {/* -------------------- TAB 1: FARMERS & OWNERS -------------------- */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
            {/* Search & Filter Bar */}
            <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50/60">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="Search by name, email, phone, district..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Role Toggle */}
              <div className="flex items-center gap-1 bg-stone-200 p-1 rounded-xl text-xs font-bold w-full sm:w-auto">
                <button
                  onClick={() => setUserRoleFilter('all')}
                  className={`px-3 py-1 rounded-lg transition ${
                    userRoleFilter === 'all' ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  All ({users.length})
                </button>
                <button
                  onClick={() => setUserRoleFilter('farmer')}
                  className={`px-3 py-1 rounded-lg transition ${
                    userRoleFilter === 'farmer' ? 'bg-white text-emerald-900 shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  Farmers ({totalFarmers})
                </button>
                <button
                  onClick={() => setUserRoleFilter('owner')}
                  className={`px-3 py-1 rounded-lg transition ${
                    userRoleFilter === 'owner' ? 'bg-white text-amber-900 shadow-2xs' : 'text-stone-600'
                  }`}
                >
                  Owners ({totalOwners})
                </button>
              </div>
            </div>

            {/* Users Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Location</th>
                    <th className="py-3 px-4">KYC Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-500">
                        No users found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr
                        key={u._id}
                        className="hover:bg-stone-50 transition cursor-pointer"
                        onClick={() => setSelectedUser(u)}
                      >
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                              alt={u.name}
                              className="w-8 h-8 rounded-full object-cover border border-stone-200"
                            />
                            <div>
                              <div className="font-bold text-stone-900 flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {u.verified && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                              </div>
                              <div className="text-[11px] text-stone-500">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                              u.role === 'farmer'
                                ? 'bg-emerald-100 text-emerald-800'
                                : u.role === 'owner'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-purple-100 text-purple-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-stone-700">
                          {u.phone || '—'}
                        </td>

                        <td className="py-3 px-4 text-stone-600">
                          {u.location?.district ? `${u.location.district}, ${u.location.state}` : 'Punjab'}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleVerify(u);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold transition flex items-center gap-1 ${
                              u.verified
                                ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                            }`}
                          >
                            {u.verified ? 'Verified ✓' : 'Unverified'}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedUser(u)}
                              className="p-1.5 bg-stone-100 hover:bg-emerald-100 text-stone-700 hover:text-emerald-900 rounded-lg transition"
                              title="View Full Profile & Activities"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-1.5 bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 rounded-lg transition"
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------- TAB 2: MACHINERY FLEET -------------------- */}
        {activeTab === 'fleet' && (
          <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50/60">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={fleetSearchQuery}
                  onChange={(e) => setFleetSearchQuery(e.target.value)}
                  placeholder="Search fleet by model, category, state..."
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                />
              </div>

              <div className="text-xs text-stone-500 font-semibold">
                Showing {filteredFleet.length} machinery listings
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Equipment</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Owner / Contact</th>
                    <th className="py-3 px-4">Rental Rates</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredFleet.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-500">
                        No equipment listings found.
                      </td>
                    </tr>
                  ) : (
                    filteredFleet.map((eq) => (
                      <tr key={eq._id} className="hover:bg-stone-50 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={eq.images?.[0] || 'https://images.unsplash.com/photo-1595246140625-573b715d11dc?auto=format&fit=crop&w=150&q=80'}
                              alt={eq.name}
                              className="w-10 h-10 rounded-lg object-cover border border-stone-200"
                            />
                            <div>
                              <div className="font-bold text-stone-900">{eq.name}</div>
                              <div className="text-[11px] text-stone-500">
                                {eq.specs?.hp ? `${eq.specs.hp} HP • ` : ''}
                                {eq.location?.district}, {eq.location?.state}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-800 text-[10px] font-bold">
                            {eq.category}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-semibold text-stone-900">{eq.owner?.name || 'Partner Owner'}</div>
                          <div className="text-[11px] text-stone-500 font-mono">{eq.owner?.phone || '—'}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-emerald-800">₹{eq.hourlyRate}/hr</div>
                          {eq.dailyRate && <div className="text-[11px] text-stone-500">₹{eq.dailyRate}/day</div>}
                        </td>

                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleEquipmentStatus(eq)}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition ${
                              eq.status === 'available'
                                ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                            }`}
                          >
                            {eq.status}
                          </button>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteEquipment(eq._id)}
                            className="p-1.5 bg-stone-100 hover:bg-rose-100 text-stone-500 hover:text-rose-700 rounded-lg transition"
                            title="Delete Machinery Listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------- TAB 3: ORDERS & BOOKINGS -------------------- */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-xs border border-stone-200 overflow-hidden">
            <div className="p-4 border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-stone-50/60">
              <div className="flex items-center gap-1 bg-stone-200 p-1 rounded-xl text-xs font-bold">
                {['all', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setBookingStatusFilter(st)}
                    className={`px-2.5 py-1 rounded-lg capitalize transition ${
                      bookingStatusFilter === st ? 'bg-white text-stone-900 shadow-2xs' : 'text-stone-600'
                    }`}
                  >
                    {st.replace('_', ' ')}
                  </button>
                ))}
              </div>

              <div className="text-xs text-stone-500 font-semibold">
                Showing {filteredBookings.length} orders
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 text-stone-600 font-bold uppercase tracking-wider border-b border-stone-200 text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Order ID & Machinery</th>
                    <th className="py-3 px-4">Farmer Details</th>
                    <th className="py-3 px-4">Dates & Duration</th>
                    <th className="py-3 px-4">Fare & Payment</th>
                    <th className="py-3 px-4">Status & OTP</th>
                    <th className="py-3 px-4 text-right">Status Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredBookings.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-stone-500">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    filteredBookings.map((b) => (
                      <tr key={b._id} className="hover:bg-stone-50 transition">
                        <td className="py-3 px-4">
                          <div className="font-mono text-[10px] text-stone-400">#{b._id.slice(-6)}</div>
                          <div className="font-bold text-stone-900">{b.equipment?.name || 'Farm Equipment'}</div>
                          <div className="text-[11px] text-stone-500">{b.equipment?.category}</div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900">{b.farmerName || b.farmer?.name || 'Farmer'}</div>
                          <div className="text-[11px] text-stone-500 font-mono">{b.contactNumber || b.farmer?.phone || '—'}</div>
                        </td>

                        <td className="py-3 px-4 text-stone-600">
                          <div>{new Date(b.startDate).toLocaleDateString()}</div>
                          <div className="text-[11px] text-stone-500">
                            {b.duration} {b.rentalType === 'hourly' ? 'Hours' : 'Days'}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-bold text-stone-900">₹{(b.totalAmount || b.totalPrice || 0).toLocaleString()}</div>
                          <span
                            className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                              b.paymentStatus === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {b.paymentStatus || 'pending'}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mb-1 ${
                              b.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.status === 'in_progress' || b.status === 'in-progress'
                                ? 'bg-blue-100 text-blue-800'
                                : b.status === 'confirmed'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {b.status}
                          </span>

                          {/* OTP Helper */}
                          {b.startOtp && b.status === 'confirmed' && (
                            <div className="text-[10px] text-stone-500 font-mono">
                              Start OTP: <span className="font-bold text-emerald-700">{b.startOtp}</span>
                            </div>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            {b.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b._id, 'in_progress')}
                                className="px-2 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 rounded text-[10px] font-bold"
                              >
                                Start Job
                              </button>
                            )}
                            {(b.status === 'in_progress' || b.status === 'in-progress') && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b._id, 'completed')}
                                className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded text-[10px] font-bold"
                              >
                                Mark Complete
                              </button>
                            )}
                            {b.status !== 'cancelled' && b.status !== 'completed' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b._id, 'cancelled')}
                                className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[10px] font-bold"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* -------------------- TAB 4: SYSTEM SETTINGS -------------------- */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-stone-900">Platform Commission & Pricing</h3>
              <p className="text-xs text-stone-500">Configure global service charges and commission tiers.</p>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Platform Commission Rate (%)</label>
                  <input
                    type="number"
                    defaultValue={5}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Driver Operator Minimum Hourly Rate (₹)</label>
                  <input
                    type="number"
                    defaultValue={200}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => showToast('Settings successfully updated')}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition"
              >
                Save Settings
              </button>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-stone-900">24/7 Helpline & Dispatch Control</h3>
              <p className="text-xs text-stone-500">Update customer support helpline and emergency response details.</p>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Farmer Toll-Free Helpline</label>
                  <input
                    type="text"
                    defaultValue="1800-889-AGRO (2476)"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Support WhatsApp Number</label>
                  <input
                    type="text"
                    defaultValue="+91 98765 43210"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => showToast('Contact hotline updated')}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition"
              >
                Update Contact Information
              </button>
            </div>
          </div>
        )}
      </div>

      {/* -------------------- USER ACTIVITY INSPECTOR MODAL -------------------- */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-150">
          <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
              <div className="flex items-center gap-3">
                <img
                  src={selectedUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                  alt={selectedUser.name}
                  className="w-10 h-10 rounded-full object-cover border border-emerald-600/50"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">{selectedUser.name}</h3>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        selectedUser.role === 'farmer'
                          ? 'bg-emerald-800 text-emerald-200'
                          : selectedUser.role === 'owner'
                          ? 'bg-amber-800 text-amber-200'
                          : 'bg-purple-800 text-purple-200'
                      }`}
                    >
                      {selectedUser.role}
                    </span>
                    {selectedUser.verified && (
                      <span className="text-[10px] bg-emerald-900 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                        KYC Verified ✓
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-emerald-300">{selectedUser.email}</div>
                </div>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg hover:bg-emerald-900 text-emerald-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
              {/* Contact & Location Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase block">Phone</span>
                  <span className="font-bold text-stone-900">{selectedUser.phone || '—'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase block">District</span>
                  <span className="font-bold text-stone-900">{selectedUser.location?.district || 'Ludhiana'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase block">State</span>
                  <span className="font-bold text-stone-900">{selectedUser.location?.state || 'Punjab'}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase block">Joined</span>
                  <span className="font-bold text-stone-900">
                    {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Active Member'}
                  </span>
                </div>
              </div>

              {/* Specific Activities for Farmer or Owner */}
              {selectedUser.role === 'farmer' ? (
                // FARMER ACTIVITIES
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-stone-900 text-xs">Farmer Order History & Completed Tasks</h4>
                    <span className="text-[11px] text-stone-500 font-semibold">
                      {bookingsList.filter((b) => b.farmer?._id === selectedUser._id || (b.user && (b.user._id === selectedUser._id || b.user === selectedUser._id)) || b.farmerName === selectedUser.name).length} Bookings Placed
                    </span>
                  </div>

                  <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
                    {bookingsList.filter((b) => b.farmer?._id === selectedUser._id || (b.user && (b.user._id === selectedUser._id || b.user === selectedUser._id)) || b.farmerName === selectedUser.name).length === 0 ? (
                      <div className="p-4 text-center text-stone-400">
                        No machinery rental orders placed yet.
                      </div>
                    ) : (
                      bookingsList
                        .filter((b) => b.farmer?._id === selectedUser._id || (b.user && (b.user._id === selectedUser._id || b.user === selectedUser._id)) || b.farmerName === selectedUser.name)
                        .map((b) => (
                          <div key={b._id} className="p-3 flex items-center justify-between hover:bg-stone-50">
                            <div>
                              <div className="font-bold text-stone-900">{b.equipment?.name || 'Equipment Booking'}</div>
                              <div className="text-[11px] text-stone-500">
                                {new Date(b.startDate).toLocaleDateString()} • {b.duration} {b.rentalType === 'hourly' ? 'hrs' : 'days'} • Owner: {b.equipment?.owner?.name || 'Machinery Partner'}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-stone-900">₹{(b.totalAmount || b.totalPrice || 0).toLocaleString()}</div>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                  b.status === 'completed'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : b.status === 'in_progress' || b.status === 'in-progress'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {b.status}
                              </span>
                            </div>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              ) : (
                // OWNER ACTIVITIES & FLEET
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-stone-900 text-xs">Machinery Fleet Owned & Jobs Received</h4>
                    <span className="text-[11px] text-stone-500 font-semibold">
                      {equipmentList.filter((e) => e.owner?._id === selectedUser._id || e.owner?.name === selectedUser.name).length} Machines Listed
                    </span>
                  </div>

                  <div className="border border-stone-200 rounded-xl overflow-hidden divide-y divide-stone-100">
                    {equipmentList.filter((e) => e.owner?._id === selectedUser._id || e.owner?.name === selectedUser.name).length === 0 ? (
                      <div className="p-4 text-center text-stone-400">
                        No equipment listed under this owner account.
                      </div>
                    ) : (
                      equipmentList
                        .filter((e) => e.owner?._id === selectedUser._id || e.owner?.name === selectedUser.name)
                        .map((eq) => (
                          <div key={eq._id} className="p-3 flex items-center justify-between hover:bg-stone-50">
                            <div>
                              <div className="font-bold text-stone-900">{eq.name}</div>
                              <div className="text-[11px] text-stone-500">
                                {eq.category} • ₹{eq.hourlyRate}/hr • ₹{eq.dailyRate || eq.hourlyRate * 8}/day
                              </div>
                            </div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                                eq.status === 'available'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {eq.status}
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              )}

              {/* Founder Admin Controls */}
              <div className="pt-3 border-t border-stone-200">
                <h5 className="font-bold text-stone-900 mb-2 text-xs">Admin Management Actions</h5>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleToggleVerify(selectedUser)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ${
                      selectedUser.verified
                        ? 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{selectedUser.verified ? 'Revoke KYC Verification' : 'Verify KYC Account'}</span>
                  </button>

                  <button
                    onClick={() =>
                      handleRoleChange(
                        selectedUser._id,
                        selectedUser.role === 'farmer' ? 'owner' : 'farmer'
                      )
                    }
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-xl font-bold text-xs transition flex items-center gap-1.5"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Switch Role to {selectedUser.role === 'farmer' ? 'Owner' : 'Farmer'}</span>
                  </button>

                  <button
                    onClick={() => handleDeleteUser(selectedUser._id)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold text-xs transition flex items-center gap-1.5 ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete User Account</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
