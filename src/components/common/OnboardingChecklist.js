import React, { useEffect, useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * Activation checklist — five first-session actions with deep links. Completion
 * is derived from data the app already has (no new endpoints); the card
 * disappears once everything is done, or when dismissed.
 */
const OnboardingChecklist = () => {
  const { t } = useLanguage();
  const { user, likedProfiles, connectedUsers } = useAppContext();
  const [, force] = useState(0);

  // Settings → Help → "Restore checklist" clears the dismissal and re-shows.
  useEffect(() => {
    const restore = () => {
      if (user?.id) localStorage.removeItem(`tora:checklist-dismissed:${user.id}`);
      force((n) => n + 1);
    };
    window.addEventListener('tora:restore-checklist', restore);
    return () => window.removeEventListener('tora:restore-checklist', restore);
  }, [user?.id]);

  if (!user?.id) return null;
  const dismissKey = `tora:checklist-dismissed:${user.id}`;
  if (localStorage.getItem(dismissKey)) return null;

  const goTab = (tab) => window.dispatchEvent(new CustomEvent('tora:navigate-tab', { detail: { tab } }));
  // Navigate to the Profile tab, then open the exact sub-screen the action
  // needs (small delay so the mounted ProfileScreen receives the event).
  const goProfileThen = (event) => {
    goTab('profile');
    setTimeout(() => window.dispatchEvent(new CustomEvent(event)), 200);
  };
  // Land directly on the Tour Kickstart sub-tab (same intent flag ViewProfile uses).
  const goKickstart = () => {
    sessionStorage.setItem('tora:tour-kickstart-intent', '1');
    goTab('tour');
    window.dispatchEvent(new CustomEvent('tora:tour-kickstart'));
  };

  const isAgent = user.role === 'AGENT';
  const items = [
    {
      key: 'completeProfile',
      done: !!(user.avatar && user.bio),
      go: () => goProfileThen('tora:open-edit-profile'),
    },
    // Agents don't manage their own calendar — their availability lives on the
    // represented artists, so their activation step is building the roster.
    isAgent
      ? {
          key: 'addArtist',
          done: (Array.isArray(user.representingArtists) ? user.representingArtists : []).length > 0,
          go: () => goProfileThen('tora:open-roster'),
        }
      : {
          key: 'setAvailability',
          done: (user.availableDates || []).length > 0,
          go: () => goProfileThen('tora:open-manage-calendar'),
        },
    {
      key: 'likeProfiles',
      done: (likedProfiles?.size || 0) >= 3,
      go: () => goTab('search'),
    },
    {
      key: 'makeConnection',
      done: (connectedUsers?.size || 0) >= 1,
      go: () => goTab('search'),
    },
    {
      key: 'exploreTours',
      done: !!localStorage.getItem(`tora:visited-tour:${user.id}`),
      go: goKickstart,
    },
  ];

  const doneCount = items.filter((i) => i.done).length;
  if (doneCount === items.length) return null;

  const dismiss = () => {
    localStorage.setItem(dismissKey, '1');
    force((n) => n + 1);
  };

  return (
    <div className="onboarding-checklist">
      <div className="onboarding-checklist-header">
        <p className="onboarding-checklist-title">{t('onboarding.checklistTitle')}</p>
        <div className="flex items-center gap-2">
          <span className="onboarding-checklist-progress">{doneCount}/{items.length}</span>
          <button type="button" className="onboarding-checklist-dismiss" aria-label={t('common.close')} onClick={dismiss}>×</button>
        </div>
      </div>
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          className={`onboarding-check-row ${item.done ? 'done' : ''}`}
          onClick={item.done ? undefined : item.go}
          disabled={item.done}
        >
          <span className={`onboarding-check-box ${item.done ? 'checked' : ''}`}>
            {item.done ? '✓' : ''}
          </span>
          <span className="onboarding-check-label">{t(`onboarding.${item.key}`)}</span>
          {!item.done && <span className="onboarding-check-go">›</span>}
        </button>
      ))}
    </div>
  );
};

export default OnboardingChecklist;
