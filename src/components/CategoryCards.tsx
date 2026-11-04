import React from 'react';
import { EquipmentCategory } from '../types';
import {
  Tractor,
  Combine,
  Truck,
  Wrench,
  Gauge,
  Sparkles,
  ArrowUpRight,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';

interface CategoryCardsProps {
  selectedCategory: string;
  onSelectCategory: (cat: EquipmentCategory) => void;
  selectedAttachment?: string;
  onSelectAttachment?: (att: string) => void;
  language: 'en' | 'hi';
  onNavigateToBrowse?: (cat: EquipmentCategory) => void;
}

const CATEGORIES_DATA: {
  id: EquipmentCategory;
  nameEn: string;
  nameHi: string;
  count: string;
  startPrice: string;
  image: string;
  tag: string;
  description: string;
}[] = [
  {
    id: 'Tractor',
    nameEn: 'Tractor',
    nameHi: 'ट्रैक्टर',
    count: '240+ Live',
    startPrice: '₹650/hr',
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&w=600&q=80',
    tag: '35 HP - 75 HP 4WD/2WD',
    description: 'Compatible with Cultivator, Rotavator, Disc Harrow, MB Plough & Trolley',
  },
  {
    id: 'Loader',
    nameEn: 'Loader',
    nameHi: 'लोडर व जेसीबी',
    count: '95+ Live',
    startPrice: '₹1,200/hr',
    image: 'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&w=600&q=80',
    tag: 'Front Loaders & Backhoes',
    description: 'Equipped with heavy buckets, dozer blades & grabbers for farm earthwork',
  },
  {
    id: 'Combine Harvester',
    nameEn: 'Combine Harvester',
    nameHi: 'कंबाइन हार्वेस्टर',
    count: '80+ Live',
    startPrice: '₹2,000/hr',
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=600&q=80',
    tag: 'Track & Wheel Multi-Crop',
    description: 'With 10-14ft Cutter Bar & Straw Reaper for clean wheat & paddy harvesting',
  },
  {
    id: 'Other Machinery',
    nameEn: 'Other Machinery',
    nameHi: 'अन्य कृषि मशीनें',
    count: '60+ Live',
    startPrice: '₹450/hr',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    tag: 'Laser Levelers & Custom Implements',
    description: 'Laser land levelers, sugarcane harvesters, power weeders & seed drills',
  },
];

const ATTACHMENT_PRESETS = [
  'All',
  'Cultivator',
  'Rotavator',
  'Disc Harrow',
  'MB Plough',
  'Seed Drill',
  'Straw Reaper',
  'Front Bucket Loader',
  'Laser Land Leveler',
  'Trolley / Trailer',
];

export const CategoryCards: React.FC<CategoryCardsProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedAttachment = 'All',
  onSelectAttachment,
  language,
}) => {
  return (
    <section className="py-10 bg-stone-100 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5" />
              {language === 'en' ? 'Core Machinery Fleet' : 'मुख्य कृषि मशीनें'}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading">
              {language === 'en' ? 'Verified Machinery & Implements' : 'सत्यापित कृषि मशीनरी व उपकरण'}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-stone-700 mt-1 sm:mt-0 font-medium">
            {language === 'en'
              ? 'Select machinery or filter by attached implements (Cultivator, Rotavator, etc.)'
              : 'मशीन चुनें अथवा जुड़े हुए कृषि यंत्र (कल्टीवेटर, रोटावेटर आदि) से खोजें'}
          </p>
        </div>

        {/* 4 Core Machinery Categories */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CATEGORIES_DATA.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (onNavigateToBrowse) {
                    onNavigateToBrowse(cat.id);
                  } else {
                    onSelectCategory(isSelected ? 'All' : cat.id);
                  }
                }}
                className={`group relative text-left rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all transform duration-200 flex flex-col bg-white border ${
                  isSelected
                    ? 'border-emerald-600 ring-2 ring-emerald-600'
                    : 'border-stone-200 hover:border-emerald-400'
                }`}
              >
                {/* Image */}
                <div className="relative h-36 w-full overflow-hidden bg-stone-100">
                  <img
                    src={cat.image}
                    alt={cat.nameEn}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/20 to-transparent" />
                  <span className="absolute bottom-2.5 left-3 text-[11px] font-bold bg-amber-400 text-stone-950 px-2 py-0.5 rounded-md shadow-xs">
                    {cat.startPrice}
                  </span>
                  <span className="absolute top-2.5 right-3 text-[10px] font-bold bg-stone-900/80 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {cat.count}
                  </span>
                </div>

                {/* Info Content */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-base text-stone-900 group-hover:text-emerald-700 transition">
                      {language === 'en' ? cat.nameEn : cat.nameHi}
                    </h3>
                    <p className="text-xs font-semibold text-emerald-800 mt-0.5">{cat.tag}</p>
                    <p className="text-[11px] text-stone-600 mt-1.5 leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between">
                    <span className="text-xs font-bold text-stone-900 flex items-center gap-1 group-hover:text-emerald-700">
                      {isSelected ? '✓ Filter Active' : 'Browse Fleet'}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-stone-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Attached Implements Filter Bar */}
        {onSelectAttachment && (
          <div className="mt-6 p-3.5 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-800 shrink-0">
              <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
              <span>{language === 'en' ? 'Filter by Attached Implement:' : 'जुड़ा हुआ उपकरण:'}</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-1 sm:pb-0 scrollbar-thin">
              {ATTACHMENT_PRESETS.map((att) => {
                const isAttSelected = selectedAttachment === att;
                return (
                  <button
                    key={att}
                    onClick={() => onSelectAttachment(att)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      isAttSelected
                        ? 'bg-emerald-700 text-white shadow-xs'
                        : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {att === 'All' ? (language === 'en' ? 'All Implements' : 'सभी उपकरण') : att}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
