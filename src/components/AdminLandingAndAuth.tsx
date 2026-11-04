import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  Tractor,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react';

interface AdminLandingAndAuthProps {
  language: 'en' | 'hi';
  onNavigateHome: () => void;
}

export const AdminLandingAndAuth: React.FC<AdminLandingAndAuthProps> = ({
  language,
  onNavigateHome,
}) => {
  const { login, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMessage(
        err.message ||
          (language === 'hi'
            ? 'अमान्य एडमिन क्रेडेंशियल। कृपया ईमेल और पासवर्ड की जांच करें।'
            : 'Invalid admin credentials. Please verify your email and password.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-stone-900 text-white">
      {/* Back button */}
      <div className="w-full max-w-md mb-6 flex justify-start">
        <button
          type="button"
          onClick={onNavigateHome}
          className="text-xs font-semibold text-stone-400 hover:text-white px-3 py-1.5 rounded-xl border border-stone-800 bg-stone-950/60 transition flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'होम पेज पर वापस जाएं' : 'Back to Home'}</span>
        </button>
      </div>

      {/* Main Admin Login Card */}
      <div className="w-full max-w-md bg-stone-950/90 border border-stone-800 rounded-3xl p-7 sm:p-9 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400" />

        {/* Header / Brand Logo */}
        <div className="flex flex-col items-center text-center mb-8 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-amber-400 text-stone-950 flex items-center justify-center font-black shadow-lg mb-3">
            <Tractor className="w-8 h-8" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-600/40 text-emerald-400 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{language === 'hi' ? 'प्रशासक पोर्टल' : 'Admin Portal'}</span>
          </div>
          <h1 className="text-2xl font-black font-heading text-white tracking-tight">
            {language === 'hi' ? 'एडमिन लॉगिन' : 'Login as Admin'}
          </h1>
          <p className="text-xs text-stone-400 mt-1">
            {language === 'hi'
              ? 'कृपया एडमिन डैशबोर्ड के लिए क्रेडेंशियल दर्ज करें'
              : 'Enter your credentials to access the administration dashboard'}
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-stone-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'hi' ? 'एडमिन ईमेल' : 'Admin Email'}</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={language === 'hi' ? 'एडमिन ईमेल दर्ज करें' : 'Enter admin email'}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-3 text-white placeholder-stone-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs transition"
            />
          </div>

          <div>
            <label className="block font-bold text-stone-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{language === 'hi' ? 'पासवर्ड' : 'Password'}</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={language === 'hi' ? 'पासवर्ड दर्ज करें' : 'Enter password'}
              className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3.5 py-3 text-white placeholder-stone-600 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-xs transition"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || authLoading}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-xs cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {submitting ? (
                <span>{language === 'hi' ? 'सत्यापित हो रहा है...' : 'Authenticating...'}</span>
              ) : (
                <>
                  <span>{language === 'hi' ? 'लॉगिन करें' : 'Login as Admin'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
