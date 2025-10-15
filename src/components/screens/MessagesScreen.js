import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { dummyProfiles } from '../../data/profiles';

const MessagesScreen = ({ onOpenChat }) => {
  const { messages, receivedRequests, acceptRequest, declineRequest } = useAppContext();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'requests'

  useEffect(() => {
    // Build conversations from messages
    const convos = [];
    
    // Add conversations from messages
    Object.keys(messages).forEach(userId => {
      const userMessages = messages[userId];
      if (userMessages && userMessages.length > 0) {
        const profile = dummyProfiles.find(p => p.id === parseInt(userId));
        if (profile) {
          const lastMessage = userMessages[userMessages.length - 1];
          convos.push({
            id: profile.id,
            name: profile.name,
            avatar: profile.avatar,
            role: profile.role,
            lastMessage: lastMessage.text,
            timestamp: getTimeAgo(lastMessage.timestamp),
            unread: false,
            rawTimestamp: new Date(lastMessage.timestamp),
            profile: profile
          });
        }
      }
    });

    // Sort by most recent first
    convos.sort((a, b) => b.rawTimestamp - a.rawTimestamp);
    
    setConversations(convos);
  }, [messages]);

  const getTimeAgo = (timestamp) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffMs = now - messageTime;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('messages.justNow');
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return messageTime.toLocaleDateString();
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  const getAvatarClass = (role) => {
    const roleClass = {
      'ARTIST': 'avatar-artist',
      'VENUE': 'avatar-venue',
      'PROMOTER': 'avatar-promoter',
      'AGENT': 'avatar-agent'
    };
    return roleClass[role] || 'avatar-artist';
  };

  // Get received connection requests
  const requestProfiles = Array.from(receivedRequests).map(profileId => {
    return dummyProfiles.find(p => p.id === profileId);
  }).filter(p => p);

  return (
    <div className="screen active messages-screen">
      {/* Tab Navigation */}
      <div className="messages-tabs">
        <button 
          className={`messages-tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Messages
          {conversations.length > 0 && (
            <span className="tab-count">{conversations.length}</span>
          )}
        </button>
        <button 
          className={`messages-tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Requests
          {requestProfiles.length > 0 && (
            <span className="tab-count">{requestProfiles.length}</span>
          )}
        </button>
      </div>

      <div className="messages-list">
        {activeTab === 'messages' ? (
          // Messages Tab
          conversations.length > 0 ? (
            conversations.map(conv => (
              <div 
                key={conv.id} 
                className="message-card"
                onClick={() => onOpenChat && onOpenChat(conv.profile)}
              >
                <div className={`message-avatar ${getAvatarClass(conv.role)}`}>
                  {conv.avatar ? (
                    <img src={conv.avatar} alt={conv.name} />
                  ) : (
                    getInitial(conv.name)
                  )}
                </div>
                <div className="message-content">
                  <div className="message-info">
                    <h3>{conv.name}</h3>
                    <p className="message-preview">{conv.lastMessage}</p>
                  </div>
                  <span className="message-time">{conv.timestamp}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>{t('messages.noMessages')}</p>
            </div>
          )
        ) : (
          // Requests Tab
          requestProfiles.length > 0 ? (
            requestProfiles.map(profile => (
              <div 
                key={profile.id} 
                className="message-card request-card"
                onClick={() => onOpenChat && onOpenChat(profile)}
              >
                <div className={`message-avatar ${getAvatarClass(profile.role)}`}>
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} />
                  ) : (
                    getInitial(profile.name)
                  )}
                </div>
                <div className="message-content">
                  <div className="message-info">
                    <h3>{profile.name}</h3>
                    <p className="message-preview">Connection request pending</p>
                  </div>
                  <div className="request-actions">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        acceptRequest(profile.id);
                      }}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        declineRequest(profile.id);
                      }}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No pending requests</p>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default MessagesScreen;