import React, { useState } from 'react';
import {
  Search,
  MapPin,
  Tractor,
  ShieldCheck,
  Zap,
  ArrowRight,
  TrendingUp,
  Star,
  Users,
  Sparkles,
} from 'lucide-react';
import { EquipmentCategory } from '../types';

interface HeroProps {
  onSearch: (query: string, category?: string, state?: string) => void;
  openAuthModal: () => void;
  language: 'en' | 'hi';
}

const QUICK_TAGS = [
  { labelEn: '🚜 50+ HP Tractor', labelHi: '🚜 50+ HP ट्रैक्टर', query: '50 HP', category: 'Tractor' },
  { labelEn: '⚙️ Rotavator', labelHi: '⚙️ रोटावेटर', query: 'Rotavator', category: 'Tractor' },
  { labelEn: '🌾 Combine Harvester', labelHi: '🌾 कंबाइन हार्वेस्टर', query: 'Harvester', category: 'Combine Harvester' },
  { labelEn: '🏗️ JCB / Loader', labelHi: '🏗️ जेसीबी / लोडर', query: 'Loader', category: 'Loader' },
  { labelEn: '🌱 Laser Leveler', labelHi: '🌱 लेजर लेवलर', query: 'Laser Leveler', category: 'Other Machinery' },
];

export const Hero: React.FC<HeroProps> = ({ onSearch, openAuthModal, language }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EquipmentCategory>('All');
  const [selectedState, setSelectedState] = useState('All');

  const t = {
    en: {
      title1: 'Rent Verified Farm Equipment',
      title2: 'Directly in Your Area',
      subtitle:
        'Search tractors, combine harvesters, loaders, and implements with transparent hourly rates and certified operators.',
      searchPlaceholder: 'Search tractor, harvester, rotavator, JCB model...',
      allCategories: 'All Categories',
      searchBtn: 'Search Equipment',
      quickSearches: 'Popular searches:',
    },
    hi: {
      title1: 'अपने नजदीकी क्षेत्र में',
      title2: 'सत्यापित कृषि उपकरण किराए पर लें',
      subtitle:
        'ट्रैक्टर, कंबाइन हार्वेस्टर, रोटावेटर और जेसीबी सीधे सत्यापित मालिकों से प्राप्त करें। पारदर्शी प्रति घंटा दरें और त्वरित बुकिंग।',
      searchPlaceholder: 'ट्रैक्टर, हार्वेस्टर, रोटावेटर, जेसीबी खोजें...',
      allCategories: 'सभी श्रेणियां',
      searchBtn: 'उपकरण खोजें',
      quickSearches: 'लोकप्रिय खोज:',
    },
  }[language];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm, selectedCategory, selectedState);
  };

  const handleQuickTagClick = (tag: typeof QUICK_TAGS[0]) => {
    setSearchTerm(tag.query);
    setSelectedCategory(tag.category as EquipmentCategory);
    onSearch(tag.query, tag.category, selectedState);
  };

  return (
    <div className="relative bg-gradient-to-b from-emerald-950 via-emerald-900 to-stone-900 text-white overflow-hidden">
      {/* Subtle Background visual overlay */}
      <div
        className="absolute inset-0 opacity-15 bg-cover bg-center mix-blend-overlay"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=1920&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-radial from-transparent via-black/40 to-black/80 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-16 lg:pb-20 text-center">
        {/* Title & Subtitle */}
        <div className="max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-heading leading-tight">
            <span>{t.title1}</span> <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-teal-200">
              {t.title2}
            </span>
          </h1>
          <p className="mt-3 text-sm sm:text-base text-emerald-100/90 leading-relaxed font-normal max-w-2xl mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Clean, Focused Search & Filter Bar */}
        <div className="bg-white/95 backdrop-blur-xl p-3 sm:p-4 rounded-2xl shadow-2xl border border-white/20 text-stone-800 text-left">
          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
          >
            {/* Search Input */}
            <div className="sm:col-span-5 relative flex items-center">
              <Search className="w-4 h-4 text-emerald-700 absolute left-3.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-3 py-2.5 bg-stone-100 sm:bg-transparent rounded-xl sm:rounded-lg text-sm text-stone-900 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Category Select */}
            <div className="sm:col-span-3 border-t sm:border-t-0 sm:border-l border-stone-200 sm:pl-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as EquipmentCategory)}
                className="w-full py-2.5 px-3 bg-stone-100 sm:bg-transparent rounded-xl sm:rounded-lg text-xs font-semibold text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 cursor-pointer"
              >
                <option value="All">{t.allCategories}</option>
                <option value="Tractor">Tractor (ट्रैक्टर)</option>
                <option value="Loader">Loader (लोडर / जेसीबी)</option>
                <option value="Combine Harvester">Combine Harvester (कंबाइन हार्वेस्टर)</option>
                <option value="Other Machinery">Other Machinery (अन्य मशीनरी)</option>
              </select>
            </div>

            {/* Location / Area Input */}
            <div className="sm:col-span-2 border-t sm:border-t-0 sm:border-l border-stone-200 sm:pl-2">
              <input
                type="text"
                value={selectedState === 'All' ? '' : selectedState}
                onChange={(e) => setSelectedState(e.target.value.trim() ? e.target.value : 'All')}
                placeholder={language === 'en' ? 'Area / City' : 'स्थान / शहर'}
                className="w-full py-2.5 px-2 bg-stone-100 sm:bg-transparent rounded-xl sm:rounded-lg text-xs font-semibold text-stone-700 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>

            {/* Submit Search Button */}
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl sm:rounded-lg shadow-md transition flex items-center justify-center gap-1.5"
              >
                <span>{t.searchBtn}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Quick Filter Tag Chips */}
          <div className="mt-3 pt-3 border-t border-stone-200/80 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-stone-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              {t.quickSearches}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickTagClick(tag)}
                  className="px-2.5 py-1 bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 text-xs font-semibold rounded-lg transition border border-stone-200/80"
                >
                  {language === 'hi' ? tag.labelHi : tag.labelEn}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
