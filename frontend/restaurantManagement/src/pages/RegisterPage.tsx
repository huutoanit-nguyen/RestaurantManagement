import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2, Check, AlertCircle } from 'lucide-react';
import { authApi, session } from '../api/auth';

const PHONE_REGEX = /^0\d{9}$/;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<{ message: string; isConflict?: boolean } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Realtime password checklist
  const passwordRules = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
    };
  }, [password]);

  const isPasswordValid =
    passwordRules.minLength &&
    passwordRules.hasUpper &&
    passwordRules.hasLower &&
    passwordRules.hasNumber;

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!fullName.trim()) {
      errors.fullName = 'Full name cannot be empty';
    }

    if (!phone.trim()) {
      errors.phone = 'Phone number cannot be empty';
    } else if (!PHONE_REGEX.test(phone.trim())) {
      errors.phone = 'Phone number must be 10 digits starting with 0';
    }

    if (!password) {
      errors.password = 'Please enter a password';
    } else if (!isPasswordValid) {
      errors.password = 'Password must meet all 4 conditions below';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const trimmedPhone = phone.trim();
      const trimmedName = fullName.trim();

      const res = await authApi.register({
        phone: trimmedPhone,
        password,
        fullName: trimmedName,
      });

      // Save credentials into session
      session.save(res);

      navigate('/onboarding', { replace: true });
    } catch (err: any) {
      if (err.status === 409) {
        setServerError({
          message: 'Phone number is already registered',
          isConflict: true,
        });
      } else if (err.status === 400) {
        setServerError({
          message: err.message || 'Invalid input data. Please check again.',
        });
      } else {
        setServerError({
          message: err.message || 'Registration failed. Please check your connection and try again.',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F8F5] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center justify-center group mb-4">
          <img src="/logo-resmana.png" alt="ResMana" className="h-10 w-auto object-contain hover:scale-105 transition-transform" />
        </Link>
        <h2 className="text-2xl font-extrabold text-[#202923] tracking-tight">
          Create your account
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Start managing your restaurant easily in just a few steps
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-8 shadow-xl sm:rounded-2xl border border-gray-100">
          {/* Server Error Alert */}
          {serverError && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5 text-red-500" />
              <div className="flex-1">
                <p className="font-medium">{serverError.message}</p>
                {serverError.isConflict && (
                  <p className="mt-1 text-xs">
                    Do you already have an account with this number?{' '}
                    <Link to="/login" className="font-bold underline text-red-800 hover:text-red-900">
                      Sign in now
                    </Link>
                  </p>
                )}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Full name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (formErrors.fullName) setFormErrors((prev) => ({ ...prev, fullName: '' }));
                }}
                placeholder="e.g. Jamie Davis"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 bg-[#F7F8F5]/60 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#52735B] focus:bg-white transition ${
                  formErrors.fullName ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                }`}
              />
              {formErrors.fullName && (
                <p className="mt-1 text-xs text-red-500">{formErrors.fullName}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Phone number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (formErrors.phone) setFormErrors((prev) => ({ ...prev, phone: '' }));
                }}
                placeholder="0901234567"
                maxLength={10}
                className={`w-full px-4 py-2.5 rounded-xl border text-sm text-gray-800 bg-[#F7F8F5]/60 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#52735B] focus:bg-white transition ${
                  formErrors.phone ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                }`}
              />
              {formErrors.phone && (
                <p className="mt-1 text-xs text-red-500">{formErrors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (formErrors.password) setFormErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm text-gray-800 bg-[#F7F8F5]/60 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#52735B] focus:bg-white transition ${
                    formErrors.password ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-1 text-xs text-red-500">{formErrors.password}</p>
              )}

              {/* Realtime password rules */}
              <div className="mt-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 grid grid-cols-2 gap-2 text-xs">
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordRules.minLength ? 'text-emerald-600 font-medium' : 'text-gray-400'
                  }`}
                >
                  <Check size={14} className={passwordRules.minLength ? 'text-emerald-500' : 'text-gray-300'} />
                  <span>8+ characters</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordRules.hasUpper ? 'text-emerald-600 font-medium' : 'text-gray-400'
                  }`}
                >
                  <Check size={14} className={passwordRules.hasUpper ? 'text-emerald-500' : 'text-gray-300'} />
                  <span>Uppercase</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordRules.hasLower ? 'text-emerald-600 font-medium' : 'text-gray-400'
                  }`}
                >
                  <Check size={14} className={passwordRules.hasLower ? 'text-emerald-500' : 'text-gray-300'} />
                  <span>Lowercase</span>
                </div>
                <div
                  className={`flex items-center gap-1.5 ${
                    passwordRules.hasNumber ? 'text-emerald-600 font-medium' : 'text-gray-400'
                  }`}
                >
                  <Check size={14} className={passwordRules.hasNumber ? 'text-emerald-500' : 'text-gray-300'} />
                  <span>Number</span>
                </div>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Confirm password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (formErrors.confirmPassword) setFormErrors((prev) => ({ ...prev, confirmPassword: '' }));
                  }}
                  placeholder="••••••••"
                  className={`w-full px-4 py-2.5 pr-11 rounded-xl border text-sm text-gray-800 bg-[#F7F8F5]/60 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#52735B] focus:bg-white transition ${
                    formErrors.confirmPassword ? 'border-red-400 bg-red-50/20' : 'border-gray-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {formErrors.confirmPassword && (
                <p className="mt-1 text-xs text-red-500">{formErrors.confirmPassword}</p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-[#202923] text-[#C7F4A4] text-sm font-bold hover:bg-[#52735B] hover:text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          {/* Footer note */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#52735B] hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;

