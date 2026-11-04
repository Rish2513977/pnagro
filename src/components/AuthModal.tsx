import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ALL_INDIAN_STATES, getDistrictsForState } from '../data/indiaLocations';
import {
  X,
  Lock,
  User as UserIcon,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Tractor,
  ShieldCheck,
  UserCheck,
  MapPin,
  Loader2,
} from 'lucide-react';

interface AuthModalProps {
  onClose: () => void;
  language: 'en' | 'hi';
  initialMode?: 'farmer' | 'owner' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onClose,
  language,
  initialMode = 'farmer',
}) => {
  const { login, register, socialLogin } = useAuth();

  // Primary view: 'login' | 'register'
  const [view, setView] = useState<'login' | 'register'>(
    initialMode === 'register' ? 'register' : 'login'
  );

  // In Login: 'farmer' | 'owner'
  const [loginRole, setLoginRole] = useState<'farmer' | 'owner'>(
    initialMode === 'owner' ? 'owner' : 'farmer'
  );

  // In Register: 'farmer' | 'owner'
  const [registerRole, setRegisterRole] = useState<UserRole>(
    initialMode === 'owner' ? 'owner' : 'farmer'
  );

  // Login form fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Register form fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regState, setRegState] = useState('Punjab');
  const [regDistrict, setRegDistrict] = useState('Ludhiana');
  const [regPincode, setRegPincode] = useState('141001');

  // Sync available districts when state changes
  const availableDistricts = getDistrictsForState(regState);

  const handleStateChange = (newState: string) => {
    setRegState(newState);
    const districts = getDistrictsForState(newState);
    if (districts.length > 0) {
      setRegDistrict(districts[0]);
    }
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [socialProviderLoading, setSocialProviderLoading] = useState<'google' | 'facebook' | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const t = {
    en: {
      signInTitle: 'Sign In',
      createAccountTitle: 'Create Account',
      loginFarmer: 'Login as Farmer',
      loginOwner: 'Login as Owner',
      registerFarmer: 'Register as Farmer',
      registerOwner: 'Register as Owner',
      emailOrPhone: 'Email or Phone Number',
      password: 'Password',
      fullName: 'Full Name',
      email: 'Email Address',
      phone: 'Mobile Number',
      state: 'State',
      district: 'District',
      pincode: 'PIN Code',
      loginSubmitFarmer: 'Login as Farmer',
      loginSubmitOwner: 'Login as Owner',
      registerSubmit: 'Create Account',
      orContinueWith: 'Or continue with',
      orSignUpWith: 'Or sign up with',
      googleLogin: 'Continue with Google',
      facebookLogin: 'Continue with Facebook',
      googleRegister: 'Sign up with Google',
      facebookRegister: 'Sign up with Facebook',
      dontHaveAccount: "Don't have an account?",
      registerNow: 'Register Now',
      alreadyHaveAccount: 'Already have an account?',
      loginHere: 'Login Here',
    },
    hi: {
      signInTitle: 'साइन इन करें',
      createAccountTitle: 'खाता बनाएं',
      loginFarmer: 'किसान लॉगिन',
      loginOwner: 'मालिक लॉगिन',
      registerFarmer: 'किसान पंजीकरण',
      registerOwner: 'मालिक पंजीकरण',
      emailOrPhone: 'ईमेल या मोबाइल नंबर',
      password: 'पासवर्ड',
      fullName: 'पूरा नाम',
      email: 'ईमेल पता',
      phone: 'मोबाइल नंबर',
      state: 'राज्य',
      district: 'जिला',
      pincode: 'पिन कोड',
      loginSubmitFarmer: 'किसान लॉगिन करें',
      loginSubmitOwner: 'मालिक लॉगिन करें',
      registerSubmit: 'पंजीकरण पूरा करें',
      orContinueWith: 'या इसके साथ जारी रखें',
      orSignUpWith: 'या इसके साथ साइन अप करें',
      googleLogin: 'Google के साथ लॉगिन',
      facebookLogin: 'Facebook के साथ लॉगिन',
      googleRegister: 'Google के साथ साइन अप',
      facebookRegister: 'Facebook के साथ साइन अप',
      dontHaveAccount: 'नया खाता बनाना चाहते हैं?',
      registerNow: 'पंजीकरण करें (Register Now)',
      alreadyHaveAccount: 'पहले से खाता मौजूद है?',
      loginHere: 'यहाँ लॉगिन करें',
    },
  }[language];

  // Role selection when switching in login view
  const handleSelectLoginRole = (role: 'farmer' | 'owner') => {
    setLoginRole(role);
    setErrorMsg('');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await login(identifier, password);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials. Please verify your email or phone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      await register({
        name: regName,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        role: registerRole,
        location: { state: regState, district: regDistrict, pincode: regPincode },
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check your information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSocialAuth = async (provider: 'google' | 'facebook') => {
    setErrorMsg('');
    setIsSubmitting(true);
    setSocialProviderLoading(provider);
    try {
      const activeRole = view === 'login' ? loginRole : (registerRole as 'farmer' | 'owner');
      await socialLogin(provider, activeRole);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Social authentication error.');
    } finally {
      setIsSubmitting(false);
      setSocialProviderLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150">
      <div className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-stone-200 my-auto">
        {/* Clean Professional Header */}
        <div className="px-5 py-3.5 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-400 flex items-center justify-center">
              <Tractor className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-bold font-heading tracking-wide">
                PN<span className="text-emerald-400">agro</span>
              </div>
              <div className="text-[10px] text-emerald-300 font-medium">
                {view === 'login' ? t.signInTitle : t.createAccountTitle}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 rounded-lg hover:bg-emerald-900 text-emerald-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* -------------------- VIEW 1: LOGIN -------------------- */}
        {view === 'login' && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Top Selector: Login as Farmer | Login as Owner */}
            <div className="grid grid-cols-2 p-1 bg-stone-100 rounded-xl border border-stone-200 gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleSelectLoginRole('farmer')}
                className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  loginRole === 'farmer'
                    ? 'bg-white text-emerald-900 shadow-xs border border-stone-200/60'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>👨‍🌾</span>
                <span>{t.loginFarmer}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectLoginRole('owner')}
                className={`py-2 px-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  loginRole === 'owner'
                    ? 'bg-white text-emerald-900 shadow-xs border border-stone-200/60'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                <span>🚜</span>
                <span>{t.loginOwner}</span>
              </button>
            </div>

            {/* Quick Demo Credentials Helper */}
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-900 mb-1.5 flex items-center justify-between">
                <span>⚡ Quick Demo Credentials</span>
                <span className="text-[9px] font-normal text-emerald-700">Click to autofill</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    handleSelectLoginRole('farmer');
                    setIdentifier('farmer@pnagro.com');
                    setPassword('password123');
                  }}
                  className="px-2 py-1 bg-white hover:bg-emerald-100/80 border border-emerald-200 rounded-lg text-[10px] font-bold text-emerald-950 transition text-center truncate shadow-2xs"
                  title="Farmer: farmer@pnagro.com / password123"
                >
                  👨‍🌾 Farmer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSelectLoginRole('owner');
                    setIdentifier('gurpreet.brar@gmail.com');
                    setPassword('password123');
                  }}
                  className="px-2 py-1 bg-white hover:bg-emerald-100/80 border border-emerald-200 rounded-lg text-[10px] font-bold text-emerald-950 transition text-center truncate shadow-2xs"
                  title="Owner: gurpreet.brar@gmail.com / password123"
                >
                  🚜 Owner
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIdentifier('admin@pnagro.com');
                    setPassword('password123');
                  }}
                  className="px-2 py-1 bg-white hover:bg-amber-100/80 border border-amber-300 rounded-lg text-[10px] font-bold text-amber-950 transition text-center truncate shadow-2xs"
                  title="Admin: admin@pnagro.com / password123"
                >
                  🛡️ Admin
                </button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {/* Field 1: Email or Phone */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.emailOrPhone}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={language === 'hi' ? 'ईमेल या मोबाइल नंबर दर्ज करें' : 'Enter email or phone number'}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.password}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={language === 'hi' ? 'पासवर्ड दर्ज करें' : 'Enter password'}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white rounded-xl font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <span>Signing in...</span>
                ) : (
                  <>
                    <span>{loginRole === 'farmer' ? t.loginSubmitFarmer : t.loginSubmitOwner}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Social Login Divider */}
            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-stone-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-stone-500 uppercase tracking-wider shrink-0">
                {t.orContinueWith}
              </span>
              <div className="border-t border-stone-200 w-full" />
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSocialAuth('google')}
                disabled={isSubmitting}
                className="py-2.5 px-3 border border-stone-300 hover:border-emerald-600 bg-white hover:bg-stone-50 rounded-xl text-xs font-bold text-stone-700 transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {socialProviderLoading === 'google' ? (
                  <div className="flex items-center gap-1.5 text-emerald-800">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>{language === 'hi' ? 'Google...' : 'Signing in...'}</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.3 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.7c-.2-.7-.4-1.4-.4-2.2s.2-1.5.4-2.2L1.9 7.4C.7 9.8 0 12.4 0 15.2c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.3L1.9 16.4C3.7 20.2 7.5 23.5 12 23.5z"
                      />
                    </svg>
                    <span>Google</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSocialAuth('facebook')}
                disabled={isSubmitting}
                className="py-2.5 px-3 border border-stone-300 hover:border-blue-600 bg-white hover:bg-stone-50 rounded-xl text-xs font-bold text-stone-700 transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {socialProviderLoading === 'facebook' ? (
                  <div className="flex items-center gap-1.5 text-blue-800">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>{language === 'hi' ? 'Facebook...' : 'Signing in...'}</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook</span>
                  </>
                )}
              </button>
            </div>

            {/* Bottom Scroll / Register Callout */}
            <div className="pt-3 border-t border-stone-200 text-center">
              <p className="text-xs text-stone-600 mb-2">{t.dontHaveAccount}</p>
              <button
                type="button"
                onClick={() => {
                  setView('register');
                  setErrorMsg('');
                }}
                className="w-full py-2 border border-emerald-700 text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>{t.registerNow}</span>
              </button>
            </div>
          </div>
        )}

        {/* -------------------- VIEW 2: REGISTER -------------------- */}
        {view === 'register' && (
          <div className="p-5 sm:p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Role Selection: Register as Farmer | Register as Owner */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRegisterRole('farmer')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                  registerRole === 'farmer'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>👨‍🌾 {t.registerFarmer}</span>
                {registerRole === 'farmer' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setRegisterRole('owner')}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-between ${
                  registerRole === 'owner'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                    : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <span>🚜 {t.registerOwner}</span>
                {registerRole === 'owner' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                )}
              </button>
            </div>

            {/* Register Form */}
            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.fullName}
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder={language === 'hi' ? 'पूरा नाम दर्ज करें' : 'Enter full name'}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.email}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder={language === 'hi' ? 'ईमेल पता दर्ज करें' : 'name@example.com'}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.phone}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder={language === 'hi' ? '10 अंकों का मोबाइल नंबर' : '10-digit mobile number'}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  {t.password}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* State & District Dropdowns */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.state}
                  </label>
                  <div className="relative">
                    <select
                      value={regState}
                      onChange={(e) => handleStateChange(e.target.value)}
                      className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none appearance-none font-medium cursor-pointer"
                    >
                      {ALL_INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-2.5 top-2.5 text-stone-400">
                      ▼
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    {t.district}
                  </label>
                  <div className="relative">
                    <select
                      value={regDistrict}
                      onChange={(e) => setRegDistrict(e.target.value)}
                      className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none appearance-none font-medium cursor-pointer"
                    >
                      {availableDistricts.map((dst) => (
                        <option key={dst} value={dst}>
                          {dst}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-2.5 top-2.5 text-stone-400">
                      ▼
                    </div>
                  </div>
                </div>
              </div>

              {/* Exact Location PIN Code */}
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center justify-between">
                  <span>{t.pincode}</span>
                  <span className="text-[10px] text-stone-400 font-normal">Exact 6-digit postal code</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    pattern="[0-9]{6}"
                    value={regPincode}
                    onChange={(e) => setRegPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="e.g. 141001"
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 font-mono tracking-wider focus:ring-2 focus:ring-emerald-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Registration Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 active:scale-[0.99] text-white rounded-xl font-bold text-xs shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-1.5 pt-2.5"
              >
                {isSubmitting ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <span>{registerRole === 'farmer' ? t.registerFarmer : t.registerOwner}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Social Signup Divider */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-stone-200 w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold text-stone-500 uppercase tracking-wider shrink-0">
                {t.orSignUpWith}
              </span>
              <div className="border-t border-stone-200 w-full" />
            </div>

            {/* Social Sign up Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleSocialAuth('google')}
                disabled={isSubmitting}
                className="py-2.5 px-3 border border-stone-300 hover:border-emerald-600 bg-white hover:bg-stone-50 rounded-xl text-xs font-bold text-stone-700 transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {socialProviderLoading === 'google' ? (
                  <div className="flex items-center gap-1.5 text-emerald-800">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>{language === 'hi' ? 'Google...' : 'Signing up...'}</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#EA4335"
                        d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.3 9 5 12 5z"
                      />
                      <path
                        fill="#4285F4"
                        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.6 14.7c-.2-.7-.4-1.4-.4-2.2s.2-1.5.4-2.2L1.9 7.4C.7 9.8 0 12.4 0 15.2c0 2.8.7 5.4 1.9 7.8l3.7-2.9z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.3L1.9 16.4C3.7 20.2 7.5 23.5 12 23.5z"
                      />
                    </svg>
                    <span>Google</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSocialAuth('facebook')}
                disabled={isSubmitting}
                className="py-2.5 px-3 border border-stone-300 hover:border-blue-600 bg-white hover:bg-stone-50 rounded-xl text-xs font-bold text-stone-700 transition flex items-center justify-center gap-2 shadow-2xs cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {socialProviderLoading === 'facebook' ? (
                  <div className="flex items-center gap-1.5 text-blue-800">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>{language === 'hi' ? 'Facebook...' : 'Signing up...'}</span>
                  </div>
                ) : (
                  <>
                    <svg className="w-4 h-4 fill-[#1877F2] shrink-0" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook</span>
                  </>
                )}
              </button>
            </div>

            {/* Back to Login Link */}
            <div className="pt-2 text-center border-t border-stone-200">
              <button
                type="button"
                onClick={() => {
                  setView('login');
                  setErrorMsg('');
                }}
                className="text-xs text-emerald-800 hover:text-emerald-950 font-bold"
              >
                {t.alreadyHaveAccount} <span className="underline">{t.loginHere}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
