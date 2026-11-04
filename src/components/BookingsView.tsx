import React, { useState, useEffect } from 'react';
import { Booking } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  CalendarCheck,
  Tractor,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  Phone,
  AlertCircle,
  RefreshCw,
  IndianRupee,
  ShieldCheck,
  KeyRound,
  FileText,
  User as UserIcon,
} from 'lucide-react';

interface BookingsViewProps {
  onBrowseEquipment: () => void;
  language: 'en' | 'hi';
}

export const BookingsView: React.FC<BookingsViewProps> = ({
  onBrowseEquipment,
  language,
}) => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await api.getBookings();
      setBookings(res.data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to cancel this equipment booking request?')) {
      return;
    }
    try {
      setUpdatingId(bookingId);
      await api.updateBookingStatus(bookingId, 'cancelled');
      showToast('Booking request cancelled');
      await fetchBookings();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel booking');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'all') return true;
    return b.status === filter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl shadow-2xl text-sm font-bold flex items-center gap-2 border bg-stone-900 text-white border-stone-700 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-heading">
            Farmer Rental Dashboard
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
            My Equipment Bookings ({bookings.length})
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Track real-time delivery status, equipment owner details, and rental receipts.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchBookings}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <button
            onClick={onBrowseEquipment}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs"
          >
            <Tractor className="w-3.5 h-3.5" />
            <span>Find More Equipment</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-stone-200 pb-3">
        {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold capitalize transition ${
              filter === tab
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {loading ? (
        <div className="py-20 text-center">
          <RefreshCw className="w-8 h-8 text-emerald-700 animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-stone-600">Loading your rental records...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center max-w-lg mx-auto my-8">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4">
            <Tractor className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-2">No Bookings Found</h3>
          <p className="text-xs text-stone-500 mb-6 leading-relaxed">
            {filter !== 'all'
              ? `You do not have any rentals in "${filter}" status.`
              : 'You have not booked any machinery rentals yet. Browse our verified tractors and heavy equipment in your nearby area.'}
          </p>
          <button
            onClick={onBrowseEquipment}
            className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-sm transition"
          >
            Browse Available Equipment
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredBookings.map((b) => {
            return (
              <div
                key={b._id}
                className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Status & Booking ID */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <span className="text-[11px] font-mono text-stone-500">
                      ID: #{b._id.slice(-6).toUpperCase()}
                    </span>

                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        b.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : b.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : b.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-900'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {b.status.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Main Details */}
                  <div className="flex gap-4 my-4">
                    <img
                      src={
                        b.equipment?.images?.[0] ||
                        'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=300&q=80'
                      }
                      alt={b.equipment?.name}
                      className="w-20 h-20 rounded-xl object-cover border border-stone-200 bg-stone-100 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase">
                        {b.equipment?.category}
                      </span>
                      <h3 className="font-bold text-sm text-stone-900 truncate">
                        {b.equipment?.name || 'Farm Equipment'}
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Duration: <strong className="text-stone-800">{b.duration} {b.rentalType === 'daily' ? 'Days' : 'Hours'}</strong>
                      </p>
                      <p className="text-xs text-stone-500">
                        Date: {new Date(b.startDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Delivery Location & Equipment Owner Details */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1.5 text-xs text-stone-700">
                    <p className="text-stone-700 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">
                        {b.deliveryAddress?.street}, {b.deliveryAddress?.villageOrDistrict}, {b.deliveryAddress?.state}
                      </span>
                    </p>
                    {b.owner && (
                      <p className="text-stone-700 flex items-center justify-between gap-1.5 pt-1 border-t border-stone-200/60">
                        <span className="flex items-center gap-1.5">
                          <UserIcon className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Owner: {b.owner.name}</span>
                        </span>
                        {b.owner.phone && (
                          <a
                            href={`tel:${b.owner.phone}`}
                            className="text-emerald-700 font-bold hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            <span>Call</span>
                          </a>
                        )}
                      </p>
                    )}
                  </div>
                </div>

                {/* Bottom Total & Actions */}
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-stone-500 block">Total Amount</span>
                    <span className="text-base font-extrabold text-emerald-800 font-heading">
                      ₹{b.totalAmount?.toLocaleString()}
                    </span>
                  </div>

                  {/* Action Buttons (Strictly Farmer Allowed Actions) */}
                  <div className="flex gap-2">
                    {(b.status === 'pending' || b.status === 'confirmed') && (
                      <button
                        onClick={() => handleCancelBooking(b._id)}
                        disabled={updatingId === b._id}
                        className="px-3 py-1.5 border border-rose-300 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold transition"
                      >
                        Cancel Request
                      </button>
                    )}

                    {b.status === 'in_progress' && (
                      <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 animate-spin" /> In Operation
                      </span>
                    )}

                    {b.status === 'completed' && (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}

                    {b.status === 'cancelled' && (
                      <span className="text-xs font-bold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-lg">
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
