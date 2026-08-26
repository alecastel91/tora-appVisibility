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
      timerRef.current = setTimeout(() => setToast(null), 4000);
    };
    window.addEventListener('tora:toast', onToast);
    return () => { window.removeEventListener('tora:toast', onToast); clearTimeout(timerRef.current); };
  }, []);

  if (!toast) return null;

  return (
    <OverlayPortal>
      <div
        className="pointer-events-none fixed inset-x-0 z-[1200] flex justify-center px-6"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 84px)' }}
      >
        <div className="pointer-events-auto max-w-sm rounded-full border border-white/15 bg-[#101015]/95 px-4 py-2.5 text-center text-[13px] leading-snug text-white/90 shadow-lg backdrop-blur-md">
          {t(toast.key, toast.params)}
        </div>
      </div>
    </OverlayPortal>
  );
};

export default ToastHost;
