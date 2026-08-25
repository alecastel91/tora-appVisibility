import React, { useEffect, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { getPushState, enablePush, disablePush } from '../../services/push';

/** Settings row: master switch for push notifications on this device. */
const PushSettingsToggle = () => {
  const { t } = useLanguage();
  const [state, setState] = useState('checking');
  const [busy, setBusy] = useState(false);

  useEffect(() => { getPushState().then(setState); }, []);

  const onToggle = async (checked) => {
    if (busy) return;
    setBusy(true);
    try { setState(checked ? await enablePush() : await disablePush()); }
    catch { /* leave state as-is */ }
    finally { setBusy(false); }
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
    </div>
  );
};

export default PushSettingsToggle;
