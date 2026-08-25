import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getPushState, enablePush } from '../../services/push';

const DISMISS_KEY = 'tora-push-nudge-dismissed';

/**
 * Soft-ask card for notifications: shown once, contextually (Messages tab),
 * never fires the native permission prompt without a tap. On iOS in the
 * browser it becomes Add-to-Home-Screen guidance, since installed apps are
 * the only place iOS allows web push.
 */
const PushNudge = () => {
  const { t } = useLanguage();
  const [state, setState] = useState(null); // null = checking / hidden

  useEffect(() => {
    if (localStorage.getItem(DISMISS_KEY)) return;
    let alive = true;
    getPushState().then((s) => {
      if (alive && (s === 'ready' || s === 'ios-needs-install')) setState(s);
    });
    return () => { alive = false; };
  }, []);

  if (!state) return null;

  const dismiss = () => { localStorage.setItem(DISMISS_KEY, '1'); setState(null); };

  const enable = async () => {
    try {
      const next = await enablePush();
      if (next === 'subscribed') dismiss();
      else setState(null); // denied or dismissed at the native prompt — don't nag
    } catch { setState(null); }
  };

  return (
    <div className="mx-4 mt-4 mb-3 rounded-xl border border-white/10 bg-white/[0.04] p-4">
      <p className="m-0 text-sm font-semibold text-white">{t('push.title')}</p>
      <p className="m-0 mt-1 text-xs leading-relaxed text-white/60">
        {state === 'ios-needs-install' ? t('push.iosInstallHint') : t('push.body')}
      </p>
      <div className="mt-3 flex gap-2">
        {state === 'ready' && (
          <button type="button" className="btn btn-primary btn-sm" onClick={enable}>
            {t('push.enable')}
          </button>
        )}
        <button type="button" className="btn btn-secondary btn-sm" onClick={dismiss}>
          {t('push.later')}
        </button>
      </div>
    </div>
  );
};

export default PushNudge;
