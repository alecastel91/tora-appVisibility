import React, { useState } from 'react';
import { CloseIcon } from '../../utils/icons';

const ManageArtistScreen = ({ artist, onClose }) => {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, events, info

  if (!artist) return null;

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  // Mock data for demonstration
  const mockData = {
    metrics: {
      upcomingGigs: 15,
      ytdRevenue: 127450,
      avgRating: 4.8
    },
    actionItems: [
      {
        id: 1,
        type: 'contract',
        icon: '⚠️',
        title: 'Contract needs signature',
        description: 'Berlin, Watergate - Dec 1',
        action: 'View Contract'
      },
      {
        id: 2,
        type: 'payment',
        icon: '💰',
        title: 'Payment overdue (7 days)',
        description: 'London, Fabric - Nov 28 gig',
        action: 'Send Reminder'
      },
      {
        id: 3,
        type: 'inquiry',
        icon: '📨',
        title: '2 booking inquiries pending',
        description: 'Awaiting response',
        action: 'View Requests'
      }
    ],
    revenueData: [
      { month: 'Jun', amount: 18500 },
      { month: 'Jul', amount: 22000 },
      { month: 'Aug', amount: 19500 },
      { month: 'Sep', amount: 25000 },
      { month: 'Oct', amount: 21000 },
      { month: 'Nov', amount: 21450 }
    ],
    pendingOffers: [
      {
        id: 1,
        venue: 'Fold',
        location: 'London',
        date: 'Dec 15, 2024',
        fee: 4000,
        currency: '£'
      },
      {
        id: 2,
        venue: 'Sisyphos',
        location: 'Berlin',
        date: 'Dec 20, 2024',
        fee: 3500,
        currency: '€'
      }
    ],
    upcomingEvents: [
      {
        id: 1,
        date: 'Dec 1, 2024',
        time: '11:00 PM',
        venue: 'Watergate',
        location: 'Berlin',
        fee: 5000,
        currency: '€',
        status: 'confirmed',
        statusLabel: 'CONFIRMED',
        statusDetails: 'Contract Signed, Payment Confirmed'
      },
      {
        id: 2,
        date: 'Dec 5, 2024',
        time: '10:00 PM',
        venue: 'Fabric',
        location: 'London',
        fee: 4500,
        currency: '£',
        status: 'pending-payment',
        statusLabel: 'PENDING PAYMENT',
        statusDetails: 'Gig completed, payment due'
      },
      {
        id: 3,
        date: 'Dec 8, 2024',
        time: '11:30 PM',
        venue: 'Closer',
        location: 'Kyiv',
        fee: 3000,
        currency: '$',
        status: 'offer-pending',
        statusLabel: 'OFFER PENDING',
        statusDetails: 'Received 2 days ago'
      }
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'pending-payment': return '⏳';
      case 'offer-pending': return '📝';
      default: return '📅';
    }
  };

  const renderDashboardTab = () => (
    <div className="dashboard-tab">
      {/* Hero Metrics */}
      <div className="hero-metrics">
        <div className="metric-card">
          <div className="metric-icon">📅</div>
          <div className="metric-value">{mockData.metrics.upcomingGigs}</div>
          <div className="metric-label">Upcoming Gigs</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">💰</div>
          <div className="metric-value">{formatCurrency(mockData.metrics.ytdRevenue)}</div>
          <div className="metric-label">YTD Revenue</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon">⭐</div>
          <div className="metric-value">{mockData.metrics.avgRating}</div>
          <div className="metric-label">Avg Rating</div>
        </div>
      </div>

      {/* Action Items */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>🔔 Action Required</h3>
          <span className="badge">{mockData.actionItems.length}</span>
        </div>
        <div className="action-items">
          {mockData.actionItems.map(item => (
            <div key={item.id} className="action-item">
              <div className="action-icon">{item.icon}</div>
              <div className="action-content">
                <div className="action-title">{item.title}</div>
                <div className="action-description">{item.description}</div>
              </div>
              <button className="btn btn-outline btn-sm">{item.action}</button>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="dashboard-section">
        <h3>📊 Revenue Overview</h3>
        <div className="revenue-chart">
          {mockData.revenueData.map(item => {
            const maxRevenue = Math.max(...mockData.revenueData.map(d => d.amount));
            const height = (item.amount / maxRevenue) * 100;
            return (
              <div key={item.month} className="chart-bar-container">
                <div className="chart-bar" style={{ height: `${height}%` }}>
                  <div className="chart-value">${(item.amount / 1000).toFixed(0)}K</div>
                </div>
                <div className="chart-label">{item.month}</div>
              </div>
            );
          })}
        </div>
        <div className="revenue-trend">Trend: ↗️ +23% vs previous period</div>
      </div>

      {/* Pending Offers */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>💼 Pending Booking Offers</h3>
          <span className="badge">{mockData.pendingOffers.length}</span>
        </div>
        <div className="pending-offers">
          {mockData.pendingOffers.map(offer => (
            <div key={offer.id} className="offer-card">
              <div className="offer-info">
                <div className="offer-venue">{offer.venue}, {offer.location}</div>
                <div className="offer-details">{offer.date} • {offer.currency}{offer.fee.toLocaleString()}</div>
              </div>
              <div className="offer-actions">
                <button className="btn btn-outline btn-sm">Decline</button>
                <button className="btn btn-primary btn-sm">Accept</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderEventsTab = () => (
    <div className="events-tab">
      {/* Calendar Placeholder */}
      <div className="dashboard-section">
        <h3>📅 Calendar View</h3>
        <div className="calendar-placeholder">
          <p>Calendar integration coming soon</p>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Visual calendar with color-coded events will be displayed here
          </p>
        </div>
      </div>

      {/* Event List */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3>Upcoming Events</h3>
          <div className="filter-tabs">
            <button className="filter-tab active">All</button>
            <button className="filter-tab">Confirmed</button>
            <button className="filter-tab">Pending</button>
          </div>
        </div>
        <div className="event-list">
          {mockData.upcomingEvents.map(event => (
            <div key={event.id} className={`event-card status-${event.status}`}>
              <div className="event-status-badge">
                {getStatusIcon(event.status)} {event.statusLabel}
              </div>
              <div className="event-datetime">
                {event.date} • {event.time}
              </div>
              <div className="event-venue">
                {event.venue}, {event.location}
              </div>
              <div className="event-fee">
                Fee: {event.currency}{event.fee.toLocaleString()}
              </div>
              <div className="event-status-details">
                Status: {event.statusDetails}
              </div>
              <div className="event-actions">
                {event.status === 'offer-pending' ? (
                  <>
                    <button className="btn btn-outline btn-sm">Decline</button>
                    <button className="btn btn-secondary btn-sm">Counter-Offer</button>
                    <button className="btn btn-primary btn-sm">Accept</button>
                  </>
                ) : (
                  <>
                    <button className="btn btn-outline btn-sm">View Details</button>
                    <button className="btn btn-secondary btn-sm">Contact Venue</button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderArtistInfoTab = () => (
    <div className="artist-info-tab">
      {/* Contact Information */}
      <div className="dashboard-section">
        <h3>📞 Contact Information</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Email:</span>
            <span className="info-value">{artist.email || 'artist@example.com'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Phone:</span>
            <span className="info-value">{artist.phone || '+44 7700 900123'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Instagram:</span>
            <span className="info-value">{artist.instagram || '@artistname'}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Spotify:</span>
            <span className="info-value">spotify.com/artist/...</span>
          </div>
        </div>
        <button className="btn btn-outline" style={{ marginTop: '12px' }}>Edit Contact Info</button>
      </div>

      {/* Press Kit */}
      <div className="dashboard-section">
        <h3>🎭 Press Kit</h3>
        <div className="doc-list">
          <div className="doc-item">
            <div className="doc-info">
              <div className="doc-name">Artist Bio (Short)</div>
              <div className="doc-meta">Last updated: Nov 15, 2024</div>
            </div>
            <button className="btn btn-outline btn-sm">View/Edit</button>
          </div>
          <div className="doc-item">
            <div className="doc-info">
              <div className="doc-name">Press Photos</div>
              <div className="doc-meta">No file attached</div>
            </div>
            <button className="btn btn-primary btn-sm">Add Link/PDF</button>
          </div>
          <div className="doc-item">
            <div className="doc-info">
              <div className="doc-name">Latest Mix</div>
              <div className="doc-meta">No file attached</div>
            </div>
            <button className="btn btn-primary btn-sm">Add Link/PDF</button>
          </div>
        </div>
      </div>

      {/* Technical Riders */}
      <div className="dashboard-section">
        <h3>🎚️ Technical Riders</h3>
        <div className="doc-list">
          <div className="doc-item">
            <div className="doc-info">
              <div className="doc-name">Technical Rider</div>
              <div className="doc-meta">No file attached</div>
            </div>
            <button className="btn btn-primary btn-sm">Add Link/PDF</button>
          </div>
          <div className="doc-item">
            <div className="doc-info">
              <div className="doc-name">Stage Plot</div>
              <div className="doc-meta">No file attached</div>
            </div>
            <button className="btn btn-primary btn-sm">Add Link/PDF</button>
          </div>
          <div className="doc-item">
            <div className="doc-info">
              <div className="doc-name">Hospitality Rider</div>
              <div className="doc-meta">No file attached</div>
            </div>
            <button className="btn btn-primary btn-sm">Add Link/PDF</button>
          </div>
        </div>
      </div>

      {/* Contract Templates */}
      <div className="dashboard-section">
        <h3>📄 Contract Templates</h3>
        <div className="doc-list">
          <div className="doc-item">
            <div className="doc-info">
              <div className="doc-name">Standard Performance Contract</div>
              <div className="doc-meta">No file attached</div>
            </div>
            <button className="btn btn-primary btn-sm">Add Link/PDF</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="screen active manage-artist-screen">
      <div className="manage-artist-header">
        <button className="back-btn" onClick={onClose}>
          <CloseIcon />
        </button>
        <h1>Manage {artist.name}</h1>
      </div>

      {/* Artist Info Bar */}
      <div className="artist-info-bar">
        <div className="artist-avatar-small">
          {artist.avatar ? (
            <img src={artist.avatar} alt={artist.name} />
          ) : (
            getInitial(artist.name)
          )}
        </div>
        <div className="artist-info-text">
          <div className="artist-name">{artist.name}</div>
          <div className="artist-location">{artist.location}</div>
        </div>
        <button className="btn btn-outline btn-sm">Quick Contact</button>
      </div>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button
          className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`tab-button ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          Events
        </button>
        <button
          className={`tab-button ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
        >
          Artist Info
        </button>
      </div>

      {/* Tab Content */}
      <div className="manage-artist-content">
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'events' && renderEventsTab()}
        {activeTab === 'info' && renderArtistInfoTab()}
      </div>
    </div>
  );
};

export default ManageArtistScreen;
