import React, { useState, useEffect } from 'react';
import { CloseIcon, CalendarIcon, DollarIcon, TrendingUpIcon } from '../../utils/icons';
import CalendarScreen from './CalendarScreen';
import { useAppContext } from '../../contexts/AppContext';
import apiService from '../../services/api';

const ManageProfileScreen = ({ onClose }) => {
  const { user, preferredCurrency, reloadProfileData } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, calendar, documents
  const [upcomingGigs, setUpcomingGigs] = useState(null);
  const [ytdRevenue, setYtdRevenue] = useState(null);
  const [revenueChartData, setRevenueChartData] = useState([]);
  const [thisYearGigs, setThisYearGigs] = useState(null);
  const [expectedRevenue, setExpectedRevenue] = useState(null);
  const [deals, setDeals] = useState([]);

  // Documents state
  const [documents, setDocuments] = useState({
    pressKit: user?.documents?.pressKit || [],
    technicalRider: user?.documents?.technicalRider || [],
    contracts: user?.documents?.contracts || []
  });
  const [showAddDocModal, setShowAddDocModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [docCategory, setDocCategory] = useState('');
  const [newDoc, setNewDoc] = useState({ title: '', url: '' });

  // Currency conversion rates (mock - in production, fetch from API)
  const exchangeRates = {
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 149.50
  };

  const convertCurrency = (amount, fromCurrency, toCurrency) => {
    if (!amount || !fromCurrency || !toCurrency) return 0;
    const amountInUSD = amount / exchangeRates[fromCurrency];
    return amountInUSD * exchangeRates[toCurrency];
  };

  const getCurrencySymbol = (currency) => {
    const symbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥' };
    return symbols[currency] || '$';
  };

  const formatCurrency = (amount) => {
    if (amount >= 1000) {
      return `${Math.round(amount / 1000)}K`;
    }
    return Math.round(amount).toString();
  };

  const formatCurrencyWithSymbol = (amount, currency) => {
    const symbol = getCurrencySymbol(currency);
    if (amount >= 1000) {
      return `${symbol}${Math.round(amount / 1000)}K`;
    }
    return `${symbol}${Math.round(amount)}`;
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?._id) return;

      try {
        // Fetch all deals for this artist
        const dealsData = await apiService.getDeals(user._id);
        setDeals(dealsData.deals || []);

        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);

        // Filter completed and upcoming gigs
        const completedGigs = dealsData.deals.filter(d =>
          d.dealStatus?.status === 'COMPLETED' ||
          (d.dealStatus?.status === 'ACCEPTED' && new Date(d.eventDate) < now)
        );

        const upcomingGigs = dealsData.deals.filter(d =>
          d.dealStatus?.status === 'ACCEPTED' && new Date(d.eventDate) >= now
        );

        const thisYearCompleted = completedGigs.filter(d => new Date(d.eventDate) >= startOfYear);
        const thisYearUpcoming = upcomingGigs.filter(d => new Date(d.eventDate) >= startOfYear);

        setUpcomingGigs(upcomingGigs.length);
        setThisYearGigs(thisYearCompleted.length + thisYearUpcoming.length);

        // Calculate YTD revenue
        const ytdTotal = thisYearCompleted.reduce((sum, deal) => {
          const converted = convertCurrency(deal.fee, deal.currency, preferredCurrency);
          return sum + converted;
        }, 0);
        setYtdRevenue(Math.round(ytdTotal));

        // Calculate expected revenue from upcoming gigs
        const expectedTotal = thisYearUpcoming.reduce((sum, deal) => {
          const converted = convertCurrency(deal.fee, deal.currency, preferredCurrency);
          return sum + converted;
        }, 0);
        setExpectedRevenue(Math.round(expectedTotal));

        // Generate revenue chart data (from Jan 2024 to current month)
        const chartData = [];
        const startYear = 2024;
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        for (let year = startYear; year <= currentYear; year++) {
          const endMonth = year === currentYear ? currentMonth : 11;
          for (let month = (year === startYear ? 0 : 0); month <= endMonth; month++) {
            const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;

            const monthDeals = completedGigs.filter(d => {
              const dealDate = new Date(d.eventDate);
              return dealDate.getFullYear() === year && dealDate.getMonth() === month;
            });

            const monthRevenue = monthDeals.reduce((sum, deal) => {
              const converted = convertCurrency(deal.fee, deal.currency, preferredCurrency);
              return sum + converted;
            }, 0);

            chartData.push({
              monthKey: monthKey,
              month: monthNames[month],
              year: year.toString(),
              amount: Math.round(monthRevenue)
            });
          }
        }

        setRevenueChartData(chartData);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [user?._id, preferredCurrency]);

  // Sync documents when user changes
  useEffect(() => {
    if (user?.documents) {
      setDocuments({
        pressKit: user.documents.pressKit || [],
        technicalRider: user.documents.technicalRider || [],
        contracts: user.documents.contracts || []
      });
    }
  }, [user?.documents]);

  // Document handlers
  const handleAddDocument = (category) => {
    setDocCategory(category);
    setNewDoc({ title: '', url: '' });
    setEditingDoc(null);
    setShowAddDocModal(true);
  };

  const handleEditDocument = (category, doc) => {
    setDocCategory(category);
    setNewDoc({ title: doc.title, url: doc.url });
    setEditingDoc(doc);
    setShowAddDocModal(true);
  };

  const handleSaveDocument = async () => {
    if (!newDoc.title || !newDoc.url) {
      alert('Please provide both title and URL');
      return;
    }

    const updatedDocuments = { ...documents };

    if (editingDoc) {
      const index = updatedDocuments[docCategory].findIndex(d => d.id === editingDoc.id);
      if (index !== -1) {
        updatedDocuments[docCategory][index] = {
          ...editingDoc,
          title: newDoc.title,
          url: newDoc.url
        };
      }
    } else {
      const newDocument = {
        id: Date.now().toString(),
        title: newDoc.title,
        url: newDoc.url,
        addedDate: new Date().toISOString()
      };
      updatedDocuments[docCategory].push(newDocument);
    }

    setDocuments(updatedDocuments);

    // Save to backend
    try {
      await apiService.updateProfile(user._id, { documents: updatedDocuments });
      await reloadProfileData();
    } catch (error) {
      console.error('Error saving document:', error);
    }

    setShowAddDocModal(false);
    setNewDoc({ title: '', url: '' });
    setEditingDoc(null);
  };

  const handleDeleteDocument = async (category, docId) => {
    if (!window.confirm('Are you sure you want to delete this document link?')) {
      return;
    }
    const updatedDocuments = { ...documents };
    updatedDocuments[category] = updatedDocuments[category].filter(d => d.id !== docId);
    setDocuments(updatedDocuments);

    // Save to backend
    try {
      await apiService.updateProfile(user._id, { documents: updatedDocuments });
      await reloadProfileData();
    } catch (error) {
      console.error('Error deleting document:', error);
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      pressKit: 'Press Kit',
      technicalRider: 'Technical Rider',
      contracts: 'Contract'
    };
    return labels[category] || 'Document';
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  // Dashboard Tab
  const renderDashboardTab = () => (
    <div className="dashboard-tab">
      {/* Hero Metrics - 2x2 Grid */}
      <div className="hero-metrics hero-metrics-four">
        {/* Top Row */}
        <div className="metric-card">
          <div className="metric-icon"><CalendarIcon /></div>
          <div className="metric-value">
            {thisYearGigs === null ? '...' : thisYearGigs}
          </div>
          <div className="metric-label">This Year Gigs</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><DollarIcon /></div>
          <div className="metric-value">
            {ytdRevenue === null ? '...' : formatCurrencyWithSymbol(ytdRevenue, preferredCurrency)}
          </div>
          <div className="metric-label">This Year Revenue</div>
        </div>
        {/* Bottom Row */}
        <div className="metric-card">
          <div className="metric-icon"><CalendarIcon /></div>
          <div className="metric-value">
            {upcomingGigs === null ? '...' : upcomingGigs}
          </div>
          <div className="metric-label">Upcoming Gigs</div>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><DollarIcon /></div>
          <div className="metric-value">
            {expectedRevenue === null ? '...' : formatCurrencyWithSymbol(expectedRevenue, preferredCurrency)}
          </div>
          <div className="metric-label">Expected Revenue</div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="dashboard-section revenue-overview-section">
        <h3><TrendingUpIcon /> Revenue Overview</h3>
        <div className="revenue-chart-scroll">
          <div className="revenue-chart" style={{ minHeight: '200px' }}>
            {revenueChartData.length > 0 ? (
              (() => {
                // Calculate maxRevenue once outside the loop
                const maxRevenue = Math.max(...revenueChartData.map(d => d.amount), 1);
                const currencySymbol = getCurrencySymbol(preferredCurrency);

                return revenueChartData.map((item) => {
                  const height = maxRevenue > 0 ? (item.amount / maxRevenue) * 100 : 0;

                  return (
                    <div key={item.monthKey} className="chart-bar-container">
                      <div className="chart-bar" style={{ height: `${Math.max(height, 2)}%` }}>
                        {item.amount > 0 && (
                          <div className="chart-value">
                            {currencySymbol}{item.amount >= 1000 ? Math.round(item.amount / 1000) + 'K' : Math.round(item.amount)}
                          </div>
                        )}
                      </div>
                      <div className="chart-label">
                        {item.month}
                        <div className="chart-year">{item.year}</div>
                      </div>
                    </div>
                  );
                });
              })()
            ) : (
              <div className="no-revenue-data">Loading revenue data...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Documents Tab
  const renderDocumentsTab = () => {
    const renderDocCategory = (category, icon, title, note = null) => (
      <div className="dashboard-section" key={category}>
        <div className="section-header">
          <h3>{icon} {title}</h3>
          {documents[category].length > 0 && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleAddDocument(category)}
            >
              + Add Link
            </button>
          )}
        </div>

        {documents[category].length === 0 ? (
          <div style={{
            padding: '20px 24px',
            textAlign: 'center'
          }}>
            {note && (
              <div style={{
                marginBottom: '12px',
                fontSize: '13px',
                color: '#888'
              }}>
                {note}
              </div>
            )}
            <button
              className="btn btn-primary"
              onClick={() => handleAddDocument(category)}
              style={{
                padding: '10px 20px',
                fontSize: '14px'
              }}
            >
              + Add Link
            </button>
          </div>
        ) : (
          <div className="doc-list">
            {documents[category].map(doc => (
              <div key={doc.id} className="doc-item">
                <div className="doc-info" style={{ flex: 1, minWidth: 0 }}>
                  <div className="doc-name">{doc.title}</div>
                  <div className="doc-meta">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: '#FF3366',
                        textDecoration: 'none',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                        marginBottom: '4px'
                      }}
                    >
                      {doc.url}
                    </a>
                    {doc.addedDate && (
                      <div style={{
                        color: '#666',
                        fontSize: '12px'
                      }}>
                        Added {new Date(doc.addedDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleEditDocument(category, doc)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => handleDeleteDocument(category, doc.id)}
                    style={{ color: '#ff4444' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    return (
      <div className="artist-info-tab">
        {renderDocCategory('pressKit', '🎭', 'Press Kit', 'Add links to press photos, bio, EPK, or music samples')}
        {renderDocCategory('technicalRider', '🎚️', 'Technical Rider', 'Add links to tech rider, stage plot, or hospitality requirements')}
        {renderDocCategory('contracts', '📄', 'Contracts', 'Add contract templates. These can be customized per booking.')}
      </div>
    );
  };

  return (
    <div className="screen active manage-artist-screen">
      <div className="manage-artist-header">
        <button className="back-btn" onClick={onClose}>
          <CloseIcon />
        </button>
        <h1>Manage {user?.name || 'Profile'}</h1>
      </div>

      {/* Artist Info Bar */}
      <div className="artist-info-bar">
        <div className="artist-avatar-small">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} />
          ) : (
            getInitial(user?.name)
          )}
        </div>
        <div className="artist-info-text">
          <div className="artist-name">{user?.name}</div>
          <div className="artist-location">{user?.location}</div>
        </div>
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
          className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          Calendar
        </button>
        <button
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => setActiveTab('documents')}
        >
          Documents
        </button>
      </div>

      {/* Tab Content */}
      <div className="manage-artist-content">
        {activeTab === 'dashboard' && renderDashboardTab()}
        {activeTab === 'calendar' && <CalendarScreen embedded={true} />}
        {activeTab === 'documents' && renderDocumentsTab()}
      </div>

      {/* Add/Edit Document Modal */}
      {showAddDocModal && (
        <div className="modal-overlay" onClick={() => setShowAddDocModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
              <h3 style={{ margin: 0 }}>
                {editingDoc ? `Edit ${getCategoryLabel(docCategory)}` : `Add ${getCategoryLabel(docCategory)}`}
              </h3>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontSize: '14px' }}>
                  Document Title *
                </label>
                <input
                  type="text"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  placeholder="e.g., Press Photos 2024, Tech Rider, Standard Contract"
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px', color: '#fff', fontSize: '14px' }}>
                  Document URL *
                </label>
                <input
                  type="url"
                  value={newDoc.url}
                  onChange={(e) => setNewDoc({ ...newDoc, url: e.target.value })}
                  placeholder="https://drive.google.com/... or https://dropbox.com/..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '14px'
                  }}
                />
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                  Add links to Google Drive, Dropbox, WeTransfer, or any cloud storage
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => {
                    setShowAddDocModal(false);
                    setNewDoc({ title: '', url: '' });
                    setEditingDoc(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSaveDocument}
                >
                  {editingDoc ? 'Save Changes' : 'Add Document'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProfileScreen;
