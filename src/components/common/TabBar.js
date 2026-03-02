import React from 'react';
import { ProfileIcon, SearchIcon, BookingsIcon, MessageIcon, PlaneIcon } from '../../utils/icons';
import { useLanguage } from '../../contexts/LanguageContext';

const TabBar = ({ activeTab, onTabChange, unreadMessagesCount = 0, unreadProposalsCount = 0 }) => {
  const { t } = useLanguage();

  const tabs = [
    { id: 'profile', icon: ProfileIcon, label: t('nav.profile') },
    { id: 'search', icon: SearchIcon, label: t('nav.search') },
    { id: 'tour', icon: PlaneIcon, label: 'Tour' },
    { id: 'bookings', icon: BookingsIcon, label: t('nav.bookings') },
    { id: 'messages', icon: MessageIcon, label: t('nav.messages') }
  ];

  return (
    <nav className="tab-bar">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const showMessagesBadge = tab.id === 'messages' && unreadMessagesCount > 0;
        const showTourBadge = tab.id === 'tour' && unreadProposalsCount > 0;
        const badgeCount = tab.id === 'messages' ? unreadMessagesCount : unreadProposalsCount;
        return (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <div className="tab-icon-wrapper">
              <Icon />
              {(showMessagesBadge || showTourBadge) && (
                <span className="tab-badge">{badgeCount > 99 ? '99+' : badgeCount}</span>
              )}
            </div>
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default TabBar;