import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import OverlayPortal from './OverlayPortal';
import { isStandalone, isIos, canPromptInstall, promptInstall, onInstallAvailabilityChange } from '../../services/install';

const DISMISS_KEY = 'tora-install-dismissed';

// Same beta-surface detection as vite.config.js — show the BETA-badged icon
// the user will actually get on their home screen.
const ICON = (import.meta.env.VITE_API_URL || '').includes('-2424')
  ? '/pwa-beta-192.png' : '/pwa-192.png';

/**
 * First-run "Get the TORA app" bottom sheet — shown right after signup/login
 * while the user is still in the browser. Android/desktop Chromium gets the
 * REAL one-tap native install (captured beforeinstallprompt); iOS gets the
 * two-step Add-to-Home-Screen instructions Apple mandates. Never shown in
 * the installed app; "Not now" is remembered per device.
 */
const InstallSheet = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);
  const [nativeReady, setNativeReady] = useState(canPromptInstall());

  useEffect(() => {
    if (isStandalone() || localStorage.getItem(DISMISS_KEY)) return undefined;
    // Small beat so the app paints first — the sheet should feel like a
    // welcome, not a roadblock.
    const timer = setTimeout(() => setVisible(true), 900);
    const off = onInstallAvailabilityChange(() => setNativeReady(canPromptInstall()));
    return () => { clearTimeout(timer); off(); };
  }, []);

  if (!visible) return null;

  const dismiss = () => { localStorage.setItem(DISMISS_KEY, '1'); setVisible(false); };

  const install = async () => {
    const accepted = await promptInstall();
    if (accepted) setVisible(false); // appinstalled follows; no dismiss flag —
    else dismiss();                  // declining the native dialog = not now
  };

  return (
    <OverlayPortal>
      <div className="message-modal-overlay" onClick={dismiss}>
        <div className="message-modal-bottom" onClick={(e) => e.stopPropagation()}>
          <img src={ICON} alt="" className="mx-auto mb-3 h-14 w-14 rounded-[14px]" />
          <h2 className="message-modal-title">{t('install.title')}</h2>
          <p className="m-0 mb-4 text-center text-[13px] leading-relaxed text-white/60">
            {t('install.subtitle')}
          </p>

          {isIos() && !nativeReady ? (
            <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-[13px] leading-relaxed text-white/75">
              <p className="m-0">
                <span className="font-semibold text-white">1.</span> {t('install.ios1')}
              </p>
              <p className="m-0 mt-2">
                <span className="font-semibold text-white">2.</span> {t('install.ios2')}
              </p>
            </div>
          ) : nativeReady ? (
            <button className="btn btn-primary btn-full mb-2" onClick={install}>
              {t('install.cta')}
            </button>
          ) : (
            // Chromium without a captured prompt (already installed elsewhere,
            // or an unsupported in-app browser): show the generic path.
            <div className="mb-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 text-[13px] leading-relaxed text-white/75">
              <p className="m-0">{t('install.genericHint')}</p>
            </div>
          )}

          <button className="btn btn-secondary btn-full" onClick={dismiss}>
            {t('install.later')}
          </button>
        </div>
      </div>
    </OverlayPortal>
  );
};

export default InstallSheet;
