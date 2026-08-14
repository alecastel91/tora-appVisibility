import React, { useState } from 'react';
import AuthScreenShell from '../common/AuthScreenShell';
import apiService from '../../services/api';
import { useLanguage } from '../../contexts/LanguageContext';

const ForgotPasswordScreen = ({ onBackToLogin }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);
    try {
      await apiService.forgotPassword(email);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || t('auth.somethingWentWrong'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthScreenShell subtitle={t('auth.resetYourPassword')}>
      {submitted ? (
        <div className="bg-transparent">
          <div className="bg-white/5 border border-white/10 rounded-lg px-5 py-6 mb-6 text-white text-[14px] leading-relaxed">
            {t('auth.resetLinkSentBefore')} <strong>{email}</strong>{t('auth.resetLinkSentAfter')}
          </div>
          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full py-3.5 bg-infrared/[0.08] border border-infrared/45 rounded-xl text-white text-[11px] font-semibold uppercase tracking-[0.15em] font-tech cursor-pointer transition-all duration-300 hover:bg-infrared/15 hover:border-infrared/70 active:scale-[0.98]"
          >
            {t('auth.backToLogin')}
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-transparent">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-lg px-4 py-3 mb-6 text-red-400 text-[13px] leading-relaxed">
              {error}
            </div>
          )}

          <p className="text-gray-400 text-[13px] leading-relaxed mb-6">
            {t('auth.forgotIntro')}
          </p>

          <div className="mb-6">
            <input
              type="email"
              name="email"
              placeholder={t('auth.email')}
              aria-label={t('auth.email')}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 bg-[#0a0a0e] border border-white/10 rounded-xl text-white text-sm placeholder:text-white/35 focus:outline-none focus:border-infrared/60 focus:bg-[#0c0c11] transition-colors duration-300"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-infrared/[0.08] border border-infrared/45 rounded-xl text-white text-[11px] font-semibold uppercase tracking-[0.15em] font-tech cursor-pointer transition-all duration-300 hover:bg-infrared/15 hover:border-infrared/70 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.sending') : t('auth.sendResetLink')}
          </button>

          <div className="text-center mt-5 text-[13px] font-normal">
            <button
              type="button"
              onClick={onBackToLogin}
              className="text-gray-400 hover:text-white underline bg-transparent border-none cursor-pointer font-normal transition-colors duration-200"
            >
              {t('auth.backToLogin')}
            </button>
          </div>
        </form>
      )}
    </AuthScreenShell>
  );
};

export default ForgotPasswordScreen;
