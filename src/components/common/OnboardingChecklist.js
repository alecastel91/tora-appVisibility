import React, { useState } from 'react';
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

  if (!user?.id) return null;
  const dismissKey = `tora:checklist-dismissed:${user.id}`;
  if (localStorage.getItem(dismissKey)) return null;

  const goTab = (tab) => window.dispatchEvent(new CustomEvent('tora:navigate-tab', { detail: { tab } }));

  const items = [
    {
      key: 'completeProfile',
      done: !!(user.avatar && user.bio),
      go: () => goTab('profile'),
    },
    {
      key: 'setAvailability',
      done: (user.availableDates || []).length > 0,
      go: () => goTab('profile'),
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
      go: () => goTab('tour'),
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
