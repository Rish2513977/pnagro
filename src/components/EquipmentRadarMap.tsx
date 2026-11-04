import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Equipment } from '../types';
import {
  MapPin,
  Crosshair,
  ArrowRight,
  Search,
  X,
  Tractor,
} from 'lucide-react';

interface EquipmentRadarMapProps {
  equipmentList: Equipment[];
  selectedCategory?: string;
  onSelectCategory?: (cat: any) => void;
  selectedAttachment?: string;
  onSelectAttachment?: (att: string) => void;
  onSelectEquipment: (eq: Equipment) => void;
  onBookNow: (eq: Equipment) => void;
  language: 'en' | 'hi';
}

export const EquipmentRadarMap: React.FC<EquipmentRadarMapProps> = ({
  equipmentList,
  onSelectEquipment,
  onBookNow,
  language,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number }>({
    lat: 28.6139,
    lng: 77.2090,
  });
  const [selectedPin, setSelectedPin] = useState<Equipment | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Filter equipment based on search query
  const filteredEquipment = equipmentList.filter((eq) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      eq.name.toLowerCase().includes(q) ||
      eq.category.toLowerCase().includes(q) ||
      eq.brand?.toLowerCase().includes(q) ||
      eq.location.district.toLowerCase().includes(q) ||
      eq.location.state.toLowerCase().includes(q) ||
      eq.attachedImplement?.toLowerCase().includes(q) ||
      eq.customCategoryName?.toLowerCase().includes(q)
    );
  });

  // Calculate distance in KM using Haversine formula
  const getDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(1);
  };

  // Locate User via HTML5 Geolocation
  const handleLocateMe = () => {
    if ('geolocation' in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(newPos);
          if (mapInstanceRef.current) {
            mapInstanceRef.current.flyTo([newPos.lat, newPos.lng], 12, { animate: true });
          }
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
        },
        { timeout: 8000 }
      );
    }
  };

  // Initialize simple Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 10,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    // Update user marker
    if (markersLayerRef.current && mapInstanceRef.current) {
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
      }

      const userIcon = L.divIcon({
        className: 'custom-user-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg"></div>
            <div class="absolute w-8 h-8 bg-blue-400/30 rounded-full animate-ping"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
      }).addTo(mapInstanceRef.current);
    }

    return () => {
      // Keep instance intact across lightweight re-renders
    };
  }, []);

  // Update Equipment Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredEquipment.forEach((eq) => {
      const lat = eq.coordinates?.lat || userLocation.lat + (Math.random() - 0.5) * 0.08;
      const lng = eq.coordinates?.lng || userLocation.lng + (Math.random() - 0.5) * 0.08;

      const isSelected = selectedPin?._id === eq._id;

      let badgeBg = '#059669'; // Emerald
      if (eq.category === 'Loader') badgeBg = '#d97706'; // Amber
      else if (eq.category === 'Combine Harvester') badgeBg = '#0891b2'; // Cyan
      else if (eq.category === 'Other Machinery') badgeBg = '#4f46e5'; // Indigo

      const customIcon = L.divIcon({
        className: 'custom-eq-marker',
        html: `
          <div style="transform: ${isSelected ? 'scale(1.15)' : 'scale(1)'}; transition: transform 0.2s;" class="cursor-pointer">
            <div style="background-color: ${badgeBg};" class="text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-lg border-2 border-white flex items-center gap-1.5 whitespace-nowrap">
              <span>🚜</span>
              <span>₹${eq.hourlyRate}/h</span>
            </div>
            <div class="w-2 h-2 bg-stone-900 rotate-45 mx-auto -mt-1 border-r border-b border-white"></div>
          </div>
        `,
        iconSize: [95, 34],
        iconAnchor: [47, 34],
      });

      const marker = L.marker([lat, lng], { icon: customIcon });
      marker.on('click', () => {
        setSelectedPin(eq);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([lat, lng], { animate: true });
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredEquipment, selectedPin, userLocation]);

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
      {/* Simple Map Header Bar */}
      <div className="p-4 bg-stone-900 text-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold font-heading text-white">
              {language === 'en' ? 'Available Equipment Map' : 'उपलब्ध उपकरणों का मैप'}
            </h3>
            <p className="text-[11px] text-stone-400">
              {filteredEquipment.length} {language === 'en' ? 'machines available nearby' : 'मशीनें नजदीकी क्षेत्र में उपलब्ध'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={language === 'en' ? 'Filter map equipment...' : 'उपकरण खोजें...'}
              className="w-full pl-8 pr-7 py-1.5 bg-stone-800 border border-stone-700 text-white rounded-xl text-xs placeholder:text-stone-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-stone-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Locate Me Button */}
          <button
            onClick={handleLocateMe}
            disabled={isLocating}
            className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded-xl flex items-center gap-1.5 border border-stone-700 transition"
            title="My GPS Location"
          >
            <Crosshair className={`w-3.5 h-3.5 text-emerald-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{isLocating ? 'Locating...' : 'My Location'}</span>
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative h-[420px] sm:h-[480px] bg-stone-100">
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Selected Equipment Popup Card */}
        {selectedPin && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-20 bg-stone-900/95 backdrop-blur-md rounded-2xl border border-emerald-500/40 p-4 shadow-2xl text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <img
                  src={
                    selectedPin.images?.[0] ||
                    'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80'
                  }
                  alt={selectedPin.name || 'Machinery'}
                  className="w-16 h-16 rounded-xl object-cover border border-stone-700 shrink-0"
                />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-900 text-emerald-200">
                      {selectedPin.category === 'Other Machinery' && selectedPin.customCategoryName
                        ? selectedPin.customCategoryName
                        : selectedPin.category}
                    </span>
                    {selectedPin.attachedImplement && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-400 text-stone-950">
                        + {selectedPin.attachedImplement}
                      </span>
                    )}
                  </div>

                  <h4 className="font-bold text-sm text-white mt-1 line-clamp-1 font-heading">
                    {selectedPin.name}
                  </h4>

                  <p className="text-[11px] text-stone-300 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>
                      {selectedPin.location.district}, {selectedPin.location.state}
                    </span>
                    <span className="text-emerald-400 font-bold ml-1">
                      • {getDistanceKm(
                        userLocation.lat,
                        userLocation.lng,
                        selectedPin.coordinates?.lat || userLocation.lat + 0.02,
                        selectedPin.coordinates?.lng || userLocation.lng + 0.02
                      )} km
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedPin(null)}
                className="text-stone-400 hover:text-white text-sm font-bold p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Price & Action */}
            <div className="mt-3 pt-3 border-t border-stone-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-base font-black text-amber-400 font-heading">
                  ₹{selectedPin.hourlyRate}
                </span>
                <span className="text-xs text-stone-400">/hr</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onSelectEquipment(selectedPin)}
                  className="py-1.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold transition"
                >
                  Details
                </button>
                <button
                  onClick={() => onBookNow(selectedPin)}
                  className="py-1.5 px-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-md"
                >
                  <span>Book</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
