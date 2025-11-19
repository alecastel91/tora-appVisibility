import React from 'react';
import { CloseIcon } from '../../utils/icons';

const ManageArtistScreen = ({ artist, onClose }) => {
  if (!artist) return null;

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  // Mock data for demonstration - would come from API in production
  const mockData = {
    kpis: {
      upcomingGigs: { count: 8, dateRange: 'Next 90 days' },
      totalRevenue: { amount: 127500, currency: 'USD', growth: 23 },
      avgFillRate: { percentage: 87, trend: 'up' },
      avgRating: { rating: 4.8, maxRating: 5 }
    },
    revenueBreakdown: {
      quarters: [
        { name: 'Q1', actual: 28500, target: 30000 },
        { name: 'Q2', actual: 32000, target: 30000 },
        { name: 'Q3', actual: 35000, target: 35000 },
        { name: 'Q4', actual: 32000, target: 40000 }
      ]
    },
    bookingPipeline: {
      confirmed: 8,
      pending: 5,
      inDiscussion: 12,
      proposals: 18
    },
    topMarkets: [
      { city: 'Tokyo', count: 15, percentage: 28 },
      { city: 'Berlin', count: 12, percentage: 22 },
      { city: 'London', count: 10, percentage: 19 },
      { city: 'Amsterdam', count: 8, percentage: 15 },
      { city: 'Barcelona', count: 8, percentage: 15 }
    ],
    upcomingBookings: [
      { date: '2025-11-22', venue: 'Contact Tokyo', event: 'Friday Night', fee: 8500, status: 'Confirmed' },
      { date: '2025-11-29', venue: 'Berghain', event: 'Klubnacht', fee: 12000, status: 'Confirmed' },
      { date: '2025-12-06', venue: 'Fabric London', event: 'Saturday Session', fee: 9500, status: 'Pending Payment' },
      { date: '2025-12-14', venue: 'De School', event: 'Weekend Residency', fee: 11000, status: 'Confirmed' },
      { date: '2025-12-21', venue: 'Warehouse Project', event: 'NYE Warm-up', fee: 15000, status: 'Confirmed' }
    ],
    engagementMetrics: {
      followers: 28500,
      responseRate: 94,
      activeProposals: 18
    },
    recentActivity: [
      { type: 'booking', text: 'Confirmed booking at Contact Tokyo', date: '2 hours ago' },
      { type: 'payment', text: 'Payment received: $12,000', date: '5 hours ago' },
      { type: 'message', text: 'New message from Berghain', date: '1 day ago' },
      { type: 'booking', text: 'Counter-offer sent to Fabric London', date: '2 days ago' },
      { type: 'contract', text: 'Contract signed for De School', date: '3 days ago' }
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Confirmed': return '#4ade80';
      case 'Pending Payment': return '#fbbf24';
      case 'In Review': return '#60a5fa';
      default: return '#a1a1aa';
    }
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 100) return '#4ade80';
    if (percentage >= 80) return '#fbbf24';
    return '#ef4444';
  };

  const getActivityIcon = (type) => {
    switch(type) {
      case 'booking': return '📅';
      case 'payment': return '💰';
      case 'message': return '💬';
      case 'contract': return '📄';
      default: return '📌';
    }
  };

  return (
    <div className="screen active manage-artist-screen">
      <div className="manage-artist-header">
        <button className="back-btn" onClick={onClose}>
          <CloseIcon />
        </button>
        <h1>Manage {artist.name}</h1>
      </div>

      <div className="manage-artist-content">
        {/* Artist Info Header */}
        <div className="manage-artist-info-card">
          <div className="artist-avatar">
            {artist.avatar ? (
              <img src={artist.avatar} alt={artist.name} />
            ) : (
              getInitial(artist.name)
            )}
          </div>
          <div className="artist-info-details">
            <h2>{artist.name}</h2>
            <p className="artist-location">{artist.location}</p>
            {artist.genres && artist.genres.length > 0 && (
              <div className="artist-genres">
                {artist.genres.slice(0, 4).map(genre => (
                  <span key={genre} className="genre-tag-small">{genre}</span>
                ))}
              </div>
            )}
          </div>
          <div className="artist-status-badge">
            <span className="status-indicator active"></span>
            Active
          </div>
        </div>

        {/* Key Performance Indicators */}
        <div className="dashboard-section kpi-section">
          <h3 className="section-title">Key Performance Indicators</h3>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon">📅</div>
              <div className="kpi-content">
                <div className="kpi-value">{mockData.kpis.upcomingGigs.count}</div>
                <div className="kpi-label">Upcoming Gigs</div>
                <div className="kpi-sublabel">{mockData.kpis.upcomingGigs.dateRange}</div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">💰</div>
              <div className="kpi-content">
                <div className="kpi-value">{formatCurrency(mockData.kpis.totalRevenue.amount)}</div>
                <div className="kpi-label">Total Revenue YTD</div>
                <div className="kpi-sublabel" style={{ color: '#4ade80' }}>
                  ↑ {mockData.kpis.totalRevenue.growth}% vs last year
                </div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">📊</div>
              <div className="kpi-content">
                <div className="kpi-value">{mockData.kpis.avgFillRate.percentage}%</div>
                <div className="kpi-label">Average Fill Rate</div>
                <div className="kpi-sublabel" style={{ color: '#4ade80' }}>
                  {mockData.kpis.avgFillRate.trend === 'up' ? '↑' : '↓'} Trending {mockData.kpis.avgFillRate.trend}
                </div>
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">⭐</div>
              <div className="kpi-content">
                <div className="kpi-value">{mockData.kpis.avgRating.rating}</div>
                <div className="kpi-label">Average Rating</div>
                <div className="kpi-sublabel">Out of {mockData.kpis.avgRating.maxRating} stars</div>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="dashboard-section">
          <h3 className="section-title">Revenue Breakdown (2025)</h3>
          <div className="revenue-quarters">
            {mockData.revenueBreakdown.quarters.map((quarter) => {
              const percentage = (quarter.actual / quarter.target) * 100;
              return (
                <div key={quarter.name} className="quarter-item">
                  <div className="quarter-header">
                    <span className="quarter-name">{quarter.name}</span>
                    <span className="quarter-amount">{formatCurrency(quarter.actual)}</span>
                  </div>
                  <div className="quarter-progress-bar">
                    <div
                      className="quarter-progress-fill"
                      style={{
                        width: `${Math.min(percentage, 100)}%`,
                        backgroundColor: getProgressColor(percentage)
                      }}
                    ></div>
                  </div>
                  <div className="quarter-footer">
                    <span className="quarter-target">Target: {formatCurrency(quarter.target)}</span>
                    <span className="quarter-percentage" style={{ color: getProgressColor(percentage) }}>
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking Pipeline & Top Markets */}
        <div className="dashboard-section-row">
          <div className="dashboard-section half-width">
            <h3 className="section-title">Booking Pipeline</h3>
            <div className="pipeline-grid">
              <div className="pipeline-item">
                <div className="pipeline-number confirmed">{mockData.bookingPipeline.confirmed}</div>
                <div className="pipeline-label">Confirmed</div>
              </div>
              <div className="pipeline-item">
                <div className="pipeline-number pending">{mockData.bookingPipeline.pending}</div>
                <div className="pipeline-label">Pending</div>
              </div>
              <div className="pipeline-item">
                <div className="pipeline-number discussion">{mockData.bookingPipeline.inDiscussion}</div>
                <div className="pipeline-label">In Discussion</div>
              </div>
              <div className="pipeline-item">
                <div className="pipeline-number proposals">{mockData.bookingPipeline.proposals}</div>
                <div className="pipeline-label">Proposals</div>
              </div>
            </div>
          </div>

          <div className="dashboard-section half-width">
            <h3 className="section-title">Top Markets</h3>
            <div className="markets-list">
              {mockData.topMarkets.map((market, index) => (
                <div key={market.city} className="market-item">
                  <div className="market-rank">{index + 1}</div>
                  <div className="market-details">
                    <div className="market-name">{market.city}</div>
                    <div className="market-count">{market.count} bookings</div>
                  </div>
                  <div className="market-percentage">{market.percentage}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upcoming Bookings */}
        <div className="dashboard-section">
          <h3 className="section-title">Upcoming Bookings</h3>
          <div className="bookings-list">
            {mockData.upcomingBookings.map((booking, index) => (
              <div key={index} className="booking-item">
                <div className="booking-date">
                  <div className="booking-month">{formatDate(booking.date).split(' ')[0]}</div>
                  <div className="booking-day">{formatDate(booking.date).split(' ')[1]}</div>
                </div>
                <div className="booking-details">
                  <div className="booking-venue">{booking.venue}</div>
                  <div className="booking-event">{booking.event}</div>
                </div>
                <div className="booking-fee">{formatCurrency(booking.fee)}</div>
                <div className="booking-status">
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(booking.status) }}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Engagement Metrics & Quick Actions */}
        <div className="dashboard-section-row">
          <div className="dashboard-section half-width">
            <h3 className="section-title">Engagement Metrics</h3>
            <div className="engagement-grid">
              <div className="engagement-item">
                <div className="engagement-icon">👥</div>
                <div className="engagement-content">
                  <div className="engagement-value">{mockData.engagementMetrics.followers.toLocaleString()}</div>
                  <div className="engagement-label">Followers</div>
                </div>
              </div>
              <div className="engagement-item">
                <div className="engagement-icon">⚡</div>
                <div className="engagement-content">
                  <div className="engagement-value">{mockData.engagementMetrics.responseRate}%</div>
                  <div className="engagement-label">Response Rate</div>
                </div>
              </div>
              <div className="engagement-item">
                <div className="engagement-icon">📋</div>
                <div className="engagement-content">
                  <div className="engagement-value">{mockData.engagementMetrics.activeProposals}</div>
                  <div className="engagement-label">Active Proposals</div>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-section half-width">
            <h3 className="section-title">Quick Actions</h3>
            <div className="quick-actions-grid">
              <button className="quick-action-btn">
                <span className="action-icon">📅</span>
                <span className="action-label">View Schedule</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">💰</span>
                <span className="action-label">Financial Overview</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">📊</span>
                <span className="action-label">Analytics</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">📄</span>
                <span className="action-label">Contracts</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">🎵</span>
                <span className="action-label">Media Kit</span>
              </button>
              <button className="quick-action-btn">
                <span className="action-icon">🎯</span>
                <span className="action-label">Book New Gig</span>
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section">
          <h3 className="section-title">Recent Activity</h3>
          <div className="activity-feed">
            {mockData.recentActivity.map((activity, index) => (
              <div key={index} className="activity-item">
                <div className="activity-icon">{getActivityIcon(activity.type)}</div>
                <div className="activity-content">
                  <div className="activity-text">{activity.text}</div>
                  <div className="activity-date">{activity.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="manage-artist-footer">
          <button className="btn btn-secondary btn-full" onClick={onClose}>
            Close Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageArtistScreen;
