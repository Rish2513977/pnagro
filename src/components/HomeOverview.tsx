import React from 'react';
import {
  Tractor,
  Combine,
  Truck,
  Wrench,
  ShieldCheck,
  Zap,
  ArrowRight,
  Sparkles,
  Compass,
  CheckCircle2,
  PhoneCall,
  Calendar,
  Clock,
  MapPin,
  Bot,
  Layers,
  Award,
  CircleDollarSign,
  HeartHandshake,
} from 'lucide-react';
import { EquipmentCategory } from '../types';

interface HomeOverviewProps {
  onNavigate: (view: string, category?: EquipmentCategory) => void;
  openAddModal: () => void;
  openAuthModal: () => void;
  openAIChat: () => void;
  language: 'en' | 'hi';
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  onNavigate,
  openAddModal,
  openAuthModal,
  openAIChat,
  language,
}) => {
  const t = {
    en: {
      aboutBadge: 'About PNagro Platform',
      aboutTitle: 'Empowering Farmers with Modern Mechanization',
      aboutDesc:
        'PNagro is India’s dedicated digital farm machinery network. We bridge the gap between tractor and equipment owners and farmers, enabling easy on-demand machinery rentals with zero middleman commissions, transparent hourly rates, and certified operators.',
      
      featuresBadge: 'Platform Features & Services',
      featuresTitle: 'Everything You Need for Farm Cultivation',
      featuresSubtitle: 'Explore our integrated suite of agricultural services, machinery fleets, and AI-powered farming advisory.',

      // Feature cards
      featureFleetTitle: 'Verified Machinery Catalog',
      featureFleetDesc: 'Browse high-power tractors (35-75 HP), multi-crop combine harvesters, JCB loaders, and laser land levelers with verified condition reports.',
      featureFleetBtn: 'Explore Equipment Catalog',

      featureDeliveryTitle: 'Certified Operators & Field Delivery',
      featureDeliveryDesc: 'Heavy farm machinery delivered directly to your agricultural land with certified, background-verified operators.',
      featureDeliveryBtn: 'Find Machinery & Operators',

      featureHelpTitle: 'Help Only & Support Desk',
      featureHelpDesc: 'Access 24/7 farmer assistance, machinery rental FAQs, tractor horsepower guides, and direct Kisan helpline support.',
      featureHelpBtn: 'Open Help & Support',

      featureAITitle: 'Kisan Mitra AI Voice Assistant',
      featureAIDesc: 'Speak or chat 24/7 with Google Gemini 3.7 for instant guidance on tractor HP recommendations, implements, sowing schedules, and rental pricing.',
      featureAIBtn: 'Talk to Kisan Voice AI',

      // Pillars
      pillar1Title: 'Zero Middlemen Commission',
      pillar1Desc: 'Direct farmer-to-owner connection with transparent hourly, acre-wise, and daily pricing.',
      pillar2Title: 'Pre-Inspected Machinery',
      pillar2Desc: 'All tractors, harvesters, and loaders undergo quality verification before listing.',
      pillar3Title: 'Experienced Operators',
      pillar3Desc: 'Trained drivers sent with heavy machinery ensure precise and safe farm cultivation.',
      pillar4Title: 'Doorstep Farm Delivery',
      pillar4Desc: 'Machinery arrives directly at your agricultural plot at your selected date and time.',

      // How it works
      howBadge: 'Simple 3-Step Process',
      howTitle: 'How PNagro Works',
      step1Title: '1. Search Equipment',
      step1Desc: 'Enter your location and equipment requirement to see matching machines and transparent hourly rates.',
      step2Title: '2. Select Date & Confirm',
      step2Desc: 'Choose your desired date, required working hours, and attachments. Confirm booking with Cash on Delivery or UPI.',
      step3Title: '3. Machine Arrives On Field',
      step3Desc: 'The verified operator delivers the machine directly to your farm ready to cultivate or harvest.',

      // Trust stats
      stat1: '500+',
      stat1Label: 'Verified Machines',
      stat2: '12,000+',
      stat2Label: 'Successful Bookings',
      stat3: '120+',
      stat3Label: 'Districts Connected',
      stat4: '4.9/5',
      stat4Label: 'Farmer Rating',

      ctaTitle: 'Ready to Modernize Your Farm Operations?',
      ctaSubtitle: 'Join thousands of farmers across India using PNagro for hassle-free equipment rentals.',
      ctaExplore: 'Explore All Features',
      ctaHelp: 'Contact Farmer Helpline',
    },
    hi: {
      aboutBadge: 'PNagro के बारे में',
      aboutTitle: 'भारतीय किसानों को आधुनिक कृषि मशीनीकरण से सशक्त बनाना',
      aboutDesc:
        'PNagro भारत का प्रमुख डिजिटल कृषि उपकरण नेटवर्क है। हम मशीन मालिकों और किसानों को सीधे जोड़ते हैं, जिससे बिना किसी बिचौलिये के पारदर्शी प्रति घंटा दरों और कुशल ऑपरेटरों के साथ ट्रैक्टर, हार्वेस्टर और लोडर उपलब्ध होते हैं।',

      featuresBadge: 'प्लेटफॉर्म सुविधाएं व सेवाएं',
      featuresTitle: 'खेती के हर काम के लिए संपूर्ण समाधान',
      featuresSubtitle: 'हमारी सभी सुविधाओं, मशीनरी कैटलॉग, कृषि सेवाओं और AI किसान मित्र से जुड़ें।',

      featureFleetTitle: 'सत्यापित कृषि उपकरण कैटलॉग',
      featureFleetDesc: '35 से 75 HP के ट्रैक्टर, मल्टी-क्रॉप कंबाइन हार्वेस्टर, जेसीबी लोडर और लेजर लेवलर देखें।',
      featureFleetBtn: 'उपकरण कैटलॉग देखें',

      featureDeliveryTitle: 'प्रशिक्षित ऑपरेटर एवं खेत पर डिलीवरी',
      featureDeliveryDesc: 'कुशल व सत्यापित ऑपरेटरों के साथ भारी कृषि मशीनरी सीधे आपके खेत पर उपलब्ध कराई जाती है।',
      featureDeliveryBtn: 'उपकरण व चालक देखें',

      featureHelpTitle: 'सहायता एवं हेल्पलाइन (Help Only)',
      featureHelpDesc: '24/7 किसान सहायता, मशीनरी संबंधी अक्सर पूछे जाने वाले प्रश्न और तकनीकी परामर्श।',
      featureHelpBtn: 'सहायता केंद्र खोलें',

      featureAITitle: 'किसान मित्र AI वॉयस असिस्टेंट',
      featureAIDesc: 'बोलकर या लिखकर 24/7 AI से बात करें। ट्रैक्टर HP, रोटावेटर व कृषि सलाह के लिए सटीक मार्गदर्शन प्राप्त करें।',
      featureAIBtn: 'किसान वॉयस AI से पूछें',

      pillar1Title: 'शून्य बिचौलिया कमीशन',
      pillar1Desc: 'मशीन मालिक से सीधा संपर्क और पारदर्शी प्रति घंटा दरें।',
      pillar2Title: 'सत्यापित और सुरक्षित मशीनें',
      pillar2Desc: 'हर मशीन की स्थिति और कार्यक्षमता की जांच के बाद ही लिस्टिंग।',
      pillar3Title: 'कुशल व प्रशिक्षित चालक',
      pillar3Desc: 'कुशल ऑपरेटर आपके खेत पर आकर सुरक्षित और सटीक जुताई करते हैं।',
      pillar4Title: 'सीधे खेत पर डिलीवरी',
      pillar4Desc: 'आपकी चुनी हुई तारीख और समय पर मशीन सीधे खेत पर पहुंचती है।',

      howBadge: 'आसान 3-चरणीय प्रक्रिया',
      howTitle: 'PNagro कैसे काम करता है',
      step1Title: '1. उपकरण खोजें',
      step1Desc: 'अपनी जरूरत और क्षेत्र के अनुसार ट्रैक्टर या हार्वेस्टर खोजें।',
      step2Title: '2. तारीख व समय चुनें',
      step2Desc: 'काम के घंटे और आवश्यक उपकरण चुनकर कैश ऑन डिलीवरी या UPI से बुक करें।',
      step3Title: '3. खेत पर काम शुरू',
      step3Desc: 'ऑपरेटर मशीन लेकर सीधे आपके खेत पर पहुंचता है और काम पूरा करता है।',

      stat1: '500+',
      stat1Label: 'सत्यापित मशीनें',
      stat2: '12,000+',
      stat2Label: 'सफल बुकिंग',
      stat3: '120+',
      stat3Label: 'जुड़े जिले',
      stat4: '4.9/5',
      stat4Label: 'किसान संतुष्टि',

      ctaTitle: 'क्या आप अपनी खेती को आसान बनाना चाहते हैं?',
      ctaSubtitle: 'आज ही PNagro से जुड़ें और किफायती दरों पर सर्वोत्तम कृषि उपकरण प्राप्त करें।',
      ctaExplore: 'सभी सुविधाएं देखें',
      ctaHelp: 'किसान हेल्पलाइन',
    },
  }[language];

  return (
    <div className="space-y-16 py-12">
      {/* SECTION 1: ABOUT PNAGRO OVERVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-stone-200 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-heading mb-4">
              <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
              {t.aboutBadge}
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-stone-900 font-heading leading-tight mb-4">
              {t.aboutTitle}
            </h2>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-normal">
              {t.aboutDesc}
            </p>
          </div>

          {/* 4 Core Pillars */}
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-3">
                <CircleDollarSign className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 font-heading mb-1.5">{t.pillar1Title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{t.pillar1Desc}</p>
            </div>

            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-3">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 font-heading mb-1.5">{t.pillar2Title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{t.pillar2Desc}</p>
            </div>

            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-3">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 font-heading mb-1.5">{t.pillar3Title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{t.pillar3Desc}</p>
            </div>

            <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200">
              <div className="w-10 h-10 rounded-xl bg-emerald-700 text-white flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-stone-900 font-heading mb-1.5">{t.pillar4Title}</h3>
              <p className="text-xs text-stone-600 leading-relaxed">{t.pillar4Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PLATFORM FEATURE HUB & QUICK LINKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-heading">
            {t.featuresBadge}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading mt-1">
            {t.featuresTitle}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 mt-2">
            {t.featuresSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Browse Equipment Catalog */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md hover:border-emerald-500 transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Tractor className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-heading mb-2">
                {t.featureFleetTitle}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                {t.featureFleetDesc}
              </p>
            </div>
            <button
              onClick={() => onNavigate('browse')}
              className="mt-auto w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <span>{t.featureFleetBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Field Delivery & Operators */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md hover:border-emerald-500 transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-heading mb-2">
                {t.featureDeliveryTitle}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                {t.featureDeliveryDesc}
              </p>
            </div>
            <button
              onClick={() => onNavigate('browse')}
              className="mt-auto w-full py-2.5 px-4 bg-stone-900 hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <span>{t.featureDeliveryBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Help & Support Desk */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md hover:border-emerald-500 transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <PhoneCall className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-heading mb-2">
                {t.featureHelpTitle}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                {t.featureHelpDesc}
              </p>
            </div>
            <button
              onClick={() => onNavigate('services')}
              className="mt-auto w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <span>{t.featureHelpBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 4: Kisan Mitra AI */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs hover:shadow-md hover:border-emerald-500 transition group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center mb-4 group-hover:scale-105 transition">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 font-heading mb-2">
                {t.featureAITitle}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed mb-4">
                {t.featureAIDesc}
              </p>
            </div>
            <button
              onClick={openAIChat}
              className="mt-auto w-full py-2.5 px-4 bg-indigo-800 hover:bg-indigo-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <span>{t.featureAIBtn}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 3: HOW PNAGRO WORKS */}
      <section className="bg-white py-14 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-heading">
              {t.howBadge}
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-heading mt-1">
              {t.howTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 text-center">
              <div className="w-12 h-12 bg-emerald-800 text-white rounded-2xl flex items-center justify-center font-bold text-lg mx-auto mb-4">
                1
              </div>
              <h3 className="text-base font-bold text-stone-900 font-heading mb-2">
                {t.step1Title}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t.step1Desc}
              </p>
            </div>

            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 text-center">
              <div className="w-12 h-12 bg-emerald-800 text-white rounded-2xl flex items-center justify-center font-bold text-lg mx-auto mb-4">
                2
              </div>
              <h3 className="text-base font-bold text-stone-900 font-heading mb-2">
                {t.step2Title}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t.step2Desc}
              </p>
            </div>

            <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 text-center">
              <div className="w-12 h-12 bg-emerald-800 text-white rounded-2xl flex items-center justify-center font-bold text-lg mx-auto mb-4">
                3
              </div>
              <h3 className="text-base font-bold text-stone-900 font-heading mb-2">
                {t.step3Title}
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                {t.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: TRUST STATS & CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-stone-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center mb-10 pb-10 border-b border-emerald-800/80">
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-heading">{t.stat1}</p>
              <p className="text-xs sm:text-sm text-emerald-200 mt-1 font-medium">{t.stat1Label}</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-300 font-heading">{t.stat2}</p>
              <p className="text-xs sm:text-sm text-emerald-200 mt-1 font-medium">{t.stat2Label}</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-heading">{t.stat3}</p>
              <p className="text-xs sm:text-sm text-emerald-200 mt-1 font-medium">{t.stat3Label}</p>
            </div>
            <div>
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-300 font-heading">{t.stat4}</p>
              <p className="text-xs sm:text-sm text-emerald-200 mt-1 font-medium">{t.stat4Label}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left max-w-xl">
              <h3 className="text-xl sm:text-2xl font-bold font-heading text-white">
                {t.ctaTitle}
              </h3>
              <p className="text-xs sm:text-sm text-emerald-200 mt-1">
                {t.ctaSubtitle}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('browse')}
                className="px-6 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg transition flex items-center gap-1.5"
              >
                <span>{t.ctaExplore}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate('services')}
                className="px-5 py-3 bg-emerald-800/80 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl border border-emerald-600/50 transition flex items-center gap-1.5"
              >
                <PhoneCall className="w-4 h-4 text-emerald-300" />
                <span>{t.ctaHelp}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
