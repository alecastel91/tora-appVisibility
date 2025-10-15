import React from 'react';
import { ProfileIcon, SearchIcon, EyeIcon, MessageIcon, MatchesIcon } from '../../utils/icons';
import { useLanguage } from '../../contexts/LanguageContext';

const TabBar = ({ activeTab, onTabChange }) => {
  const { t } = useLanguage();

  const tabs = [
    { id: 'profile', icon: ProfileIcon, label: t('nav.profile') },
    { id: 'search', icon: SearchIcon, label: t('nav.search') },
    { id: 'matches', icon: MatchesIcon, label: t('nav.matches') },
    { id: 'explore', icon: EyeIcon, label: t('nav.explore') },
    { id: 'messages', icon: MessageIcon, label: t('nav.messages') }
  ];

  return (
    <nav className="tab-bar">
      {tabs.map(tab => {
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            className={`tab-item ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default TabBar;