import React, { useState } from 'react';
import {
  Tractor,
  HelpCircle,
  PhoneCall,
  Mail,
  ShieldCheck,
  FileText,
  BadgePercent,
  Cpu,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
  Bot,
  MessageSquare,
  Compass,
  Mic,
  Volume2,
} from 'lucide-react';
import { GeminiChatbot } from './GeminiChatbot';

interface ServicesHelpViewProps {
  onBrowseEquipment: () => void;
  onNavigateToRadar?: () => void;
  language: 'en' | 'hi';
}

export const ServicesHelpView: React.FC<ServicesHelpViewProps> = ({
  onBrowseEquipment,
  onNavigateToRadar,
  language,
}) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does tractor and machinery rental work on PNagro?',
      a: 'Farmers can search for equipment by location, compare hourly rates, choose whether an operator/driver is needed, and book with cash on delivery. The machine owner confirms and dispatches the machinery to your field on the requested date.',
    },
    {
      q: 'Are drivers and operators included in the rental price?',
      a: 'Yes, most heavy machinery (Tractors, Combine Harvesters, JCBs) comes with a verified certified driver. You can also specify your operator preference during booking.',
    },
    {
      q: 'Can I list my own tractor or combine harvester to earn money?',
      a: 'Absolutely! Click on "List Equipment", choose your machine details, set your hourly and daily rates in INR, and start receiving rental orders from nearby farmers.',
    },
    {
      q: 'What is the fuel policy during rentals?',
      a: 'The listing clearly specifies whether diesel is included or supplied by the renter. You can inspect fuel levels and meter readings upon machinery arrival at your farm.',
    },
    {
      q: 'What government subsidies or support schemes are supported?',
      a: 'PNagro assists Custom Hiring Centers (CHCs) and individual farmers under the Sub-Mission on Agricultural Mechanization (SMAM) and state mechanization programs for optimal machinery utilization.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 font-heading flex items-center justify-center gap-1.5 mb-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>24/7 Farmer Support &amp; AI Advisory</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 font-heading">
          {language === 'hi' ? 'किसान सहायता एवं जेमिनी AI सलाहकार' : 'Farmer Support & Gemini AI Advisor'}
        </h1>
        <p className="text-sm text-stone-600 mt-2">
          {language === 'hi'
            ? 'कृषि उपकरण चयन, हॉर्सपावर गणना, और रोटावेटर/कल्टीवेटर के उपयोग के लिए गूगल जेमिनी AI चैटबॉट से सलाह लें।'
            : 'Get instant guidance on farm implement matching, tractor HP requirements, rental rates, and 24/7 technical assistance.'}
        </p>
      </div>

      {/* PROMINENT AI CHATBOT SECTION (GOOGLE GEMINI 3.7) */}
      <div className="bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-emerald-800/60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Chatbot Information Left */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400 text-stone-950 text-xs font-black uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Google Gemini 3.7 Flash</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white leading-tight">
                {language === 'hi' ? 'PNagro किसान AI वॉयस असिस्टेंट' : 'Ask PNagro Kisan Voice AI Assistant'}
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200/90 mt-2 leading-relaxed">
                {language === 'hi'
                  ? 'अपनी फसल, खेत के आकार और मिट्टी के अनुसार सही ट्रैक्टर, हार्वेस्टर या उपकरण चुनने के लिए बोलकर (Mic) या लिखकर AI से बात करें। यह आपको बोलकर उत्तर भी सुनाता है।'
                  : 'Talk or type with our agricultural voice assistant powered by Google Gemini 3.7. Ask about tractor horsepower, cultivator vs rotavator selection, crop harvesting, and rental rates with instant voice replies.'}
              </p>
            </div>

            {/* Feature Highlights */}
            <div className="space-y-3 text-xs">
              <div className="flex items-start gap-3 p-3 bg-white/10 rounded-xl border border-white/10">
                <Mic className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Voice &amp; Speech Input (बोलकर पूछें)</h4>
                  <p className="text-emerald-200 text-[11px]">
                    Hands-free voice recognition in Hindi (हिन्दी) and Indian English for field queries.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/10 rounded-xl border border-white/10">
                <Volume2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Spoken AI Voice Answers (आवाज़ में सुनें)</h4>
                  <p className="text-emerald-200 text-[11px]">
                    Listen to natural voice readouts of equipment advice and implement recommendations.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 bg-white/10 rounded-xl border border-white/10">
                <Tractor className="w-5 h-5 text-teal-300 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white">Smart Machinery &amp; Implement Advice</h4>
                  <p className="text-emerald-200 text-[11px]">
                    Identifies optimal HP (35HP to 90HP) for Wheat, Paddy, Sugarcane &amp; Cotton fields.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Helpline backup */}
            <div className="p-4 bg-emerald-900/60 rounded-2xl border border-emerald-700/50 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold">24/7 Human Helpline</p>
                <p className="text-sm font-black text-white">1800-120-PNAGRO (762476)</p>
              </div>
              <a
                href="tel:1800120762476"
                className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-lg text-xs transition"
              >
                Call Now
              </a>
            </div>
          </div>

          {/* Chatbot Interactive Box Right */}
          <div className="lg:col-span-7">
            <GeminiChatbot
              onNavigateToBrowse={onBrowseEquipment}
              onNavigateToRadar={onNavigateToRadar}
              language={language}
              isEmbedded={true}
            />
          </div>
        </div>
      </div>

      {/* 3 Core Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
            <Tractor className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 font-heading mb-2">
            Custom Hiring &amp; Fleet Rentals
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed mb-4">
            Rent high-capacity 50HP+ tractors, combine harvesters, rotavators, and laser land levelers on an hourly or daily basis without huge capital expenditure.
          </p>
          <ul className="space-y-1.5 text-xs text-stone-700">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Zero machinery depreciation
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Transparent hourly meter rates
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center mb-4">
            <BadgePercent className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 font-heading mb-2">
            Agri Mechanization Schemes
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed mb-4">
            Guidance on central and state farm mechanization grants, CHC subsidies, and cooperative rental hubs for crop residue management (CRM).
          </p>
          <ul className="space-y-1.5 text-xs text-stone-700">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> SMAM Scheme Advisory
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Happy Seeder &amp; Super SMS Support
            </li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-xs hover:shadow-md transition">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 font-heading mb-2">
            Verified Operators &amp; Safety
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed mb-4">
            Every machine is vetted with experienced drivers who understand precision leveling, depth control, and minimal crop damage during harvesting.
          </p>
          <ul className="space-y-1.5 text-xs text-stone-700">
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verified Host Credentials
            </li>
            <li className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Real-time Support Hotline
            </li>
          </ul>
        </div>
      </div>

      {/* FAQ & Contact Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: FAQs */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs">
          <h3 className="text-lg font-bold text-stone-900 font-heading mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-700" />
            <span>Frequently Asked Questions</span>
          </h3>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="border border-stone-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-3.5 text-left font-bold text-xs sm:text-sm text-stone-900 flex justify-between items-center hover:bg-stone-50 transition"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-emerald-700 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-stone-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-3.5 pb-3.5 pt-1 text-xs text-stone-600 leading-relaxed bg-stone-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: 24/7 Kisan Helpline & Contact Form */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-900 to-stone-900 text-white p-6 rounded-2xl shadow-md flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider uppercase text-amber-400 flex items-center gap-1 mb-2">
              <Sparkles className="w-3.5 h-3.5" /> 24/7 Direct Kisan Helpline
            </span>
            <h3 className="text-xl font-bold font-heading mb-3">
              Need Help Renting Machinery?
            </h3>
            <p className="text-xs text-emerald-100 leading-relaxed mb-6">
              Our agriculture engineers and regional agents are available around the clock to assist you with equipment booking, rates, and driver dispatch.
            </p>

            <div className="space-y-3 text-xs mb-6">
              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/10">
                <PhoneCall className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-stone-300 text-[10px]">Toll-Free Helpline</p>
                  <p className="text-sm font-bold text-white">1800-120-PNAGRO (762476)</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/10">
                <Mail className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="text-stone-300 text-[10px]">Direct Farmer Email</p>
                  <p className="text-sm font-bold text-white">kisan@pnagro.com</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={onBrowseEquipment}
              className="w-full py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold rounded-xl text-xs shadow-md transition"
            >
              Browse Available Farm Machinery Now
            </button>
            {onNavigateToRadar && (
              <button
                onClick={onNavigateToRadar}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs border border-emerald-600/50 transition flex items-center justify-center gap-1.5"
              >
                <span>Check Live Radar Map</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

