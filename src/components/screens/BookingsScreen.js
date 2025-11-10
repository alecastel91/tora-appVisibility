import React, { useState, useEffect } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import apiService from '../../services/api';

const BookingsScreen = ({ onOpenChat, onNavigateToMessages }) => {
  const { user: currentUser } = useAppContext();
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming', 'past', or 'declined'
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dealToDelete, setDealToDelete] = useState(null);
  const [expandedDealId, setExpandedDealId] = useState(null);
  const [dealToDecline, setDealToDecline] = useState(null);
  const [declineReason, setDeclineReason] = useState('');

  useEffect(() => {
    fetchDeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchDeals = async () => {
    if (!currentUser || !currentUser._id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch all deals for this user (both sent and received)
      const response = await apiService.getDeals({ profileId: currentUser._id });
      setDeals(response.deals || []);
    } catch (err) {
      console.error('Error fetching deals:', err);
      setError(err.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptDeal = async (dealId) => {
    try {
      await apiService.acceptDeal(dealId, currentUser._id);
      // Refresh deals after accepting
      fetchDeals();
    } catch (err) {
      console.error('Error accepting deal:', err);
      alert(err.message || 'Failed to accept offer');
    }
  };

  const handleDeclineDeal = async () => {
    if (!dealToDecline) return;

    if (!declineReason.trim()) {
      alert('Please provide a reason for declining');
      return;
    }

    try {
      await apiService.declineDeal(dealToDecline, currentUser._id, declineReason);
      setDealToDecline(null);
      setDeclineReason('');
      // Refresh deals after declining
      fetchDeals();
    } catch (err) {
      console.error('Error declining deal:', err);
      alert(err.message || 'Failed to decline offer');
      setDealToDecline(null);
      setDeclineReason('');
    }
  };

  const handleDeleteDeal = async () => {
    if (!dealToDelete) return;

    try {
      await apiService.deleteDeal(dealToDelete, currentUser._id);
      setDealToDelete(null);
      // Refresh deals after deleting
      fetchDeals();
    } catch (err) {
      console.error('Error deleting deal:', err);
      alert(err.message || 'Failed to delete offer');
      setDealToDelete(null);
    }
  };

  const toggleDealExpanded = (dealId) => {
    setExpandedDealId(expandedDealId === dealId ? null : dealId);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Filter deals into past, upcoming, and declined
  const filterDeals = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return deals.filter(deal => {
      const dealDate = new Date(deal.date);
      dealDate.setHours(0, 0, 0, 0);

      if (activeTab === 'declined') {
        return deal.status === 'DECLINED';
      } else if (activeTab === 'upcoming') {
        return dealDate >= today && deal.status !== 'DECLINED';
      } else {
        return dealDate < today && deal.status !== 'DECLINED';
      }
    });
  };

  // Cluster deals by month and year
  const clusterDealsByMonth = (filteredDeals) => {
    const clusters = {};

    filteredDeals.forEach(deal => {
      const date = new Date(deal.date);
      const monthYear = `${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;

      if (!clusters[monthYear]) {
        clusters[monthYear] = {
          monthYear,
          date: date, // Store date for sorting
          deals: []
        };
      }

      clusters[monthYear].deals.push(deal);
    });

    // Sort clusters by date
    const sortedClusters = Object.values(clusters).sort((a, b) => {
      if (activeTab === 'upcoming') {
        return a.date - b.date; // Ascending for upcoming
      } else {
        return b.date - a.date; // Descending for past
      }
    });

    // Sort deals within each cluster by date
    sortedClusters.forEach(cluster => {
      cluster.deals.sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (activeTab === 'upcoming') {
          return dateA - dateB; // Ascending for upcoming
        } else {
          return dateB - dateA; // Descending for past
        }
      });
    });

    return sortedClusters;
  };

  const filteredDeals = filterDeals();
  const clusteredDeals = clusterDealsByMonth(filteredDeals);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'status-badge status-pending';
      case 'NEGOTIATING':
        return 'status-badge status-negotiating';
      case 'ACCEPTED':
        return 'status-badge status-accepted';
      case 'DECLINED':
        return 'status-badge status-declined';
      case 'COMPLETED':
        return 'status-badge status-completed';
      default:
        return 'status-badge';
    }
  };

  const renderDealCard = (deal) => {
    const isOutgoing = deal.initiator._id === currentUser._id;
    const otherParty = isOutgoing
      ? (deal.venue._id === currentUser._id ? deal.artist : deal.venue)
      : deal.initiator;
    const isExpanded = expandedDealId === deal._id;

    const dealDate = new Date(deal.date);
    const dayNumber = dealDate.getDate();

    return (
      <div key={deal._id} className={`booking-card ${isExpanded ? 'expanded' : ''}`}>
        <div className="booking-date-badge">
          {dayNumber}
        </div>
        <div className="booking-compact-view">
          <div
            className="party-avatar"
            onClick={() => toggleDealExpanded(deal._id)}
            style={{ cursor: 'pointer' }}
          >
            {otherParty.avatar ? (
              <img src={otherParty.avatar} alt={otherParty.name} />
            ) : (
              otherParty.name.charAt(0).toUpperCase()
            )}
          </div>

          <div
            className="party-info"
            onClick={() => toggleDealExpanded(deal._id)}
            style={{ cursor: 'pointer', flex: 1 }}
          >
            <div className="party-name-role">
              <h3>{otherParty.name}</h3>
              <span className={`role-badge ${otherParty.role.toLowerCase()}`}>
                {otherParty.role}
              </span>
            </div>
            <p className="party-location">{otherParty.location}</p>
            <div className="party-status-row">
              <span className={getStatusBadgeClass(deal.status)}>
                {deal.status}
              </span>
            </div>
          </div>

          <button
            className="btn-expand-arrow"
            onClick={() => toggleDealExpanded(deal._id)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}>
              <path d="M6 9l6 6 6-6"/>
            </svg>
          </button>
        </div>

        {isExpanded && (
          <>
            <div className="booking-details">
              {deal.eventName && (
                <div className="booking-detail-row">
                  <span className="detail-label">Event:</span>
                  <span className="detail-value">{deal.eventName}</span>
                </div>
              )}
              <div className="booking-detail-row">
                <span className="detail-label">Venue:</span>
                <span className="detail-value">
                  <div>{deal.venueName}</div>
                  {deal.venue?.location && (
                    <div className="detail-subtext">({deal.venue.location})</div>
                  )}
                </span>
              </div>
              <div className="booking-detail-row">
                <span className="detail-label">Date:</span>
                <span className="detail-value">{formatDate(deal.date)}</span>
              </div>
              {deal.startTime && deal.endTime && (
                <div className="booking-detail-row">
                  <span className="detail-label">Event Time:</span>
                  <span className="detail-value">
                    {deal.startTime} - {deal.endTime}
                  </span>
                </div>
              )}
              {deal.performanceType && (
                <div className="booking-detail-row">
                  <span className="detail-label">Type:</span>
                  <span className="detail-value">{deal.performanceType}</span>
                </div>
              )}
              {deal.setStartTime && deal.setEndTime && (
                <div className="booking-detail-row">
                  <span className="detail-label">Set Time:</span>
                  <span className="detail-value">
                    <div>{deal.setStartTime} - {deal.setEndTime}</div>
                    {deal.setDuration && (
                      <div className="detail-subtext">({deal.setDuration} minutes)</div>
                    )}
                  </span>
                </div>
              )}
              <div className="booking-detail-row">
                <span className="detail-label">Fee:</span>
                <span className="detail-value booking-fee">
                  {Number.isInteger(deal.currentFee)
                    ? deal.currentFee.toLocaleString()
                    : deal.currentFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {deal.currency}
                </span>
              </div>
              {deal.extras && Object.keys(deal.extras).length > 0 && (
                <div className="booking-detail-row full-width">
                  <span className="detail-label">Extras:</span>
                  <div className="detail-value extras-list">
                    {Object.entries(deal.extras).map(([key, value]) => (
                      <div key={key} className="extra-item">
                        <div className="extra-content">
                          <strong style={{ textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1').trim()}</strong>
                          {value !== 'Included' && <span className="extra-note">: {value}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {deal.additionalTerms && (
                <div className="booking-detail-row full-width">
                  <span className="detail-label">Additional Terms:</span>
                  <span className="detail-value">{deal.additionalTerms}</span>
                </div>
              )}
              {deal.technicalRequirements && (
                <div className="booking-detail-row full-width">
                  <span className="detail-label">Technical:</span>
                  <span className="detail-value">{deal.technicalRequirements}</span>
                </div>
              )}
              {deal.paymentTerms && (
                <div className="booking-detail-row full-width">
                  <span className="detail-label">Payment Terms:</span>
                  <span className="detail-value">{deal.paymentTerms}</span>
                </div>
              )}
              {deal.notes && (
                <div className="booking-detail-row full-width">
                  <span className="detail-label">Notes:</span>
                  <span className="detail-value">{deal.notes}</span>
                </div>
              )}
            </div>

            {/* Action buttons for incoming offers */}
            {!isOutgoing && (deal.status === 'PENDING' || deal.status === 'NEGOTIATING') && (
              <div className="booking-actions">
                <button
                  className="btn btn-outline btn-decline"
                  onClick={() => setDealToDecline(deal._id)}
                >
                  Decline
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setExpandedDealId(null);
                    // Open ChatScreen and trigger Review modal
                    if (onOpenChat) {
                      onOpenChat(otherParty, deal);
                    }
                  }}
                >
                  Review
                </button>
                <button
                  className="btn btn-primary btn-accept"
                  onClick={() => handleAcceptDeal(deal._id)}
                >
                  Accept
                </button>
              </div>
            )}

            {/* Show chat button */}
            <button
              className="btn btn-outline btn-chat"
              onClick={() => onOpenChat && onOpenChat(otherParty)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              Message
            </button>

            {/* Delete offer button (only for outgoing pending offers) */}
            {isOutgoing && deal.status === 'PENDING' && (
              <button
                className="btn btn-outline btn-delete-offer-expanded"
                onClick={(e) => {
                  e.stopPropagation();
                  setDealToDelete(deal._id);
                }}
              >
                Delete Offer
              </button>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="bookings-screen">
      <div className="bookings-header">
        <h1>Bookings</h1>
        <p className="bookings-subtitle">Manage your booking offers</p>
      </div>

      <div className="bookings-tabs">
        <button
          className={`bookings-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
          {activeTab === 'upcoming' && filteredDeals.length > 0 && (
            <span className="tab-badge">{filteredDeals.length}</span>
          )}
        </button>
        <button
          className={`bookings-tab ${activeTab === 'past' ? 'active' : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past
          {activeTab === 'past' && filteredDeals.length > 0 && (
            <span className="tab-badge">{filteredDeals.length}</span>
          )}
        </button>
        <button
          className={`bookings-tab ${activeTab === 'declined' ? 'active' : ''}`}
          onClick={() => setActiveTab('declined')}
        >
          Declined
          {activeTab === 'declined' && filteredDeals.length > 0 && (
            <span className="tab-badge">{filteredDeals.length}</span>
          )}
        </button>
      </div>

      <div className="bookings-content">
        {loading ? (
          <div className="bookings-loading">
            <div className="spinner"></div>
            <p>Loading bookings...</p>
          </div>
        ) : error ? (
          <div className="bookings-error">
            <p>{error}</p>
            <button className="btn btn-outline" onClick={fetchDeals}>
              Try Again
            </button>
          </div>
        ) : filteredDeals.length === 0 ? (
          <div className="bookings-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <h3>No {activeTab === 'upcoming' ? 'upcoming' : activeTab === 'past' ? 'past' : 'declined'} bookings</h3>
            <p>
              {activeTab === 'upcoming'
                ? 'Start conversations and book gigs for upcoming events!'
                : activeTab === 'past'
                ? 'Your past bookings will appear here.'
                : 'Your declined offers will appear here.'
              }
            </p>
          </div>
        ) : (
          <div className="bookings-list">
            {clusteredDeals.map((cluster, index) => (
              <div key={index} className="bookings-cluster">
                <div className="cluster-header">
                  <h2>{cluster.monthYear}</h2>
                  <span className="cluster-count">{cluster.deals.length} offer{cluster.deals.length !== 1 ? 's' : ''}</span>
                </div>
                {cluster.deals.map(deal => renderDealCard(deal))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom Delete Confirmation Modal */}
      {dealToDelete && (
        <div className="delete-modal-overlay" onClick={() => setDealToDelete(null)}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h3>Delete Offer</h3>
            </div>
            <div className="delete-modal-content">
              <p>Are you sure you want to delete this offer?</p>
              <p className="delete-modal-warning">This action cannot be undone.</p>
            </div>
            <div className="delete-modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => setDealToDelete(null)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteDeal}
              >
                Delete Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Offer Modal */}
      {dealToDecline && (
        <div className="delete-modal-overlay" onClick={() => {
          setDealToDecline(null);
          setDeclineReason('');
        }}>
          <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
            <div className="delete-modal-header">
              <h3>Decline Offer</h3>
            </div>
            <div className="delete-modal-content">
              <p>Please provide a reason for declining this offer:</p>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="e.g., Date conflict, budget doesn't work, etc."
                className="decline-reason-textarea"
                rows="4"
                autoFocus
              />
            </div>
            <div className="delete-modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setDealToDecline(null);
                  setDeclineReason('');
                }}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeclineDeal}
              >
                Decline Offer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingsScreen;
