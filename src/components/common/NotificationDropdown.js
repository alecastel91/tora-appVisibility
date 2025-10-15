import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

const NotificationDropdown = ({ onClose, onClearNotifications }) => {
  const { t } = useLanguage();
  
  const notifications = [
    { id: 1, text: `Alex Rossi ${t('notifications.likedProfile')}`, time: `2 ${t('notifications.minAgo')}` },
    { id: 2, text: `${t('notifications.bookingRequest')} Fabric London`, time: `1 ${t('notifications.hourAgo')}` },
    { id: 3, text: `Marco ${t('notifications.acceptedConnection')}`, time: `3 ${t('notifications.hoursAgo')}` }
  ];

  return (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <span>{t('notifications.title')}</span>
        <button onClick={onClearNotifications}>{t('notifications.clearAll')}</button>
      </div>
      <div className="notifications-list">
        {notifications.map(notif => (
          <div key={notif.id} className="notification-item">
            <p>{notif.text}</p>
            <span className="notification-time">{notif.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationDropdown;