import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import apiService from '../../services/api';

const MessagesScreen = ({ onOpenChat }) => {
  const { user, getConversations, acceptRequest, declineRequest } = useAppContext();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState([]);
  const [connectionRequests, setConnectionRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('messages'); // 'messages' or 'requests'
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false); // Track if data is loaded

  // Function to fetch all data
  const fetchData = async () => {
    if (!user || !user._id) {
      setLoading(false);
      return;
    }

    if (loading) return; // Prevent duplicate fetches

    try {
      setLoading(true);

      // OPTIMIZED: Fetch both in parallel
      const [convos, requestsData] = await Promise.all([
        getConversations(),
        apiService.getReceivedRequests(user._id)
      ]);

      setConversations(convos);
      setConnectionRequests(requestsData.requests || []);
      setDataLoaded(true);
    } catch (error) {
      console.error('Error fetching messages data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if not already loaded or user changed
    if (!dataLoaded || conversations.length === 0) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]);

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

  if (loading) {
    return (
      <div className="screen active messages-screen">
        <div className="empty-state">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen active messages-screen">
      {/* Tab Navigation */}
      <div className="messages-tabs">
        <button
          className={`messages-tab ${activeTab === 'messages' ? 'active' : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          Messages
          {(() => {
            const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
            return totalUnread > 0 && <span className="tab-count">{totalUnread}</span>;
          })()}
        </button>
        <button
          className={`messages-tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          Requests
          {connectionRequests.length > 0 && (
            <span className="tab-count">{connectionRequests.length}</span>
          )}
        </button>
      </div>

      <div className="messages-list">
        {activeTab === 'messages' ? (
          // Messages Tab
          conversations.length > 0 ? (
            conversations.map(conv => {
              const isDeleted = conv.profile.isDeleted || false;
              return (
                <div
                  key={conv.profile._id || conv.profile.id}
                  className={`message-card ${conv.unreadCount > 0 ? 'unread' : ''} ${isDeleted ? 'deleted-profile' : ''}`}
                  onClick={() => onOpenChat && onOpenChat(conv.profile)}
                >
                  <div className={`message-avatar ${isDeleted ? 'avatar-deleted' : getAvatarClass(conv.profile.role)}`}>
                    {conv.profile.avatar && !isDeleted ? (
                      <img src={conv.profile.avatar} alt={conv.profile.name} />
                    ) : (
                      getInitial(conv.profile.name)
                    )}
                  </div>
                  <div className="message-content">
                    <div className="message-info">
                      <h3 style={{
                        fontWeight: conv.unreadCount > 0 ? 'bold' : 'normal',
                        color: isDeleted ? '#888' : 'inherit'
                      }}>
                        {conv.profile.name}
                      </h3>
                      <p
                        className="message-preview"
                        style={{
                          fontWeight: conv.unreadCount > 0 ? 'bold' : 'normal',
                          color: isDeleted ? '#888' : 'inherit'
                        }}
                      >
                        {conv.lastMessage.text}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                      <span className="message-time">{getTimeAgo(conv.lastMessage.createdAt)}</span>
                      {conv.unreadCount > 0 && (
                        <span className="unread-badge">{conv.unreadCount}</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="empty-state">
              <p>{t('messages.noMessages')}</p>
            </div>
          )
        ) : (
          // Requests Tab
          connectionRequests.length > 0 ? (
            connectionRequests.map(request => (
              <div
                key={request.requestId}
                className="message-card request-card"
                onClick={() => onOpenChat && onOpenChat(request.profile)}
              >
                <div className={`message-avatar ${getAvatarClass(request.profile.role)}`}>
                  {request.profile.avatar ? (
                    <img src={request.profile.avatar} alt={request.profile.name} />
                  ) : (
                    getInitial(request.profile.name)
                  )}
                </div>
                <div className="message-content">
                  <div className="message-info">
                    <h3>{request.profile.name}</h3>
                    <p className="message-preview">
                      {request.message || 'Connection request pending'}
                    </p>
                  </div>
                  <div className="request-actions">
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await acceptRequest(request.requestId);
                        await fetchData(); // Refresh the requests list
                      }}
                    >
                      Accept
                    </button>
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={async (e) => {
                        e.stopPropagation();
                        await declineRequest(request.requestId);
                        await fetchData(); // Refresh the requests list
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