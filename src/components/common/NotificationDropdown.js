import React from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAppContext } from '../../contexts/AppContext';

const NotificationDropdown = ({ onClose, onClearNotifications }) => {
  const { t } = useLanguage();
  const { notifications } = useAppContext();

  // Helper to format time ago
  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const notifTime = new Date(timestamp);
    const diffMs = now - notifTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('notifications.justNow') || 'Just now';
    if (diffMins < 60) return `${diffMins} ${t('notifications.minAgo') || 'min ago'}`;
    if (diffHours < 24) return `${diffHours} ${t('notifications.hourAgo') || 'h ago'}`;
    return `${diffDays} ${t('notifications.daysAgo') || 'd ago'}`;
  };

  return (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <span>{t('notifications.title')}</span>
        <button onClick={onClearNotifications}>{t('notifications.clearAll')}</button>
      </div>
      <div className="notifications-list">
        {notifications && notifications.length > 0 ? (
          notifications.map(notif => (
            <div key={notif._id || notif.id} className="notification-item">
              <p>{notif.message || notif.text}</p>
              <span className="notification-time">{getTimeAgo(notif.createdAt || notif.timestamp)}</span>
            </div>
          ))
        ) : (
          <div className="notification-item empty">
            <p>{t('notifications.noNotifications') || 'No notifications'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;