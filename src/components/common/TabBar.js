import React from 'react';
import { ProfileIcon, SearchIcon, BookingsIcon, MessageIcon, MatchesIcon } from '../../utils/icons';
import { useLanguage } from '../../contexts/LanguageContext';

const TabBar = ({ activeTab, onTabChange, unreadMessagesCount = 0 }) => {
  const { t } = useLanguage();

  const tabs = [
    { id: 'profile', icon: ProfileIcon, label: t('nav.profile') },
    { id: 'search', icon: SearchIcon, label: t('nav.search') },
    { id: 'matches', icon: MatchesIcon, label: t('nav.matches') },
    { id: 'bookings', icon: BookingsIcon, label: t('nav.bookings') },
    { id: 'messages', icon: MessageIcon, label: t('nav.messages') }
  ];

  return (
    <nav className="tab-bar">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const showBadge = tab.id === 'messages' && unreadMessagesCount > 0;
        return (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <div className="tab-icon-wrapper">
              <Icon />
              {showBadge && (
                <span className="tab-badge">{unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}</span>
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