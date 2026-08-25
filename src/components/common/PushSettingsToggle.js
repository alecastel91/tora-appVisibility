import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import apiService from '../../services/api';
import { getPushState, enablePush, disablePush } from '../../services/push';

const CATEGORIES = ['likes', 'messages', 'connections', 'bookings', 'news'];

/**
 * Settings: master switch for push on this device, plus per-category
 * sub-toggles (account-wide — they filter the PUSH channel only; the in-app
 * bell always shows everything).
 */
const PushSettingsToggle = () => {
  const { t } = useLanguage();
  const [state, setState] = useState('checking');
  const [busy, setBusy] = useState(false);
  const [prefs, setPrefs] = useState({});

  useEffect(() => {
    getPushState().then((s) => {
      setState(s);
      if (s === 'subscribed') apiService.getPushPrefs().then((r) => setPrefs(r.prefs || {})).catch(() => {});
    });
  }, []);

  const onToggle = async (checked) => {
    if (busy) return;
    setBusy(true);
    try {
      const next = checked ? await enablePush() : await disablePush();
      setState(next);
      if (next === 'subscribed') apiService.getPushPrefs().then((r) => setPrefs(r.prefs || {})).catch(() => {});
    }
    catch { /* leave state as-is */ }
    finally { setBusy(false); }
  };

  const onCategory = (cat, enabled) => {
    const next = { ...prefs, [cat]: enabled ? undefined : false };
    if (enabled) delete next[cat];
    setPrefs(next); // optimistic
    apiService.setPushPrefs(next).catch(() =>
      // authoritative rollback — a captured `prefs` would undo unrelated
      // toggles when two rapid changes race
      apiService.getPushPrefs().then((r) => setPrefs(r.prefs || {})).catch(() => {}));
  };

  const hint =
    state === 'ios-needs-install' ? t('push.iosInstallHint')
    : state === 'denied' ? t('push.deniedHint')
    : state === 'unsupported' ? t('push.unsupportedHint')
    : null;

  const toggleable = state === 'ready' || state === 'subscribed';

  return (
    <div className="settings-item">
      <label className={`settings-toggle ${toggleable ? '' : 'settings-toggle-locked'}`}>
        <input
          type="checkbox"
          checked={state === 'subscribed'}
          disabled={!toggleable || busy}
          onChange={(e) => onToggle(e.target.checked)}
        />
        <span>{t('push.settingsToggle')}</span>
      </label>
      {hint && <p className="m-0 mt-1 text-xs text-white/50">{hint}</p>}
      {state === 'subscribed' && (
        <div className="mt-2 ml-1 flex flex-col gap-1 border-l border-white/10 pl-3">
          {CATEGORIES.map((cat) => (
            <label key={cat} className="settings-toggle">
              <input
                type="checkbox"
                checked={prefs[cat] !== false}
                onChange={(e) => onCategory(cat, e.target.checked)}
              />
              <span className="text-sm">{t(`push.cat_${cat}`)}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default PushSettingsToggle;
