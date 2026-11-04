import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { EquipmentCategory } from '../types';
import { X, Tractor, Upload, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AddEquipmentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  language: 'en' | 'hi';
}

export const AddEquipmentModal: React.FC<AddEquipmentModalProps> = ({
  onClose,
  onSuccess,
  language,
}) => {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('Tractor');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [attachedImplement, setAttachedImplement] = useState('Cultivator');
  const [availableAttachments, setAvailableAttachments] = useState<string[]>(['Cultivator']);
  const [customAttachment, setCustomAttachment] = useState('');
  const [brand, setBrand] = useState('Mahindra');
  const [modelYear, setModelYear] = useState<number>(2024);
  const [hp, setHp] = useState<number>(50);
  const [hourlyRate, setHourlyRate] = useState<number>(750);
  const [dailyRate, setDailyRate] = useState<number>(5500);
  const [fuelIncluded, setFuelIncluded] = useState<boolean>(false);
  const [driverIncluded, setDriverIncluded] = useState<boolean>(true);
  const [state, setState] = useState(user?.location?.state || '');
  const [district, setDistrict] = useState(user?.location?.district || '');
  const [villageOrCity, setVillageOrCity] = useState(user?.location?.address || 'Agri Hub / Local Farm');
  const [pincode, setPincode] = useState(user?.location?.pincode || '');
  const [lat, setLat] = useState<number>(28.6139 + (Math.random() - 0.5) * 0.05);
  const [lng, setLng] = useState<number>(77.2090 + (Math.random() - 0.5) * 0.05);
  const [detectingGps, setDetectingGps] = useState(false);
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=800&q=80'
  );
  const [description, setDescription] = useState(
    'Well maintained heavy farm machinery equipped with certified driver, ready for instant nearby dispatch.'
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  const handleGetGps = () => {
    if ('geolocation' in navigator) {
      setDetectingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLat(pos.coords.latitude);
          setLng(pos.coords.longitude);
          setDetectingGps(false);
        },
        () => {
          setDetectingGps(false);
        },
        { timeout: 8000 }
      );
    }
  };

  const toggleAttachment = (att: string) => {
    if (availableAttachments.includes(att)) {
      if (availableAttachments.length > 1) {
        setAvailableAttachments(availableAttachments.filter((a) => a !== att));
      }
    } else {
      setAvailableAttachments([...availableAttachments, att]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !hourlyRate || !dailyRate || !district || !state) {
      setErrorMsg('Please complete all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');

      await api.createEquipment({
        name,
        category,
        customCategoryName: category === 'Other Machinery' ? customCategoryName : '',
        attachedImplement: attachedImplement || 'Cultivator',
        availableAttachments,
        coordinates: {
          lat,
          lng,
        },
        isLiveOnMap: true,
        brand,
        modelYear,
        hp,
        hourlyRate,
        dailyRate,
        fuelIncluded,
        driverIncluded,
        location: {
          state,
          district,
          villageOrCity,
          pincode,
        },
        images: [imageUrl],
        description,
        specs: {
          engineHP: `${hp} HP`,
          cylinderCount: 4,
          fuelType: 'Diesel',
          attachmentIncluded: attachedImplement,
          workingWidth: '7.5 Feet',
        },
      });

      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating equipment listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div className="relative bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-6">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-emerald-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-400 flex items-center justify-center">
              <Tractor className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold font-heading">
                List Your Farm Equipment
              </h2>
              <p className="text-xs text-emerald-200">
                Earn daily by renting tractors, harvesters &amp; machinery to farmers
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-emerald-800 text-emerald-200 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
          {user?.role === 'farmer' ? (
            <div className="text-center py-10 space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
                <Tractor className="w-8 h-8" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Farmer Account Active
                </span>
                <h3 className="text-lg font-bold text-stone-900 mt-2 font-heading">
                  Equipment Listing is for Owners
                </h3>
                <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                  You are currently signed in as a <strong>Farmer</strong>. Farmers can search, rent, and book equipment. If you own tractors or heavy implements to rent out, please register an <strong>Equipment Owner</strong> account.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold rounded-xl transition"
              >
                Return to Farmer Dashboard
              </button>
            </div>
          ) : success ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-stone-900">Equipment Listed Successfully!</h3>
              <p className="text-xs text-stone-600">
                Your machinery is now live in the MERN database and visible to thousands of farmers in your region.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Basic Info */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-heading">
                  1. Machinery Overview
                </h3>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Equipment Title / Model Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Mahindra 575 DI 45HP Tractor or JCB 3DX Plus"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Machinery Category *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as EquipmentCategory)}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-semibold focus:ring-2 focus:ring-emerald-600"
                    >
                      <option value="Tractor">1. Tractor (ट्रैक्टर)</option>
                      <option value="Loader">2. Loader (लोडर / जेसीबी)</option>
                      <option value="Combine Harvester">3. Combine Harvester (कंबाइन हार्वेस्टर)</option>
                      <option value="Other Machinery">4. Other Machinery (अन्य मशीनरी)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Brand / Make</label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Mahindra, John Deere, JCB, Preet"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">Horsepower (HP)</label>
                    <input
                      type="number"
                      value={hp}
                      onChange={(e) => setHp(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Custom Machinery Name if "Other Machinery" selected */}
                {category === 'Other Machinery' && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1.5 animate-fade-in">
                    <label className="block text-xs font-bold text-amber-900">
                      Specific Machinery Type / Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={customCategoryName}
                      onChange={(e) => setCustomCategoryName(e.target.value)}
                      placeholder="e.g. Laser Land Leveler, Sugarcane Harvester, Power Weeder, Boom Sprayer"
                      className="w-full px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500"
                    />
                    <p className="text-[11px] text-amber-700">
                      Farmers can search and view this specific machinery live on the radar map.
                    </p>
                  </div>
                )}

                {/* Attached Implements Section */}
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-emerald-950">
                      Primary Attached Implement *
                    </label>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Ready to Work
                    </span>
                  </div>

                  <select
                    value={attachedImplement}
                    onChange={(e) => {
                      setAttachedImplement(e.target.value);
                      if (!availableAttachments.includes(e.target.value)) {
                        setAvailableAttachments([...availableAttachments, e.target.value]);
                      }
                    }}
                    className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-lg text-xs font-semibold text-stone-800 focus:ring-2 focus:ring-emerald-600"
                  >
                    <option value="Cultivator">Cultivator (कल्टीवेटर - 9/11 Tyne)</option>
                    <option value="Rotavator">Rotavator (रोटावेटर - 6ft/7ft/8ft)</option>
                    <option value="Disc Harrow">Disc Harrow (डिस्क हैरो)</option>
                    <option value="MB Plough">MB Mould Board Plough (पलाऊ)</option>
                    <option value="Seed Drill">Seed Drill &amp; Planter (सीड ड्रिल)</option>
                    <option value="Trolley / Trailer">Heavy Hydraulic Trolley (ट्रॉली)</option>
                    <option value="Straw Reaper">Straw Reaper &amp; Chopper (रीपर)</option>
                    <option value="Front Bucket Loader">Front Bucket Loader (लोडर बकेट)</option>
                    <option value="Laser Land Leveler">Laser Land Leveler (लेजर लेवलर)</option>
                    <option value="Post Hole Digger">Post Hole Digger (गड्ढा डिगर)</option>
                    <option value="None / Bare Machine">None / Bare Machine</option>
                  </select>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-600 mb-1">
                      Compatible / Included Implements (select all available):
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        'Cultivator',
                        'Rotavator',
                        'Disc Harrow',
                        'MB Plough',
                        'Seed Drill',
                        'Trolley / Trailer',
                        'Straw Reaper',
                        'Front Bucket Loader',
                        'Laser Land Leveler',
                      ].map((att) => {
                        const isChecked = availableAttachments.includes(att);
                        return (
                          <button
                            type="button"
                            key={att}
                            onClick={() => toggleAttachment(att)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                              isChecked
                                ? 'bg-emerald-700 text-white shadow-xs'
                                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100'
                            }`}
                          >
                            {isChecked ? '✓ ' : '+ '}
                            {att}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing & Driver */}
              <div className="space-y-3 pt-3 border-t border-stone-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-heading">
                  2. Rental Rates &amp; Policy
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Hourly Rate (₹/hour) *
                    </label>
                    <input
                      type="number"
                      required
                      min={50}
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm font-bold text-emerald-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Daily Rate (₹/day) *
                    </label>
                    <input
                      type="number"
                      required
                      min={300}
                      value={dailyRate}
                      onChange={(e) => setDailyRate(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-sm font-bold text-emerald-800"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={driverIncluded}
                      onChange={(e) => setDriverIncluded(e.target.checked)}
                      className="w-4 h-4 text-emerald-700 rounded"
                    />
                    <span>Driver / Operator Provided</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-medium text-stone-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fuelIncluded}
                      onChange={(e) => setFuelIncluded(e.target.checked)}
                      className="w-4 h-4 text-emerald-700 rounded"
                    />
                    <span>Fuel (Diesel) Included in rate</span>
                  </label>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-3 pt-3 border-t border-stone-200">
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-500 font-heading">
                  3. Machinery Location
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">State / Region *</label>
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. State or Region"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">District / Nearby Area *</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="e.g. City or Area"
                      className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                    />
                  </div>
                </div>

                {/* Live GPS Radar Pin */}
                <div className="p-3 bg-stone-100 rounded-xl border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="text-xs text-stone-700">
                    <span className="font-bold text-stone-900 block flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping inline-block" />
                      Live Map Radar Pin:
                    </span>
                    <span className="text-[11px] text-stone-500 font-mono">
                      Lat: {lat.toFixed(4)}, Lng: {lng.toFixed(4)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleGetGps}
                    disabled={detectingGps}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition shrink-0"
                  >
                    {detectingGps ? 'Detecting Location...' : '📍 Use My Exact GPS Coordinates'}
                  </button>
                </div>
              </div>

              {/* Image URL & Description */}
              <div className="space-y-3 pt-3 border-t border-stone-200">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Machinery Image URL
                  </label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Detailed Notes / Description
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 border-t border-stone-200 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 border border-stone-300 text-stone-700 rounded-xl text-sm font-bold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving to Database...' : 'Publish Equipment Listing'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
