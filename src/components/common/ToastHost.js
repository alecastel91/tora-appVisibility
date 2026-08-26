import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import OverlayPortal from './OverlayPortal';

/**
 * Renders showToast() messages: one glass pill above the tab bar, newest
 * replaces current, auto-dismisses. Mounted once in App.js.
 */
const ToastHost = () => {
  const { t } = useLanguage();
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const onToast = (e) => {
      setToast(e.detail);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setToast(null), 5000);
    };
    window.addEventListener('tora:toast', onToast);
    return () => { window.removeEventListener('tora:toast', onToast); clearTimeout(timerRef.current); };
  }, []);

  if (!toast) return null;

  return (
    <OverlayPortal>
      {/* Bottom pill above the tab bar; z-index above every overlay (likes
          often happen from the full-screen ViewProfile, which must not cover
          the toast). Infrared like the heart it reacts to. Tap to dismiss. */}
      <div
        className="pointer-events-none fixed inset-x-0 z-[9999] flex justify-center px-6"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 84px)' }}
      >
        <div
          className="pointer-events-auto max-w-sm rounded-full border border-[#FF3366]/50 bg-[#1a1016]/95 px-5 py-3 text-center text-[13px] font-medium leading-snug text-[#FF6B8E] shadow-2xl backdrop-blur-md"
          onClick={() => setToast(null)}
        >
          {t(toast.key, toast.params)}
        </div>
      </div>
    </OverlayPortal>
  );
};

export default ToastHost;
