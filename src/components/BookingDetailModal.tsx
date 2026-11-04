import React from 'react';
import { Booking } from '../types';
import {
  X,
  Tractor,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User as UserIcon,
  CheckCircle2,
  AlertCircle,
  IndianRupee,
  ShieldCheck,
  FileText,
  BadgeCheck,
  Layers,
  Sparkles,
} from 'lucide-react';

interface BookingDetailModalProps {
  booking: Booking | null;
  onClose: () => void;
  onUpdateStatus?: (bookingId: string, status: string) => void;
}

export const BookingDetailModal: React.FC<BookingDetailModalProps> = ({
  booking,
  onClose,
  onUpdateStatus,
}) => {
  if (!booking) return null;

  const isCompleted = booking.status === 'completed';
  const isInProgress = booking.status === 'in_progress';
  const isConfirmed = booking.status === 'confirmed';
  const isCancelled = booking.status === 'cancelled';

  // Calculate fare breakdown
  const unitRate = booking.unitRate || booking.equipment?.hourlyRate || 850;
  const duration = booking.duration || 4;
  const durationUnit = booking.rentalType === 'daily' ? 'Days' : 'Hours';
  const baseFare = unitRate * duration;
  const driverCharge = booking.driverRequested ? (booking.rentalType === 'daily' ? 500 * duration : 100 * duration) : 0;
  const totalCalculated = booking.totalAmount || (baseFare + driverCharge);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-stone-200 my-6">
        {/* Header */}
        <div className="p-5 border-b border-stone-800 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-amber-400 flex items-center justify-center shadow-xs">
              <Tractor className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-heading">
                  Booking #{booking._id.slice(-6).toUpperCase()}
                </h2>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                    isCompleted
                      ? 'bg-blue-900 text-blue-200 border border-blue-700'
                      : isInProgress
                      ? 'bg-amber-900 text-amber-200 border border-amber-700'
                      : isConfirmed
                      ? 'bg-emerald-900 text-emerald-200 border border-emerald-700'
                      : 'bg-rose-900 text-rose-200 border border-rose-700'
                  }`}
                >
                  {booking.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                Created on {new Date(booking.createdAt || Date.now()).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
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

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Work Completion Status Banner */}
          <div
            className={`p-4 rounded-2xl border flex items-start gap-3.5 ${
              isCompleted
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
                : isInProgress
                ? 'bg-amber-50/80 border-amber-200 text-amber-900'
                : isConfirmed
                ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                : 'bg-rose-50/80 border-rose-200 text-rose-900'
            }`}
          >
            {isCompleted ? (
              <BadgeCheck className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
            ) : isInProgress ? (
              <Clock className="w-6 h-6 text-amber-700 shrink-0 mt-0.5 animate-pulse" />
            ) : isConfirmed ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-700 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-6 h-6 text-rose-700 shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              <h4 className="text-sm font-bold">
                {isCompleted
                  ? 'Work Completed Successfully'
                  : isInProgress
                  ? 'Machinery In Operation (Work in Progress)'
                  : isConfirmed
                  ? 'Booking Confirmed & Dispatched'
                  : 'Booking Cancelled'}
              </h4>
              <p className="text-xs mt-0.5 text-stone-600">
                {isCompleted
                  ? `Agricultural field operation finished on ${new Date(booking.completedAt || booking.endDate || Date.now()).toLocaleDateString('en-IN')}. Receipt is finalized.`
                  : isInProgress
                  ? 'Equipment is currently on field. Start OTP verified with the operator.'
                  : isConfirmed
                  ? 'Equipment scheduled for field work on the requested date. Operator will contact you.'
                  : 'This booking was cancelled. No charges applied.'}
              </p>
            </div>
          </div>

          {/* Machinery & Equipment Details */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <img
              src={
                booking.equipment?.images?.[0] ||
                'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80'
              }
              alt={booking.equipment?.name}
              className="w-full sm:w-32 h-28 rounded-xl object-cover border border-stone-300 bg-white"
            />
            <div className="flex-1 min-w-0 space-y-1">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                {booking.equipment?.category || 'Farm Equipment'}
              </span>
              <h3 className="text-base font-bold text-stone-900">
                {booking.equipment?.name || 'Verified Agro Tractor'}
              </h3>
              <p className="text-xs text-stone-600">
                Brand: <strong className="text-stone-800">{booking.equipment?.brand || 'Mahindra / Swaraj'}</strong> • Model: {booking.equipment?.modelYear || '2023'} • Power: {booking.equipment?.hp || '50'} HP
              </p>
              {booking.equipment?.attachedImplement && (
                <p className="text-xs text-stone-600 flex items-center gap-1.5 pt-1">
                  <Layers className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Attachment: <strong className="text-emerald-900">{booking.equipment?.attachedImplement}</strong></span>
                </p>
              )}
            </div>
          </div>

          {/* Work & Booking Schedule Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Work & Schedule */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2.5">
              <h4 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-700" />
                <span>Work Schedule</span>
              </h4>

              <div className="text-xs space-y-1.5 text-stone-600">
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <strong className="text-stone-900">
                    {new Date(booking.startDate).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Work Duration:</span>
                  <strong className="text-stone-900">
                    {duration} {durationUnit}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span>Driver / Operator:</span>
                  <strong className="text-emerald-800">
                    {booking.driverRequested ? 'Provided by Owner' : 'Self-Operated'}
                  </strong>
                </div>
                {booking.startOtp && (
                  <div className="flex justify-between pt-1 border-t border-stone-100">
                    <span>Work Start OTP:</span>
                    <span className="font-mono font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-xs">
                      {booking.startOtp}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Farm Delivery Location */}
            <div className="p-4 bg-white rounded-2xl border border-stone-200 space-y-2.5">
              <h4 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                <span>Farm Location</span>
              </h4>

              <div className="text-xs space-y-1 text-stone-600">
                <p className="font-semibold text-stone-900">
                  {booking.deliveryAddress?.street || 'Agricultural Land'}
                </p>
                <p>
                  {booking.deliveryAddress?.villageOrDistrict || 'Ludhiana'}, {booking.deliveryAddress?.state || 'Punjab'}
                </p>
                <p className="text-stone-500">
                  PIN: {booking.deliveryAddress?.pincode || '141001'}
                </p>
                <div className="pt-1 text-stone-700">
                  <span>Contact: <strong>{booking.farmerName || 'Farmer'}</strong> ({booking.contactNumber || '+91 98765 43210'})</span>
                </div>
              </div>
            </div>
          </div>

          {/* Machinery Owner & Operator Contacts */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
            <h4 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-emerald-700" />
              <span>Owner & Operator Contact</span>
            </h4>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div>
                <p className="font-bold text-stone-900 text-sm">
                  {booking.owner?.name || 'Machinery Partner'}
                </p>
                <p className="text-stone-500">
                  {booking.owner?.email ? `${booking.owner.email} • ` : ''}Verified Machinery Partner
                </p>
              </div>
              {booking.owner?.phone && (
                <a
                  href={`tel:${booking.owner.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-800 text-white rounded-xl font-bold hover:bg-emerald-900 transition self-start sm:self-auto text-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Owner ({booking.owner.phone})</span>
                </a>
              )}
            </div>
          </div>

          {/* Fare & Price Breakdown (Fair and Work Details) */}
          <div className="p-5 bg-emerald-950 text-white rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-emerald-800/80 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5" />
                <span>Rental Fare & Work Cost Summary</span>
              </h4>
              <span className="text-[11px] bg-emerald-800/80 text-emerald-200 px-2 py-0.5 rounded font-mono">
                {booking.paymentStatus === 'paid' ? 'Paid Online' : 'Cash on Delivery (COD)'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-emerald-100">
              <div className="flex justify-between">
                <span>
                  Base Machine Rate ({unitRate} × {duration} {durationUnit}):
                </span>
                <span className="font-semibold text-white">₹{baseFare.toLocaleString('en-IN')}</span>
              </div>

              {booking.driverRequested && (
                <div className="flex justify-between">
                  <span>Professional Operator Charge:</span>
                  <span className="font-semibold text-white">₹{driverCharge.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Fuel & Maintenance:</span>
                <span className="font-semibold text-emerald-300">Included</span>
              </div>

              <div className="flex justify-between pt-2 border-t border-emerald-800/80 text-sm">
                <span className="font-bold text-white">Total Rental Fare:</span>
                <span className="font-black text-amber-400 text-base font-heading">
                  ₹{totalCalculated.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Notes if any */}
          {booking.notes && (
            <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-600">
              <span className="font-bold text-stone-800 block mb-0.5">Special Work Instructions:</span>
              <p>{booking.notes}</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-xl text-xs font-bold transition"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {isConfirmed && onUpdateStatus && (
              <button
                type="button"
                onClick={() => {
                  onUpdateStatus(booking._id, 'cancelled');
                  onClose();
                }}
                className="px-3 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold transition"
              >
                Cancel Booking
              </button>
            )}

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print Receipt</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
