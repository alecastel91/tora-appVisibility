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
      {/* Centered + z-index above every overlay (likes often happen from the
          full-screen ViewProfile, which must not cover the toast). Tap to
          dismiss early. */}
      <div className="pointer-events-none fixed inset-0 z-[9999] flex items-center justify-center px-6">
        <div
          className="pointer-events-auto max-w-sm rounded-2xl border border-[#FFD54A]/60 bg-[#FFB800]/95 px-5 py-3.5 text-center text-[14px] font-medium leading-snug text-black/90 shadow-2xl backdrop-blur-md"
          onClick={() => setToast(null)}
        >
          {t(toast.key, toast.params)}
        </div>
      </div>
    </OverlayPortal>
  );
};

export default ToastHost;
