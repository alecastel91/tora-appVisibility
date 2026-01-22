import React, { useState, useEffect } from 'react';
import { CloseIcon, CalendarIcon, DollarIcon, TrendingUpIcon, HandshakeIcon, ImageIcon, SlidersIcon, FileTextIcon } from '../../utils/icons';
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

  // Fetch fresh profile data on mount
  useEffect(() => {
    const fetchFreshProfile = async () => {
      console.log('[ManageProfileScreen] Component mounted, fetching fresh profile data');
      await reloadProfileData();
    };
    fetchFreshProfile();
  }, []); // Run once on mount

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

  // Fetch dashboard data - matches ManageArtistScreen logic
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?._id) {
        console.log('[ManageProfileScreen] No user._id, skipping dashboard fetch');
        return;
      }

      try {
        console.log('[ManageProfileScreen] Fetching deals for user:', user._id);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yearStart = new Date(today.getFullYear(), 0, 1);

        // Fetch deals using profileId parameter
        const response = await apiService.getDeals({ profileId: user._id });
        console.log('[ManageProfileScreen] Deals response:', response);

        if (response && response.deals && response.deals.length > 0) {
          setDeals(response.deals);

          // Count upcoming gigs with PENDING, NEGOTIATING, or ACCEPTED status
          const upcoming = response.deals.filter(deal => {
            const dealDate = new Date(deal.date);
            const hasUpcomingDate = dealDate >= today;
            const hasActiveStatus = ['PENDING', 'NEGOTIATING', 'ACCEPTED'].includes(deal.status);
            return hasUpcomingDate && hasActiveStatus;
          });
          setUpcomingGigs(upcoming.length);

          // Calculate This Year Gigs: only completed or past accepted deals this year
          const thisYearDeals = response.deals.filter(deal => {
            const dealDate = new Date(deal.date);
            const isThisYear = dealDate >= yearStart && dealDate <= today;
            const isCompleted = deal.status === 'COMPLETED';
            const isAcceptedAndPast = deal.status === 'ACCEPTED' && dealDate < today;
            return isThisYear && (isCompleted || isAcceptedAndPast);
          });
          setThisYearGigs(thisYearDeals.length);

          // Calculate YTD Revenue: sum all COMPLETED or past ACCEPTED deals from current year
          const ytdDeals = response.deals.filter(deal => {
            const dealDate = new Date(deal.date);
            const isThisYear = dealDate >= yearStart && dealDate <= today;
            const isCompleted = deal.status === 'COMPLETED';
            const isAcceptedAndPast = deal.status === 'ACCEPTED' && dealDate < today;
            return isThisYear && (isCompleted || isAcceptedAndPast);
          });

          // Fetch exchange rates to convert all deals to preferred currency
          if (ytdDeals.length > 0) {
            try {
              const ratesResponse = await apiService.getCurrentRates();
              const rates = ratesResponse.rates;

              let totalRevenue = 0;
              for (const deal of ytdDeals) {
                const dealCurrency = deal.currency || 'USD';
                const dealFee = parseFloat(deal.currentFee) || 0;

                let convertedFee = dealFee;
                if (dealCurrency !== preferredCurrency) {
                  const feeInUSD = dealCurrency === 'USD' ? dealFee : dealFee / rates[dealCurrency];
                  convertedFee = preferredCurrency === 'USD' ? feeInUSD : feeInUSD * rates[preferredCurrency];
                }

                totalRevenue += convertedFee;
              }

              setYtdRevenue(Math.round(totalRevenue * 100) / 100);
            } catch (rateError) {
              console.error('Error fetching exchange rates:', rateError);
              const total = ytdDeals.reduce((sum, deal) => sum + (parseFloat(deal.currentFee) || 0), 0);
              setYtdRevenue(Math.round(total * 100) / 100);
            }
          } else {
            setYtdRevenue(0);
          }

          // Calculate Expected Revenue from upcoming gigs
          if (upcoming.length > 0) {
            try {
              const ratesResponse = await apiService.getCurrentRates();
              const rates = ratesResponse.rates;

              let totalExpected = 0;
              for (const deal of upcoming) {
                const dealCurrency = deal.currency || 'USD';
                const dealFee = parseFloat(deal.currentFee) || 0;

                let convertedFee = dealFee;
                if (dealCurrency !== preferredCurrency) {
                  const feeInUSD = dealCurrency === 'USD' ? dealFee : dealFee / rates[dealCurrency];
                  convertedFee = preferredCurrency === 'USD' ? feeInUSD : feeInUSD * rates[preferredCurrency];
                }

                totalExpected += convertedFee;
              }

              setExpectedRevenue(Math.round(totalExpected * 100) / 100);
            } catch (rateError) {
              console.error('Error fetching exchange rates for expected revenue:', rateError);
              const total = upcoming.reduce((sum, deal) => sum + (parseFloat(deal.currentFee) || 0), 0);
              setExpectedRevenue(Math.round(total * 100) / 100);
            }
          } else {
            setExpectedRevenue(0);
          }

          // Calculate monthly revenue data from 2024 onwards
          const startDate = new Date('2024-01-01');
          const historicalDeals = response.deals.filter(deal => {
            const dealDate = new Date(deal.date);
            const isFrom2024 = dealDate >= startDate;
            const isCompleted = deal.status === 'COMPLETED';
            const isAcceptedAndPast = deal.status === 'ACCEPTED' && dealDate < new Date();
            return isFrom2024 && (isCompleted || isAcceptedAndPast);
          });

          // Group by month/year
          const monthlyRevenue = {};
          for (const deal of historicalDeals) {
            const dealDate = new Date(deal.date);
            const monthKey = `${dealDate.getFullYear()}-${String(dealDate.getMonth() + 1).padStart(2, '0')}`;

            const dealCurrency = deal.currency || 'USD';
            const dealFee = parseFloat(deal.currentFee) || 0;

            let convertedFee = dealFee;
            if (dealCurrency !== preferredCurrency) {
              try {
                const ratesResponse = await apiService.getCurrentRates();
                const rates = ratesResponse.rates;
                const feeInUSD = dealCurrency === 'USD' ? dealFee : dealFee / rates[dealCurrency];
                convertedFee = preferredCurrency === 'USD' ? feeInUSD : feeInUSD * rates[preferredCurrency];
              } catch (err) {
                console.error('Error converting currency for chart:', err);
              }
            }

            if (!monthlyRevenue[monthKey]) {
              monthlyRevenue[monthKey] = 0;
            }
            monthlyRevenue[monthKey] += convertedFee;
          }

          // Generate array from 2024-01 to current month
          const chartData = [];
          const currentDate = new Date();
          let iterDate = new Date('2024-01-01');

          while (iterDate <= currentDate) {
            const monthKey = `${iterDate.getFullYear()}-${String(iterDate.getMonth() + 1).padStart(2, '0')}`;
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const monthName = monthNames[iterDate.getMonth()];
            const year = iterDate.getFullYear();

            chartData.push({
              monthKey,
              month: monthName,
              year: year,
              amount: Math.round(monthlyRevenue[monthKey] || 0)
            });

            iterDate.setMonth(iterDate.getMonth() + 1);
          }

          setRevenueChartData(chartData);

          console.log('[ManageProfileScreen] Dashboard metrics set:', {
            upcomingGigs: upcoming.length,
            thisYearGigs: thisYearDeals.length,
            ytdRevenue: ytdDeals.length
          });
        } else {
          // No deals found
          setUpcomingGigs(0);
          setYtdRevenue(0);
          setThisYearGigs(0);
          setExpectedRevenue(0);
          setRevenueChartData([]);
        }

      } catch (error) {
        console.error('[ManageProfileScreen] Error fetching dashboard data:', error);
        // Set to 0 on error
        setUpcomingGigs(0);
        setYtdRevenue(0);
        setThisYearGigs(0);
        setExpectedRevenue(0);
      }
    };

    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id, preferredCurrency]);

  // Sync documents when user changes
  useEffect(() => {
    console.log('[ManageProfileScreen] User changed, syncing documents:', user?.documents);
    if (user?.documents) {
      console.log('[ManageProfileScreen] Setting documents from user:', user.documents);
      setDocuments({
        pressKit: user.documents.pressKit || [],
        technicalRider: user.documents.technicalRider || [],
        contracts: user.documents.contracts || []
      });
    } else {
      console.log('[ManageProfileScreen] User has no documents field, initializing empty');
      setDocuments({
        pressKit: [],
        technicalRider: [],
        contracts: []
      });
    }
  }, [user]);

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

    console.log('[ManageProfileScreen] Saving documents:', updatedDocuments);
    setDocuments(updatedDocuments);

    // Save to backend
    try {
      console.log('[ManageProfileScreen] Calling API to save documents for user:', user._id);
      const response = await apiService.updateProfile(user._id, { documents: updatedDocuments });
      console.log('[ManageProfileScreen] API response:', response);

      console.log('[ManageProfileScreen] Reloading profile data...');
      await reloadProfileData();
      console.log('[ManageProfileScreen] Profile data reloaded');
    } catch (error) {
      console.error('[ManageProfileScreen] Error saving document:', error);
      alert('Failed to save document. Please try again.');
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

  // Handle tab change with fresh data fetch for documents
  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab === 'documents') {
      console.log('[ManageProfileScreen] Switching to documents tab, fetching fresh data');
      await reloadProfileData();
    }
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
    console.log('[ManageProfileScreen] Rendering documents tab. Current documents state:', documents);

    const renderDocCategory = (category, icon, title, note = null) => {
      console.log(`[ManageProfileScreen] Rendering ${category}, count:`, documents[category].length);
      return (
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
    };

    return (
      <div className="artist-info-tab">
        {renderDocCategory('pressKit', <ImageIcon />, 'Press Kit', 'Add links to press photos, bio, EPK, or music samples')}
        {renderDocCategory('technicalRider', <SlidersIcon />, 'Technical Rider', 'Add links to tech rider, stage plot, or hospitality requirements')}
        {renderDocCategory('contracts', <FileTextIcon />, 'Contracts', 'Add contract templates. These can be customized per booking.')}
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
          onClick={() => handleTabChange('dashboard')}
        >
          Dashboard
        </button>
        <button
          className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => handleTabChange('calendar')}
        >
          Calendar
        </button>
        <button
          className={`tab-button ${activeTab === 'documents' ? 'active' : ''}`}
          onClick={() => handleTabChange('documents')}
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
