import React, { useState, useEffect } from 'react';
import { Equipment, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  X,
  MapPin,
  Star,
  ShieldCheck,
  Phone,
  UserCheck,
  Calendar,
  Clock,
  Gauge,
  CheckCircle2,
  AlertCircle,
  Truck,
  MessageSquare,
  Send,
} from 'lucide-react';

interface EquipmentDetailModalProps {
  equipment: Equipment | null;
  onClose: () => void;
  onBookingSuccess: () => void;
  openAuthModal: () => void;
  language: 'en' | 'hi';
}

export const EquipmentDetailModal: React.FC<EquipmentDetailModalProps> = ({
  equipment,
  onClose,
  onBookingSuccess,
  openAuthModal,
  language,
}) => {
  const { user } = useAuth();

  // Booking Form State
  const [rentalType, setRentalType] = useState<'hourly' | 'daily'>('hourly');
  const [duration, setDuration] = useState<number>(4);
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [driverRequested, setDriverRequested] = useState<boolean>(true);
  const [farmerName, setFarmerName] = useState(user?.name || '');
  const [contactNumber, setContactNumber] = useState(user?.phone || '+91 ');
  const [streetAddress, setStreetAddress] = useState(user?.location?.address || '');
  const [district, setDistrict] = useState(user?.location?.district || equipment?.location.district || '');
  const [state, setState] = useState(user?.location?.state || equipment?.location.state || '');
  const [pincode, setPincode] = useState(user?.location?.pincode || '141001');
  const [notes, setNotes] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bookingCompleted, setBookingCompleted] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (equipment) {
      api.getReviews(equipment._id)
        .then((res) => setReviews(res.data))
        .catch(() => setReviews([]));
    }
  }, [equipment]);

  if (!equipment) return null;

  // Calculation
  const unitRate = rentalType === 'daily' ? equipment.dailyRate : equipment.hourlyRate;
  const basePrice = unitRate * duration;
  const driverCost = driverRequested && !equipment.driverIncluded ? (rentalType === 'daily' ? 500 * duration : 100 * duration) : 0;
  const serviceFee = Math.round(basePrice * 0.03);
  const grandTotal = basePrice + driverCost + serviceFee;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }

    if (!farmerName || !contactNumber || !streetAddress || !district || !state) {
      setErrorMessage('Please fill in all mandatory delivery & contact details.');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      await api.createBooking({
        equipmentId: equipment._id,
        startDate: new Date(startDate).toISOString(),
        rentalType,
        duration,
        driverRequested,
        deliveryAddress: {
          street: streetAddress,
          villageOrDistrict: district,
          state,
          pincode,
        },
        contactNumber,
        farmerName,
        notes,
      });

      setBookingCompleted(true);
      setTimeout(() => {
        onBookingSuccess();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal();
      return;
    }
    if (!newComment.trim()) return;

    try {
      setSubmittingReview(true);
      const res = await api.addReview({
        equipmentId: equipment._id,
        rating: newRating,
        comment: newComment,
      });
      setReviews([res.data, ...reviews]);
      setNewComment('');
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-8 max-h-[92vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {equipment.category === 'Other Machinery' && equipment.customCategoryName
                  ? equipment.customCategoryName
                  : equipment.category}
              </span>
              {equipment.attachedImplement && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                  Attached: {equipment.attachedImplement}
                </span>
              )}
              {equipment.isLiveOnMap && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-900 text-emerald-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                  Live on GPS Radar
                </span>
              )}
              <span className="text-xs text-stone-500 font-medium">
                {equipment.brand} • {equipment.modelYear}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-stone-900 mt-1 font-heading">
              {equipment.name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 text-stone-500 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Main Grid: Visuals & Booking */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Col: Photos & Specs */}
            <div className="lg:col-span-7 space-y-4">
              {/* Main Photo */}
              <div className="h-64 sm:h-72 rounded-xl overflow-hidden border border-stone-200 relative bg-stone-100">
                <img
                  src={
                    equipment.images?.[0] ||
                    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={equipment.name || 'Machinery'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur-md px-3 py-1.5 rounded-lg text-white text-xs flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>
                    {equipment.location?.villageOrCity ? `${equipment.location.villageOrCity}, ` : ''}
                    {equipment.location?.district || 'Punjab'}, {equipment.location?.state || 'India'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-bold text-stone-900 font-heading mb-1">
                  Equipment Description
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed">
                  {equipment.description}
                </p>
              </div>

              {/* Tech Specs */}
              <div className="bg-stone-50 rounded-xl p-4 border border-stone-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 mb-3 font-heading">
                  Technical Specifications
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <span className="text-stone-500">Power Rating</span>
                    <p className="font-bold text-stone-900 text-sm mt-0.5">{equipment.hp} HP</p>
                  </div>
                  <div>
                    <span className="text-stone-500">Fuel Type</span>
                    <p className="font-bold text-stone-900 text-sm mt-0.5">
                      {equipment.specs?.fuelType || 'Diesel'}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-500">Working Width</span>
                    <p className="font-bold text-stone-900 text-sm mt-0.5">
                      {equipment.specs?.workingWidth || '7 Feet'}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-500">Attachment</span>
                    <p className="font-bold text-stone-900 text-sm mt-0.5 truncate">
                      {equipment.specs?.attachmentIncluded || 'Standard Hitch'}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-500">Fuel Policy</span>
                    <p className="font-bold text-stone-900 text-sm mt-0.5">
                      {equipment.fuelIncluded ? 'Fuel Included' : 'By Renter'}
                    </p>
                  </div>
                  <div>
                    <span className="text-stone-500">Driver Policy</span>
                    <p className="font-bold text-stone-900 text-sm mt-0.5 text-emerald-700">
                      {equipment.driverIncluded ? 'Free Certified Driver' : 'Optional Driver'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Owner Profile Card */}
              <div className="flex items-center gap-3 p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl">
                <img
                  src={equipment.owner?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'}
                  alt={equipment.owner?.name}
                  className="w-12 h-12 rounded-full object-cover border border-emerald-600/30"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-sm text-stone-900">
                      {equipment.owner?.name || 'Verified Equipment Owner'}
                    </h4>
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                  </div>
                  <p className="text-xs text-stone-600">
                    Location: {equipment.location.district}, {equipment.location.state}
                  </p>
                </div>
                <div className="text-right">
                  <span className="inline-block text-[10px] font-bold uppercase bg-emerald-700 text-white px-2 py-0.5 rounded">
                    Verified Host
                  </span>
                </div>
              </div>
            </div>

            {/* Right Col: Instant Rental Calculation & Booking Form or Role Info */}
            <div className="lg:col-span-5 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
              {user?.role === 'owner' ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
                    <Tractor className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Equipment Owner Mode
                    </span>
                    <h3 className="text-base font-bold text-stone-900 mt-2 font-heading">
                      Owner Catalog Preview
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      You are signed in as an Equipment Owner. Booking and renting machinery is reserved for Farmers. As an owner, you can manage your fleet and accept inbound requests from your Owner Dashboard.
                    </p>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-left space-y-1 text-stone-600">
                    <p><strong>Hourly Rate:</strong> ₹{equipment.hourlyRate}/hr</p>
                    <p><strong>Daily Rate:</strong> ₹{equipment.dailyRate}/day</p>
                    <p><strong>Status:</strong> <span className="capitalize font-bold text-emerald-700">{equipment.status}</span></p>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition"
                  >
                    Close Preview
                  </button>
                </div>
              ) : user?.role === 'admin' ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 bg-emerald-50 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Administrator Portal
                    </span>
                    <h3 className="text-base font-bold text-stone-900 mt-2 font-heading">
                      Platform Machinery Record
                    </h3>
                    <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                      This listing is live in the PNagro central database. You can moderate this equipment or manage associated bookings from the Admin Dashboard.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition"
                  >
                    Back to Admin Fleet
                  </button>
                </div>
              ) : bookingCompleted ? (
                <div className="text-center py-10 space-y-3">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-stone-900">Booking Confirmed!</h3>
                  <p className="text-xs text-stone-600">
                    Your rental request has been saved in MongoDB. The owner will dispatch the equipment to your delivery address on time.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div className="border-b border-stone-100 pb-3">
                    <h3 className="text-base font-bold text-stone-900 font-heading">
                      Book This Equipment
                    </h3>
                    <p className="text-xs text-stone-500">
                      Select duration and enter delivery location
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  {/* Hourly vs Daily Toggle */}
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Rental Plan
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setRentalType('hourly');
                          setDuration(4);
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                          rentalType === 'hourly'
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        Hourly (₹{equipment.hourlyRate}/hr)
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRentalType('daily');
                          setDuration(1);
                        }}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition ${
                          rentalType === 'daily'
                            ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        Daily (₹{equipment.dailyRate}/day)
                      </button>
                    </div>
                  </div>

                  {/* Duration Slider / Select */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        {rentalType === 'hourly' ? 'Duration (Hours)' : 'Duration (Days)'}
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={rentalType === 'hourly' ? 24 : 30}
                        value={duration}
                        onChange={(e) => setDuration(Math.max(1, Number(e.target.value)))}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm font-semibold text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm font-medium text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Farmer Details */}
                  <div className="space-y-2 pt-1 border-t border-stone-100">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                          Farmer Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={farmerName}
                          onChange={(e) => setFarmerName(e.target.value)}
                          placeholder="Your full name"
                          className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                          Contact Phone *
                        </label>
                        <input
                          type="text"
                          required
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                        Farm/Delivery Address *
                      </label>
                      <input
                        type="text"
                        required
                        value={streetAddress}
                        onChange={(e) => setStreetAddress(e.target.value)}
                        placeholder="Nearby Area / Farm plot location / Landmark"
                        className="w-full px-2.5 py-1.5 text-xs bg-stone-50 border border-stone-300 rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Price Calculation Box */}
                  <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5 text-xs">
                    <div className="flex justify-between text-stone-600">
                      <span>Base Rental ({duration} {rentalType === 'hourly' ? 'hrs' : 'days'})</span>
                      <span className="font-semibold text-stone-900">₹{basePrice.toLocaleString()}</span>
                    </div>
                    {driverCost > 0 && (
                      <div className="flex justify-between text-stone-600">
                        <span>Operator / Driver Fee</span>
                        <span className="font-semibold text-stone-900">₹{driverCost.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-600">
                      <span>Platform Safety &amp; Insurance</span>
                      <span className="font-semibold text-stone-900">₹{serviceFee.toLocaleString()}</span>
                    </div>
                    <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-sm font-bold text-stone-900">
                      <span>Total Estimated Cost</span>
                      <span className="text-emerald-700 font-extrabold text-base">
                        ₹{grandTotal.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-stone-500 pt-0.5">
                      • Cash on delivery / UPI after inspection on farm.
                    </p>
                  </div>

                  {/* Action Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white rounded-xl font-bold text-sm shadow-md transition disabled:opacity-50"
                  >
                    {isSubmitting
                      ? 'Confirming Rental Request...'
                      : user
                      ? `Confirm & Book Machinery (₹${grandTotal.toLocaleString()})`
                      : 'Login & Book Equipment'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* User Reviews Section */}
          <div className="pt-6 border-t border-stone-200">
            <h3 className="text-lg font-bold text-stone-900 font-heading mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-700" />
              <span>Farmer Reviews ({reviews.length})</span>
            </h3>

            {/* Add Review Form */}
            {user && (
              <form onSubmit={handleAddReview} className="mb-6 p-4 bg-stone-50 rounded-xl border border-stone-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                  Share Your Experience
                </h4>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs text-stone-600">Your Rating:</span>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setNewRating(star)}
                      className={`p-1 ${
                        newRating >= star ? 'text-amber-400' : 'text-stone-300'
                      }`}
                    >
                      <Star className="w-4 h-4 fill-current" />
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Write a feedback about machine condition, driver, efficiency..."
                    className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded-lg text-xs"
                  />
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-emerald-800 disabled:opacity-50"
                  >
                    <Send className="w-3 h-3" />
                    <span>Post</span>
                  </button>
                </div>
              </form>
            )}

            {/* Review List */}
            <div className="space-y-3">
              {reviews.length === 0 ? (
                <p className="text-xs text-stone-500 italic">
                  No reviews yet. Be the first farmer to review this machine!
                </p>
              ) : (
                reviews.map((rev) => (
                  <div
                    key={rev._id}
                    className="p-3.5 bg-white border border-stone-200 rounded-xl shadow-2xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-stone-900">{rev.userName}</span>
                        <span className="text-[10px] text-stone-500">• {rev.userLocation}</span>
                      </div>
                      <div className="flex text-amber-400">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-stone-700">{rev.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
