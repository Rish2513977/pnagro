import React from 'react';
import {
  Tractor,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Clock,
  HeartHandshake,
  CheckCircle2,
} from 'lucide-react';

interface FooterProps {
  setCurrentView: (view: string) => void;
  setCategoryFilter: (category: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  setCurrentView,
  setCategoryFilter,
}) => {
  return (
    <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-amber-400 flex items-center justify-center">
                <Tractor className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold text-white font-heading">
                PN<span className="text-emerald-400">agro</span>
              </span>
            </div>
            <p className="text-sm text-stone-400 leading-relaxed max-w-sm">
              India's premier MERN-stack farm & heavy machinery rental platform.
              Empowering farmers with verified tractors, combine harvesters, JCBs, and implements at transparent hourly rates.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 text-xs bg-stone-800 text-emerald-400 px-3 py-1.5 rounded-full border border-stone-700 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% Verified Owners
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs bg-stone-800 text-amber-400 px-3 py-1.5 rounded-full border border-stone-700 font-medium">
                <Clock className="w-3.5 h-3.5" /> Instant Booking
              </span>
            </div>
          </div>

          {/* Col 2: Popular Machinery */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-heading">
              Machinery Types
            </h4>
            <ul className="space-y-2.5 text-sm">
              {[
                'Tractor',
                'Harvester',
                'JCB & Excavator',
                'Rotavator & Tiller',
                'Baler & Loader',
                'Transport Truck',
              ].map((cat) => (
                <li key={cat}>
                  <button
                    onClick={() => {
                      setCategoryFilter(cat);
                      setCurrentView('browse');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-stone-400 hover:text-emerald-400 transition"
                  >
                    {cat}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Platform Features */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-heading">
              Platform Features
            </h4>
            <ul className="space-y-2 text-sm text-stone-400">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Verified Machine Inspections
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Certified Heavy Equipment Operators
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Transparent Hourly &amp; Daily Billing
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Guaranteed Doorstep Field Delivery
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Nationwide Equipment Network
              </li>
            </ul>
          </div>

          {/* Col 4: Farmer Contact & Support */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-heading">
              24/7 Support Desk
            </h4>
            <div className="space-y-3 text-sm text-stone-400">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-white font-semibold">1800-120-PNAGRO</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>support@pnagro.com</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Central Operations &amp; Support Hub</span>
              </p>
              <p className="text-xs text-stone-500 pt-1">
                Available in multiple regional languages and English.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-stone-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-stone-500">
          <p>© 2026 PNAgro Agri-Tech Rentals. All rights reserved. MERN Architecture.</p>
          <div className="flex items-center gap-6">
            <button
              onClick={() => {
                setCurrentView('services');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-stone-400 transition"
            >
              Privacy &amp; Terms
            </button>
            <button
              onClick={() => {
                setCurrentView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-stone-400 transition flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Admin Portal
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
