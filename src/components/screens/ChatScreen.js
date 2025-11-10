import React, { useState, useRef, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import { useLanguage } from '../../contexts/LanguageContext';
import apiService from '../../services/api';
import MakeOfferModal from '../common/MakeOfferModal';

const ChatScreen = ({ user, onClose, onOpenProfile }) => {
  const { user: currentUser, sendMessage, connectedUsers } = useAppContext();
  const { t } = useLanguage();
  const [inputMessage, setInputMessage] = useState('');
  const [userMessages, setUserMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMakeOffer, setShowMakeOffer] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [showOfferDetails, setShowOfferDetails] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showCounterOfferDetails, setShowCounterOfferDetails] = useState(false);
  const [counterOfferData, setCounterOfferData] = useState(null);
  const [counterOfferMessage, setCounterOfferMessage] = useState(null);
  const [showDeclineComment, setShowDeclineComment] = useState(false);
  const [declineComment, setDeclineComment] = useState('');
  const [showOfferDeclineComment, setShowOfferDeclineComment] = useState(false);
  const [offerDeclineComment, setOfferDeclineComment] = useState('');
  const [showDeclineReasonModal, setShowDeclineReasonModal] = useState(false);
  const [declineReasonData, setDeclineReasonData] = useState(null);
  const [dealStatuses, setDealStatuses] = useState({}); // Cache deal statuses
  const [reviewData, setReviewData] = useState({
    fee: '',
    currency: 'USD',
    extras: {},
    notes: ''
  });
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Function to fetch messages (can be called externally)
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
        isSystem: msg.isSystemMessage || false,
        dealId: msg.dealId || null
      }));

      setUserMessages(transformedMessages);

      // Fetch deal statuses for all messages with dealId
      const dealIds = transformedMessages
        .filter(msg => msg.dealId)
        .map(msg => msg.dealId);

      if (dealIds.length > 0) {
        const statuses = {};
        await Promise.all(
          dealIds.map(async (dealId) => {
            try {
              const dealResponse = await apiService.getDeal(dealId, currentUser._id);
              const deal = dealResponse.deal || dealResponse;
              statuses[dealId] = {
                status: deal.status,
                declineReason: deal.declineReason,
                declinedBy: deal.declinedBy
              };
            } catch (error) {
              console.error(`Error fetching deal ${dealId}:`, error);
            }
          })
        );
        setDealStatuses(statuses);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setUserMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch messages when component mounts
  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        // Refresh messages using the same logic as fetchMessages
        await fetchMessages();
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

  const handleViewOffer = async (dealId) => {
    console.log('handleViewOffer called with dealId:', dealId);
    try {
      const response = await apiService.getDeal(dealId, currentUser._id);
      console.log('Fetched deal:', response);

      // The response might be wrapped or direct
      const deal = response.deal || response;
      console.log('Setting offer:', deal);
      console.log('setStartTime:', deal.setStartTime);
      console.log('setEndTime:', deal.setEndTime);
      console.log('extras:', deal.extras);

      setSelectedOffer(deal);
      setShowOfferDetails(true);
      console.log('Modal should now be visible');
    } catch (error) {
      console.error('Error fetching offer details:', error);
    }
  };

  const handleViewDeclineReason = async (dealId) => {
    try {
      const response = await apiService.getDeal(dealId, currentUser._id);
      const deal = response.deal || response;
      setDeclineReasonData(deal);
      setShowDeclineReasonModal(true);
    } catch (error) {
      console.error('Error fetching decline reason:', error);
    }
  };

  const handleAcceptOffer = async () => {
    if (!selectedOffer) return;

    try {
      await apiService.acceptDeal(selectedOffer._id, currentUser._id);
      setShowOfferDetails(false);
      setSelectedOffer(null);
      // Refresh messages to show updated status
      fetchMessages();
    } catch (error) {
      console.error('Error accepting offer:', error);
      alert(error.message || 'Failed to accept offer');
    }
  };

  const handleDeclineOffer = async () => {
    if (!selectedOffer) return;

    if (!offerDeclineComment.trim()) {
      alert('Please provide a reason for declining');
      return;
    }

    try {
      // Decline deal with reason - this will update the deal status
      await apiService.declineDeal(selectedOffer._id, currentUser._id, offerDeclineComment);

      setShowOfferDetails(false);
      setShowOfferDeclineComment(false);
      setOfferDeclineComment('');
      setSelectedOffer(null);
      // Refresh messages to show updated status
      fetchMessages();
    } catch (error) {
      console.error('Error declining offer:', error);
      alert(error.message || 'Failed to decline offer');
    }
  };

  const handleOpenReview = () => {
    console.log('handleOpenReview called', selectedOffer);
    if (!selectedOffer) {
      console.log('No selected offer');
      return;
    }

    // Pre-fill review form with current offer values
    const newReviewData = {
      fee: selectedOffer.currentFee || '',
      currency: selectedOffer.currency || 'USD',
      extras: selectedOffer.extras || {},
      notes: ''
    };
    console.log('Setting review data:', newReviewData);
    setReviewData(newReviewData);
    console.log('Opening review modal');
    setShowReviewModal(true);
  };

  const handleViewCounterOffer = (msg) => {
    // Parse the counter-offer message
    const messageText = msg.text;
    const lines = messageText.split('\n');
    const parsed = {
      fee: '',
      currency: '',
      extras: {},
      notes: ''
    };

    let currentSection = '';

    lines.forEach(line => {
      if (line.startsWith('Fee:')) {
        const feeMatch = line.match(/Fee: ([\d,]+) (\w+)/);
        if (feeMatch) {
          parsed.fee = feeMatch[1];
          parsed.currency = feeMatch[2];
        }
      } else if (line.startsWith('Extras:')) {
        currentSection = 'extras';
      } else if (line.startsWith('Notes:')) {
        currentSection = 'notes';
        parsed.notes = line.replace('Notes:', '').trim();
      } else if (currentSection === 'extras' && line.trim().startsWith('•')) {
        const extraLine = line.replace('•', '').trim();
        const colonIndex = extraLine.indexOf(':');
        if (colonIndex > -1) {
          const key = extraLine.substring(0, colonIndex).trim();
          const value = extraLine.substring(colonIndex + 1).trim();
          // Convert "Travel In" -> "travelIn", "Travel Out" -> "travelOut", etc.
          const camelKey = key.split(' ').map((word, index) =>
            index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join('');
          parsed.extras[camelKey] = value;
        } else {
          // Convert "Travel In" -> "travelIn", etc.
          const camelKey = extraLine.split(' ').map((word, index) =>
            index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          ).join('');
          parsed.extras[camelKey] = 'Included';
        }
      } else if (currentSection === 'notes' && line.trim()) {
        parsed.notes += '\n' + line.trim();
      }
    });

    setCounterOfferData(parsed);
    setCounterOfferMessage(msg);
    setShowCounterOfferDetails(true);
  };

  const handleAcceptCounterOffer = async () => {
    try {
      const acceptMessage = `I've accepted the counter-offer! ✅`;
      await apiService.sendMessage(currentUser._id, user._id, acceptMessage, null);
      setShowCounterOfferDetails(false);
      fetchMessages();
    } catch (error) {
      console.error('Error accepting counter-offer:', error);
      alert(error.message || 'Failed to accept counter-offer');
    }
  };

  const handleDeclineCounterOffer = async () => {
    if (!declineComment.trim()) {
      alert('Please provide a reason for declining');
      return;
    }

    try {
      const declineMessage = `I've declined the counter-offer.\n\nReason: ${declineComment}`;
      await apiService.sendMessage(currentUser._id, user._id, declineMessage, null);
      setShowCounterOfferDetails(false);
      setShowDeclineComment(false);
      setDeclineComment('');
      fetchMessages();
    } catch (error) {
      console.error('Error declining counter-offer:', error);
      alert(error.message || 'Failed to decline counter-offer');
    }
  };

  const handleReviewCounterOffer = () => {
    // Open review modal with counter-offer data pre-filled
    setReviewData({
      fee: counterOfferData.fee.replace(/,/g, ''),
      currency: counterOfferData.currency,
      extras: counterOfferData.extras,
      notes: ''
    });
    setShowCounterOfferDetails(false);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async () => {
    if (!selectedOffer || reviewData.fee === '' || reviewData.fee === null || reviewData.fee === undefined) {
      alert('Please enter a fee amount');
      return;
    }

    try {
      // Build extras text
      let extrasText = '';
      if (reviewData.extras && Object.keys(reviewData.extras).length > 0) {
        const extrasArray = Object.entries(reviewData.extras)
          .filter(([key, value]) => value)
          .map(([key, value]) => {
            const label = key.replace(/([A-Z])/g, ' $1').trim();
            const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
            return typeof value === 'string' ? `${capitalizedLabel}: ${value}` : capitalizedLabel;
          });
        if (extrasArray.length > 0) {
          extrasText = '\nExtras:\n' + extrasArray.map(e => `  • ${e}`).join('\n');
        }
      }

      // For now, we'll send a message about the counter-offer
      // Round fee to 2 decimal places to avoid floating point precision errors
      const feeValue = Math.round(parseFloat(reviewData.fee) * 100) / 100;
      const counterMessage = `Counter-Offer:\nFee: ${feeValue.toLocaleString()} ${reviewData.currency}${extrasText}${reviewData.notes ? `\n\nNotes: ${reviewData.notes}` : ''}`;

      await apiService.sendMessage(
        currentUser._id,
        user._id,
        counterMessage,
        null
      );

      setShowReviewModal(false);
      setShowOfferDetails(false);
      setReviewData({ fee: '', currency: 'USD', extras: {}, notes: '' });
      fetchMessages();
    } catch (error) {
      console.error('Error submitting counter-offer:', error);
      alert(error.message || 'Failed to submit counter-offer');
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

  // Check if current user can make offers to the chat partner
  // Only Venue/Promoter can initiate booking offers to Artist/Agent
  const canMakeOffer = () => {
    if (!currentUser || !user) return false;

    const myRole = currentUser.role;
    const theirRole = user.role;

    // Only Venues and Promoters can make booking offers to Artists and Agents
    if ((myRole === 'VENUE' || myRole === 'PROMOTER') && (theirRole === 'ARTIST' || theirRole === 'AGENT')) {
      return true;
    }

    return false;
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
            {msg.text && msg.text.startsWith('Counter-Offer:') ? (
              <div className="message-with-timestamp">
                <div className="offer-card-message">
                  <div className="offer-card-content">
                    <div className="offer-card-icon counter-offer-icon">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="17 1 21 5 17 9"></polyline>
                        <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
                        <polyline points="7 23 3 19 7 15"></polyline>
                        <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
                      </svg>
                    </div>
                    <div className="offer-card-text">
                      <p className="offer-card-name">{msg.isMe ? 'You' : user.name}</p>
                      <p className="offer-card-action">counter-offered</p>
                    </div>
                  </div>
                  <button
                    className="btn btn-outline btn-view-offer"
                    onClick={() => handleViewCounterOffer(msg)}
                  >
                    View Details
                  </button>
                </div>
                <span className="message-timestamp">{formatMessageTime(msg.timestamp)}</span>
              </div>
            ) : msg.isSystem && msg.dealId ? (
              (() => {
                const dealStatus = dealStatuses[msg.dealId];
                const isDeclined = dealStatus && dealStatus.status === 'DECLINED';
                const isAccepted = msg.text.includes('Booking Confirmed!') || msg.text.includes('accepted') || (dealStatus && dealStatus.status === 'ACCEPTED');

                // For declined/accepted offers, check who actually declined/accepted it
                let displayName = msg.isMe ? 'You' : user.name;
                if (isDeclined && dealStatus.declinedBy) {
                  displayName = dealStatus.declinedBy._id === currentUser._id ? 'You' : dealStatus.declinedBy.name;
                } else if (isAccepted) {
                  // For accepted offers, use msg.isMe since the message sender is the one who accepted
                  displayName = msg.isMe ? 'You' : user.name;
                }

                return (
                  <div className="message-with-timestamp">
                    <div className="offer-card-message">
                      <div className="offer-card-content">
                        <div className={`offer-card-icon ${isDeclined ? 'declined-offer-icon' : isAccepted ? 'accepted-offer-icon' : ''}`}>
                          {isDeclined ? (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="15" y1="9" x2="9" y2="15"></line>
                              <line x1="9" y1="9" x2="15" y2="15"></line>
                            </svg>
                          ) : isAccepted ? (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="9 12 11 14 15 10"></polyline>
                            </svg>
                          ) : (
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                              <line x1="16" y1="2" x2="16" y2="6"></line>
                              <line x1="8" y1="2" x2="8" y2="6"></line>
                              <line x1="3" y1="10" x2="21" y2="10"></line>
                              <polygon points="12,11.5 13.2,14 15.8,14.3 13.9,16.1 14.4,18.7 12,17.4 9.6,18.7 10.1,16.1 8.2,14.3 10.8,14" fill="currentColor" stroke="none"></polygon>
                            </svg>
                          )}
                        </div>
                        <div className="offer-card-text">
                          <p className="offer-card-name">{displayName}</p>
                          <p className="offer-card-action">
                            {isDeclined ? 'declined offer' : isAccepted ? 'accepted offer' : 'sent an offer'}
                          </p>
                        </div>
                      </div>
                      <button
                        className="btn btn-outline btn-view-offer"
                        onClick={() => {
                          if (isDeclined) {
                            handleViewDeclineReason(msg.dealId);
                          } else {
                            handleViewOffer(msg.dealId);
                          }
                        }}
                      >
                        {isDeclined ? 'View Reason' : 'View Details'}
                      </button>
                    </div>
                    <span className="message-timestamp">{formatMessageTime(msg.timestamp)}</span>
                  </div>
                );
              })()
            ) : msg.isSystem ? (
              <div className="message-system">
                <p>{msg.text}</p>
              </div>
            ) : (
              <div className={`message ${msg.isMe ? 'message-sent' : 'message-received'}`}>
                {(!msg.isMe && index === 0) || (index > 0 && userMessages[index - 1].isMe !== msg.isMe) ? (
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

      {!(user.isDeleted || user.deleted) && connectedUsers.has(user._id || user.id) ? (
        <>
          {canMakeOffer() && (
            <div className="chat-offer-button-container">
              <button
                className="btn-make-offer"
                onClick={() => setShowMakeOffer(true)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <path d="M9 16l2 2 4-4"></path>
                </svg>
                Make an Offer
              </button>
            </div>
          )}
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
        </>
      ) : (
        <div className="chat-input-disabled">
          <p>
            {(user.isDeleted || user.deleted)
              ? 'You cannot send messages to inactive profiles'
              : `You are no longer connected with ${user.name}. You cannot send messages unless you reconnect.`
            }
          </p>
        </div>
      )}

      <MakeOfferModal
        isOpen={showMakeOffer}
        onClose={() => setShowMakeOffer(false)}
        recipientProfile={user}
        onSuccess={() => {
          // Refresh messages to show the new offer immediately
          fetchMessages();
        }}
      />

      {/* Offer Details Modal */}
      {showOfferDetails && selectedOffer && (
        <div className="modal-overlay" onClick={() => setShowOfferDetails(false)}>
          <div className="modal-content offer-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Offer Details</h3>
              <button className="modal-close" onClick={() => setShowOfferDetails(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="offer-detail-section">
                {selectedOffer.eventName && (
                  <div className="offer-detail-row">
                    <span className="detail-label">Event:</span>
                    <span className="detail-value">{selectedOffer.eventName}</span>
                  </div>
                )}
                <div className="offer-detail-row">
                  <span className="detail-label">Venue:</span>
                  <span className="detail-value">
                    <div>{selectedOffer.venueName}</div>
                    {selectedOffer.venue?.location && (
                      <div className="detail-subtext">({selectedOffer.venue.location})</div>
                    )}
                  </span>
                </div>
                <div className="offer-detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">
                    {new Date(selectedOffer.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                {selectedOffer.startTime && selectedOffer.endTime && (
                  <div className="offer-detail-row">
                    <span className="detail-label">Event Time:</span>
                    <span className="detail-value">
                      {selectedOffer.startTime} - {selectedOffer.endTime}
                    </span>
                  </div>
                )}
                {selectedOffer.performanceType && (
                  <div className="offer-detail-row">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{selectedOffer.performanceType}</span>
                  </div>
                )}
                {selectedOffer.setStartTime && selectedOffer.setEndTime && (
                  <div className="offer-detail-row">
                    <span className="detail-label">Set Time:</span>
                    <span className="detail-value">
                      <div>{selectedOffer.setStartTime} - {selectedOffer.setEndTime}</div>
                      {selectedOffer.setDuration && (
                        <div className="detail-subtext">({selectedOffer.setDuration} minutes)</div>
                      )}
                    </span>
                  </div>
                )}
                <div className="offer-detail-row">
                  <span className="detail-label">Fee:</span>
                  <span className="detail-value offer-fee">
                    {Number.isInteger(selectedOffer.currentFee)
                      ? selectedOffer.currentFee.toLocaleString()
                      : selectedOffer.currentFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {selectedOffer.currency}
                  </span>
                </div>
                {selectedOffer.extras && Object.keys(selectedOffer.extras).length > 0 && (
                  <div className="offer-detail-row">
                    <span className="detail-label">Extras:</span>
                    <div className="detail-value extras-list">
                      {Object.entries(selectedOffer.extras).map(([key, value]) => (
                        <div key={key} className="extra-item">
                          <div className="extra-header">
                            <strong style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong>
                          </div>
                          {value !== 'Included' && (
                            <div className="extra-note">{value}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedOffer.additionalTerms && (
                  <div className="offer-detail-row">
                    <span className="detail-label">Additional Terms:</span>
                    <span className="detail-value">{selectedOffer.additionalTerms}</span>
                  </div>
                )}
                {selectedOffer.technicalRequirements && (
                  <div className="offer-detail-row">
                    <span className="detail-label">Technical:</span>
                    <span className="detail-value">{selectedOffer.technicalRequirements}</span>
                  </div>
                )}
                {selectedOffer.paymentTerms && (
                  <div className="offer-detail-row">
                    <span className="detail-label">Payment Terms:</span>
                    <span className="detail-value">{selectedOffer.paymentTerms}</span>
                  </div>
                )}
                {selectedOffer.notes && (
                  <div className="offer-detail-row">
                    <span className="detail-label">Notes:</span>
                    <span className="detail-value">{selectedOffer.notes}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {selectedOffer && selectedOffer.status === 'PENDING' &&
               selectedOffer.artist && selectedOffer.artist._id === currentUser._id ? (
                // Show Decline/Review/Accept for incoming offers
                showOfferDeclineComment ? (
                  <div className="decline-comment-container">
                    <div className="decline-comment-textarea-wrapper">
                      <label className="decline-comment-label">Please provide a reason for declining:</label>
                      <textarea
                        value={offerDeclineComment}
                        onChange={(e) => setOfferDeclineComment(e.target.value)}
                        placeholder="Enter your reason here..."
                        className="form-textarea decline-comment-textarea"
                        rows="5"
                      />
                    </div>
                    <div className="decline-comment-actions">
                      <button
                        className="btn btn-outline"
                        onClick={() => {
                          setShowOfferDeclineComment(false);
                          setOfferDeclineComment('');
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleDeclineOffer}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      className="btn btn-outline"
                      onClick={() => setShowOfferDeclineComment(true)}
                    >
                      Decline
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={handleOpenReview}
                    >
                      Review
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleAcceptOffer}
                    >
                      Accept
                    </button>
                  </>
                )
              ) : (
                // Show Close for sent offers or already accepted/declined
                <button
                  className="btn btn-outline"
                  onClick={() => setShowOfferDetails(false)}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Review/Counter-Offer Modal */}
      {showReviewModal && (
        <div className="modal active review-modal-wrapper" onClick={() => setShowReviewModal(false)}>
          <div className="review-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Review Offer</h3>
              <button className="modal-close" onClick={() => setShowReviewModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="review-form">
                <div className="form-group">
                  <label>Fee Amount *</label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={reviewData.fee}
                    onChange={(e) => setReviewData({ ...reviewData, fee: e.target.value })}
                    placeholder="0"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Currency</label>
                  <select
                    value={reviewData.currency}
                    onChange={(e) => setReviewData({ ...reviewData, currency: e.target.value })}
                    className="form-select currency-select-full"
                  >
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                    <option value="JPY">JPY</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Extras</label>
                  <div className="extras-list">
                    <div className="extra-item">
                      <div className="extra-checkbox-row">
                        <input
                          type="checkbox"
                          id="travelIn"
                          checked={!!reviewData.extras.travelIn}
                          onChange={(e) => setReviewData({
                            ...reviewData,
                            extras: { ...reviewData.extras, travelIn: e.target.checked ? (reviewData.extras.travelIn || 'Included') : '' }
                          })}
                        />
                        <label htmlFor="travelIn">Travel In</label>
                      </div>
                      {!!reviewData.extras.travelIn && (
                        <input
                          type="text"
                          value={typeof reviewData.extras.travelIn === 'string' ? reviewData.extras.travelIn : 'Included'}
                          onChange={(e) => setReviewData({
                            ...reviewData,
                            extras: { ...reviewData.extras, travelIn: e.target.value }
                          })}
                          placeholder="Add details..."
                          className="extra-note-input"
                        />
                      )}
                    </div>

                    <div className="extra-item">
                      <div className="extra-checkbox-row">
                        <input
                          type="checkbox"
                          id="travelOut"
                          checked={!!reviewData.extras.travelOut}
                          onChange={(e) => setReviewData({
                            ...reviewData,
                            extras: { ...reviewData.extras, travelOut: e.target.checked ? (reviewData.extras.travelOut || 'Included') : '' }
                          })}
                        />
                        <label htmlFor="travelOut">Travel Out</label>
                      </div>
                      {!!reviewData.extras.travelOut && (
                        <input
                          type="text"
                          value={typeof reviewData.extras.travelOut === 'string' ? reviewData.extras.travelOut : 'Included'}
                          onChange={(e) => setReviewData({
                            ...reviewData,
                            extras: { ...reviewData.extras, travelOut: e.target.value }
                          })}
                          placeholder="Add details..."
                          className="extra-note-input"
                        />
                      )}
                    </div>

                    <div className="extra-item">
                      <div className="extra-checkbox-row">
                        <input
                          type="checkbox"
                          id="transportation"
                          checked={!!reviewData.extras.transportation}
                          onChange={(e) => setReviewData({
                            ...reviewData,
                            extras: { ...reviewData.extras, transportation: e.target.checked ? (reviewData.extras.transportation || 'Included') : '' }
                          })}
                        />
                        <label htmlFor="transportation">Transportation</label>
                      </div>
                      {!!reviewData.extras.transportation && (
                        <input
                          type="text"
                          value={typeof reviewData.extras.transportation === 'string' ? reviewData.extras.transportation : 'Included'}
                          onChange={(e) => setReviewData({
                            ...reviewData,
                            extras: { ...reviewData.extras, transportation: e.target.value }
                          })}
                          placeholder="Add details..."
                          className="extra-note-input"
                        />
                      )}
                    </div>

                    <div className="extra-item">
                      <div className="extra-checkbox-row">
                        <input
                          type="checkbox"
                          id="accommodation"
                          checked={!!reviewData.extras.accommodation}
                          onChange={(e) => setReviewData({
                            ...reviewData,
                            extras: { ...reviewData.extras, accommodation: e.target.checked ? (reviewData.extras.accommodation || 'Included') : '' }
                          })}
                        />
                        <label htmlFor="accommodation">Accommodation</label>
                      </div>
                      {!!reviewData.extras.accommodation && (
                        <input
                          type="text"
                          value={typeof reviewData.extras.accommodation === 'string' ? reviewData.extras.accommodation : 'Included'}
                          onChange={(e) => setReviewData({
                            ...reviewData,
                            extras: { ...reviewData.extras, accommodation: e.target.value }
                          })}
                          placeholder="Add details..."
                          className="extra-note-input"
                        />
                      )}
                    </div>

                    <div className="extra-item">
                      <div className="extra-checkbox-row">
                        <input
                          type="checkbox"
                          id="meals"
                          checked={!!reviewData.extras.meals}
                          onChange={(e) => setReviewData({
                            ...reviewData,
                            extras: { ...reviewData.extras, meals: e.target.checked ? (reviewData.extras.meals || 'Included') : '' }
                          })}
                        />
                        <label htmlFor="meals">Meals</label>
                      </div>
                      {!!reviewData.extras.meals && (
                        <input
                          type="text"
                          value={typeof reviewData.extras.meals === 'string' ? reviewData.extras.meals : 'Included'}
                          onChange={(e) => setReviewData({
                            ...reviewData,
                            extras: { ...reviewData.extras, meals: e.target.value }
                          })}
                          placeholder="Add details..."
                          className="extra-note-input"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>General Notes</label>
                  <textarea
                    value={reviewData.notes}
                    onChange={(e) => setReviewData({ ...reviewData, notes: e.target.value })}
                    placeholder="Add any additional comments or conditions..."
                    className="form-textarea"
                    rows="3"
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary btn-full-width" onClick={handleSubmitReview}>
                Send Counter-Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Counter-Offer Details Modal */}
      {showCounterOfferDetails && counterOfferData && (
        <div className="modal-overlay" onClick={() => setShowCounterOfferDetails(false)}>
          <div className="modal-content offer-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Counter-Offer Details</h3>
              <button className="modal-close" onClick={() => setShowCounterOfferDetails(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="offer-detail-section">
                <div className="offer-detail-row">
                  <span className="detail-label">Fee:</span>
                  <span className="detail-value offer-fee">
                    {counterOfferData.fee} {counterOfferData.currency}
                  </span>
                </div>
                {counterOfferData.extras && Object.keys(counterOfferData.extras).length > 0 && (
                  <div className="offer-detail-row">
                    <span className="detail-label">Extras:</span>
                    <div className="detail-value extras-list">
                      {Object.entries(counterOfferData.extras).map(([key, value]) => (
                        <div key={key} className="extra-item">
                          <div className="extra-header">
                            <strong>{key}:</strong>
                          </div>
                          {value !== 'Included' && (
                            <div className="extra-note">{value}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {counterOfferData.notes && (
                  <div className="offer-detail-row">
                    <span className="detail-label">Notes:</span>
                    <span className="detail-value">{counterOfferData.notes}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {counterOfferMessage && !counterOfferMessage.isMe ? (
                showDeclineComment ? (
                  <div className="decline-comment-container">
                    <div className="decline-comment-textarea-wrapper">
                      <label className="decline-comment-label">Please provide a reason for declining:</label>
                      <textarea
                        value={declineComment}
                        onChange={(e) => setDeclineComment(e.target.value)}
                        placeholder="Enter your reason here..."
                        className="form-textarea decline-comment-textarea"
                        rows="5"
                      />
                    </div>
                    <div className="decline-comment-actions">
                      <button
                        className="btn btn-outline"
                        onClick={() => {
                          setShowDeclineComment(false);
                          setDeclineComment('');
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="btn btn-primary"
                        onClick={handleDeclineCounterOffer}
                      >
                        Submit
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      className="btn btn-outline"
                      onClick={() => setShowDeclineComment(true)}
                    >
                      Decline
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={handleReviewCounterOffer}
                    >
                      Review
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={handleAcceptCounterOffer}
                    >
                      Accept
                    </button>
                  </>
                )
              ) : (
                <button
                  className="btn btn-outline"
                  onClick={() => setShowCounterOfferDetails(false)}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Decline Reason Modal */}
      {showDeclineReasonModal && declineReasonData && (
        <div className="modal-overlay" onClick={() => setShowDeclineReasonModal(false)}>
          <div className="modal-content offer-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Decline Reason</h3>
              <button className="modal-close" onClick={() => setShowDeclineReasonModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="offer-detail-section">
                <div className="offer-detail-row">
                  <span className="detail-label">Declined By:</span>
                  <span className="detail-value">
                    {declineReasonData.declinedBy && declineReasonData.declinedBy._id === currentUser._id
                      ? 'You'
                      : user.name}
                  </span>
                </div>
                <div className="offer-detail-row">
                  <span className="detail-label">Reason:</span>
                  <span className="detail-value">
                    {declineReasonData.declineReason || 'No reason provided'}
                  </span>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={() => setShowDeclineReasonModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatScreen;