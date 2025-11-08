import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import apiService from '../../services/api';

const ChatScreen = ({ user, onClose, onOpenProfile }) => {
  const { user: currentUser, sendMessage } = useAppContext();
  const { t } = useLanguage();
  const [inputMessage, setInputMessage] = useState('');
  const [userMessages, setUserMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch messages when component mounts
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUser || !currentUser._id || !user || !user._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiService.getMessageThread(currentUser._id, user._id);

        // Transform backend messages to match the format expected by the UI
        const transformedMessages = (response.messages || []).map(msg => ({
          text: msg.text,
          timestamp: msg.createdAt,
          isMe: msg.from._id === currentUser._id,
          isSystem: false
        }));

        setUserMessages(transformedMessages);
      } catch (error) {
        console.error('Error fetching messages:', error);
        setUserMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [currentUser, user]);

  useEffect(() => {
    scrollToBottom();
    inputRef.current?.focus();
  }, [userMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (inputMessage.trim()) {
      try {
        // Send message to backend
        await sendMessage(user._id, inputMessage);

        // Clear input
        setInputMessage('');

        // Refresh messages
        const response = await apiService.getMessageThread(currentUser._id, user._id);
        const transformedMessages = (response.messages || []).map(msg => ({
          text: msg.text,
          timestamp: msg.createdAt,
          isMe: msg.from._id === currentUser._id,
          isSystem: false
        }));
        setUserMessages(transformedMessages);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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

  const formatMessageTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
  };

  const shouldShowDateSeparator = (currentMsg, prevMsg) => {
    if (!prevMsg) return true;
    const currentDate = new Date(currentMsg.timestamp).toDateString();
    const prevDate = new Date(prevMsg.timestamp).toDateString();
    return currentDate !== prevDate;
  };

  const formatDateSeparator = (timestamp) => {
    const msgDate = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (msgDate.toDateString() === today.toDateString()) {
      return t('messages.today');
    } else if (msgDate.toDateString() === yesterday.toDateString()) {
      return t('messages.yesterday');
    } else {
      // Get localized day and month names
      const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
      
      const weekday = t(`dateFormat.${weekdays[msgDate.getDay()]}`);
      const month = t(`dateFormat.${months[msgDate.getMonth()]}`);
      const day = msgDate.getDate();
      
      return `${weekday}, ${month} ${day}`;
    }
  };

  return (
    <div className="chat-screen active">
      <div className="chat-header">
        <button className="back-btn" onClick={onClose}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <div
          className="chat-user-info"
          onClick={() => {
            if (!(user.isDeleted || user.deleted) && onOpenProfile) {
              onOpenProfile(user);
            }
          }}
          style={{ cursor: user.isDeleted || user.deleted ? 'default' : 'pointer' }}
        >
          <div className={`chat-avatar ${user.isDeleted || user.deleted ? 'avatar-deleted' : getAvatarClass(user.role)}`}>
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              getInitial(user.name)
            )}
          </div>
          <div className="chat-user-details">
            <h3 style={{ color: user.isDeleted || user.deleted ? '#888' : 'inherit' }}>{user.name}</h3>
            <span className="chat-role" style={{ color: user.isDeleted || user.deleted ? '#888' : 'inherit' }}>{user.role}</span>
            <span className="chat-location">{user.location}</span>
          </div>
        </div>
      </div>

      {/* Banner for deleted profiles */}
      {(user.isDeleted || user.deleted) && (
        <div className="chat-deleted-banner">
          <span>This profile is no longer active</span>
        </div>
      )}

      <div className="chat-messages">
        {userMessages.length === 0 && (
          <div className="chat-empty">
            <p>{t('messages.startConversationWith')} {user.name}</p>
            <span>{t('messages.sendMessageToBegin')}</span>
          </div>
        )}
        {userMessages.map((msg, index) => (
          <React.Fragment key={index}>
            {shouldShowDateSeparator(msg, userMessages[index - 1]) && (
              <div className="date-separator">
                <span>{formatDateSeparator(msg.timestamp)}</span>
              </div>
            )}
            {msg.isSystem ? (
              <div className="message-system">
                <p>{msg.text}</p>
              </div>
            ) : (
              <div className={`message ${msg.isMe ? 'message-sent' : 'message-received'}`}>
                {!msg.isMe && index === 0 || (index > 0 && userMessages[index - 1].isMe !== msg.isMe) ? (
                  <div className="message-group">
                    <div className="message-bubble">
                      <p>{msg.text}</p>
                      <span className="message-time">{formatMessageTime(msg.timestamp)}</span>
                    </div>
                  </div>
                ) : (
                  <div className="message-bubble">
                    <p>{msg.text}</p>
                    <span className="message-time">{formatMessageTime(msg.timestamp)}</span>
                  </div>
                )}
              </div>
            )}
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {!(user.isDeleted || user.deleted) ? (
        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <input
              ref={inputRef}
              type="text"
              placeholder={t('messages.writeYourMessage')}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="chat-input"
            />
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!inputMessage.trim()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      ) : (
        <div className="chat-input-disabled">
          <p>You cannot send messages to inactive profiles</p>
        </div>
      )}
    </div>
  );
};

export default ChatScreen;