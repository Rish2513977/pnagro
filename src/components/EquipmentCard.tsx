import React from 'react';
import { Equipment } from '../types';
import {
  MapPin,
  Star,
  ShieldCheck,
  Zap,
  Gauge,
  UserCheck,
  ArrowRight,
  Clock,
} from 'lucide-react';

interface EquipmentCardProps {
  item?: Equipment;
  equipment?: Equipment;
  onSelect: (item: Equipment) => void;
  onBookNow: (item: Equipment) => void;
  language?: 'en' | 'hi';
}

export const EquipmentCard: React.FC<EquipmentCardProps> = ({
  item: propItem,
  equipment: propEquipment,
  onSelect,
  onBookNow,
  language = 'en',
}) => {
  const item = propItem || propEquipment;
  if (!item) return null;

  const fallbackImage =
    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80';
  const displayImage = item.images?.[0] || fallbackImage;

  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col group">
      {/* Image Container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-stone-100 cursor-pointer" onClick={() => onSelect(item)}>
        <img
          src={displayImage}
          alt={item.name || 'Machinery'}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-800 text-white shadow-xs">
            {item.category === 'Other Machinery' && item.customCategoryName
              ? item.customCategoryName
              : item.category || 'Machinery'}
          </span>
          {item.attachedImplement && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-900/80 text-amber-300 backdrop-blur-xs shadow-xs">
              + {item.attachedImplement}
            </span>
          )}
          {item.featured && (
            <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-amber-400 text-stone-950 shadow-xs flex items-center gap-1">
              <Zap className="w-3 h-3 fill-stone-950" /> Featured
            </span>
          )}
        </div>

        {/* Owner Verified Status & Live Radar */}
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
          <div className="bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] font-bold text-emerald-800 flex items-center gap-1 shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Owner</span>
          </div>
          {item.isLiveOnMap && (
            <div className="bg-emerald-950/85 backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-bold text-emerald-300 flex items-center gap-1 shadow-xs border border-emerald-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Live on Radar</span>
            </div>
          )}
        </div>

        {/* Bottom Price in Image */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
          <div>
            <span className="text-xl font-extrabold tracking-tight font-heading">
              ₹{item.hourlyRate || 0}
            </span>
            <span className="text-xs text-stone-200"> / hour</span>
          </div>
          <span className="text-xs bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded text-amber-300 font-semibold">
            ₹{item.dailyRate || 0} / day
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating and Reviews */}
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1 text-amber-500 font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{item.rating || 4.8}</span>
              <span className="text-stone-700 font-normal">
                ({item.totalReviews || 12} reviews)
              </span>
            </div>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                item.status === 'available'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-800'
              }`}
            >
              {item.status || 'available'}
            </span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(item)}
            className="font-bold text-base text-stone-900 line-clamp-1 hover:text-emerald-700 cursor-pointer transition font-heading"
          >
            {item.name}
          </h3>

          {/* Location */}
          <p className="text-xs text-stone-700 flex items-center gap-1 mt-1 font-medium">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {item.location?.district || 'Punjab'}, {item.location?.state || 'India'}
            </span>
          </p>

          {/* Specs Highlights */}
          <div className="grid grid-cols-2 gap-1.5 my-3 py-2 px-2.5 bg-stone-50 rounded-xl border border-stone-100 text-xs">
            <div className="flex items-center gap-1 text-stone-700">
              <Gauge className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold">{item.hp || 45} HP Engine</span>
            </div>
            <div className="flex items-center gap-1 text-stone-700">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{item.driverIncluded ? 'Driver Included' : 'No Driver'}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2 border-t border-stone-100 flex items-center gap-2">
          <button
            onClick={() => onSelect(item)}
            className="flex-1 py-2 px-3 border border-stone-300 hover:border-emerald-600 text-stone-700 hover:text-emerald-700 rounded-xl text-xs font-bold transition"
          >
            {language === 'en' ? 'View Details' : 'विवरण देखें'}
          </button>
          <button
            onClick={() => onBookNow(item)}
            className="flex-1 py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-xs hover:shadow"
          >
            <span>{language === 'en' ? 'Book Now' : 'बुक करें'}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
