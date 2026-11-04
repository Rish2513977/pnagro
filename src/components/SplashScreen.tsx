import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Tractor,
  Sparkles,
  ShieldCheck,
  MapPin,
  Bot,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
  language?: 'en' | 'hi';
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onComplete,
  language = 'en',
}) => {
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);
  const [isExiting, setIsExiting] = useState(false);

  const stagesEn = [
    'Initializing PNagro Agricultural Hub...',
    'Connecting Live GPS Machinery Fleet...',
    'Syncing Verified Tractor Partners & Implements...',
    'Activating Kisan Voice AI Assistant...',
    'Ready for farming!',
  ];

  const stagesHi = [
    'पीएन एग्रो प्लेटफॉर्म शुरू हो रहा है...',
    'लाइव जीपीएस ट्रैक्टर व मशीनरी खोजी जा रही है...',
    'सत्यापित कृषि उपकरण एवं किसान रडार कनेक्ट हो रहे हैं...',
    'किसान वॉइस एआई सहायक तैयार हो रहा है...',
    'खेती के लिए तैयार!',
  ];

  const stages = language === 'hi' ? stagesHi : stagesEn;

  useEffect(() => {
    // Increment progress smoothly over ~1.8 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsExiting(true);
            setTimeout(onComplete, 400); // Trigger complete after exit animation
          }, 250);
          return 100;
        }
        const increment = Math.floor(Math.random() * 8) + 6; // random smooth increment
        const next = Math.min(prev + increment, 100);

        // Update stage based on progress
        if (next < 25) setStageIndex(0);
        else if (next < 55) setStageIndex(1);
        else if (next < 80) setStageIndex(2);
        else if (next < 98) setStageIndex(3);
        else setStageIndex(4);

        return next;
      });
    }, 90);

    return () => clearInterval(interval);
  }, [onComplete]);

  const handleSkip = () => {
    setIsExiting(true);
    setTimeout(onComplete, 200);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          id="splash-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.35, ease: 'easeInOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-radial-[at_50%_40%] from-emerald-900 via-stone-950 to-stone-950 text-white overflow-hidden select-none p-6"
        >
          {/* Subtle Ambient Background Gradients & Grid Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#10b981_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

          {/* Top subtle bar */}
          <div className="w-full max-w-md flex items-center justify-between z-10 pt-2 opacity-80">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>{language === 'hi' ? 'स्मार्ट एग्रो नेटवर्क' : 'Smart Agro Network'}</span>
            </div>

            <button
              onClick={handleSkip}
              className="text-xs font-bold text-stone-400 hover:text-white px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition backdrop-blur-sm cursor-pointer flex items-center gap-1"
            >
              <span>{language === 'hi' ? 'सीधे जाएं' : 'Skip'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Central Logo & Brand Branding */}
          <div className="flex flex-col items-center justify-center text-center z-10 my-auto max-w-sm w-full">
            {/* Animated Logo Container with Glowing Ring */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-6"
            >
              {/* Outer Pulse Glow Rings */}
              <div className="absolute -inset-4 rounded-3xl bg-emerald-500/20 blur-xl animate-pulse" />
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-400 to-teal-500 opacity-30 blur-sm" />

              {/* Logo Box */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 p-0.5 shadow-2xl flex items-center justify-center border border-emerald-400/40">
                <div className="w-full h-full rounded-[22px] bg-stone-950/40 backdrop-blur-xs flex flex-col items-center justify-center text-amber-400">
                  <motion.div
                    animate={{ y: [0, -3, 0] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  >
                    <Tractor className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)]" />
                  </motion.div>
                </div>
              </div>

              {/* Verified Badge Icon */}
              <div className="absolute -bottom-2 -right-2 bg-amber-400 text-stone-950 p-1.5 rounded-full shadow-lg border-2 border-stone-950 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-950" />
              </div>
            </motion.div>

            {/* Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="space-y-1"
            >
              <h1 className="text-4xl sm:text-5xl font-black font-heading tracking-tight flex items-center justify-center gap-1.5 drop-shadow-sm">
                <span>PN</span>
                <span className="text-emerald-400 bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
                  agro
                </span>
              </h1>

              <p className="text-xs sm:text-sm font-semibold text-emerald-200/90 tracking-wide">
                {language === 'hi'
                  ? 'भारत का भरोसेमंद कृषि मशीनरी प्लेटफॉर्म'
                  : "India's Farm & Heavy Machinery On-Demand"}
              </p>
            </motion.div>

            {/* Feature Pills */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-2 mt-5"
            >
              <span className="px-2.5 py-1 rounded-lg bg-emerald-900/60 border border-emerald-600/40 text-[11px] font-bold text-emerald-300 flex items-center gap-1 shadow-xs">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>GPS Radar</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-900/60 border border-emerald-600/40 text-[11px] font-bold text-emerald-300 flex items-center gap-1 shadow-xs">
                <Bot className="w-3 h-3 text-emerald-400" />
                <span>Kisan AI Voice</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-900/60 border border-emerald-600/40 text-[11px] font-bold text-emerald-300 flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3 h-3 text-teal-400" />
                <span>100% Verified Fleet</span>
              </span>
            </motion.div>
          </div>

          {/* Bottom Progress Bar & Loading Status */}
          <div className="w-full max-w-sm z-10 pb-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-stone-400 font-medium">
              <span className="text-emerald-300 font-semibold truncate max-w-[240px]">
                {stages[stageIndex]}
              </span>
              <span className="font-mono text-emerald-400 font-bold">{progress}%</span>
            </div>

            {/* Custom Progress Bar */}
            <div className="w-full h-2 bg-stone-800/90 rounded-full overflow-hidden p-0.5 border border-white/10 shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>

            {/* Trust footer line */}
            <p className="text-[10px] text-center text-stone-400">
              Connecting Farmers, Transporters & Harvester Contractors
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
