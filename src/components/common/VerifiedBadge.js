import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../contexts/LanguageContext';

// Verified identity seal. Tap opens the explainer, whose claim stays
// deliberately modest — and has to name the proof that ACTUALLY passed:
// telling a promoter an agency confirmed an Instagram account when it proved
// a company domain (or was confirmed by an artist) is simply false.
const EXPLAINER_BY_CHANNEL = {
  email_domain: 'verify.badgeExplainerDomain',
  artist_vouch: 'verify.badgeExplainerVouch',
  instagram_dm: 'verify.badgeExplainer',
};

const VerifiedBadge = ({ size = 16, className = '', channel = null }) => {
  const { t } = useLanguage();
  const [showExplainer, setShowExplainer] = useState(false);

  return (
    <>
      <button
        type="button"
        aria-label={t('verify.badgeAria')}
        onClick={(e) => { e.stopPropagation(); setShowExplainer(true); }}
        className={`inline-flex items-center justify-center align-middle bg-transparent border-none p-0 cursor-pointer text-infrared ${className}`}
      >
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" stroke="none">
          <path d="M12 1.5l2.6 2.1 3.3-.4 1.2 3.1 3 1.6-.9 3.2.9 3.2-3 1.6-1.2 3.1-3.3-.4-2.6 2.1-2.6-2.1-3.3.4-1.2-3.1-3-1.6.9-3.2-.9-3.2 3-1.6 1.2-3.1 3.3.4z" />
          <path d="M9 12.2l2.1 2.1 4-4.4" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {showExplainer && createPortal(
        <div
          className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/70 p-6"
          onClick={(e) => { e.stopPropagation(); setShowExplainer(false); }}
        >
          <div
            className="max-w-sm w-full rounded-2xl border border-white/10 bg-[#131315]/95 backdrop-blur-xl p-5 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2.5 mb-3">
              <span className="text-infrared">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                  <path d="M12 1.5l2.6 2.1 3.3-.4 1.2 3.1 3 1.6-.9 3.2.9 3.2-3 1.6-1.2 3.1-3.3-.4-2.6 2.1-2.6-2.1-3.3.4-1.2-3.1-3-1.6.9-3.2-.9-3.2 3-1.6 1.2-3.1 3.3.4z" />
                  <path d="M9 12.2l2.1 2.1 4-4.4" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <h3 className="m-0 text-[15px] font-semibold text-white font-space-grotesk uppercase tracking-[0.08em]">{t('verify.badgeTitle')}</h3>
            </div>
            <p className="m-0 text-sm leading-relaxed text-white/70">
              {t(EXPLAINER_BY_CHANNEL[channel] || 'verify.badgeExplainerGeneric')}
            </p>
            <button
              type="button"
              className="btn btn-outline w-full mt-4"
              onClick={() => setShowExplainer(false)}
            >
              {t('verify.gotIt')}
            </button>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default VerifiedBadge;
