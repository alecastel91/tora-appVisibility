import React, { useState, useEffect } from 'react';
import { CloseIcon, CalendarIcon, DollarIcon, AlertIcon, FileIcon, MailIcon, TrendingUpIcon, BriefcaseIcon, PlaneIcon, ListIcon, EditIcon, TrashIcon } from '../../utils/icons';
import Modal from '../common/Modal';
import { zones, countriesByZone, citiesByCountry } from '../../data/profiles';
import apiService from '../../services/api';
import { useAppContext } from '../../contexts/AppContext';

const ManageArtistScreen = ({ artist, onClose }) => {
  const { user, preferredCurrency } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, events, info
  const [artistProfile, setArtistProfile] = useState(artist); // Store full artist profile
  const [selectedDates, setSelectedDates] = useState(new Set(artist?.availableDates || []));
  const [travelSchedule, setTravelSchedule] = useState(artist.travelSchedule || []);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState(null);
  const [isActuallyDragging, setIsActuallyDragging] = useState(false);
  const [showTravelModal, setShowTravelModal] = useState(false);
  const [editingScheduleIndex, setEditingScheduleIndex] = useState(null); // Track which schedule is being edited
  const [travelFilter, setTravelFilter] = useState({
    zone: '',
    country: '',
    city: '',
    startDate: '',
    endDate: ''
  });
  const [lookingFor, setLookingFor] = useState({
    promoter: false,
    venue: false
  });
  const [upcomingGigs, setUpcomingGigs] = useState(null); // null means loading, number means loaded
  const [gigsError, setGigsError] = useState(false);
  const [ytdRevenue, setYtdRevenue] = useState(null); // null means loading, number means loaded
  const [revenueChartData, setRevenueChartData] = useState([]); // Monthly revenue data from 2024 onwards
  const [thisYearGigs, setThisYearGigs] = useState(null); // Total gigs this year (completed + upcoming)
  const [expectedRevenue, setExpectedRevenue] = useState(null); // Expected revenue from upcoming gigs
  const [deals, setDeals] = useState([]); // All deals for the artist
  const [expandedDealId, setExpandedDealId] = useState(null); // Track expanded deal in events list

  // Fetch upcoming gigs and YTD revenue from backend
  useEffect(() => {
    if (!artist) return;

    const fetchUpcomingGigs = async () => {
      try {
        // Debug: log the artist object to see what fields it has
        console.log('ManageArtistScreen - Artist object:', artist);

        // Get artist's ID - check multiple possible field names (profileId is from representation relationships)
        const artistId = artist.profileId || artist._id || artist.id;

        console.log('ManageArtistScreen - Artist ID:', artistId);

        if (!artistId) {
          console.warn('Artist ID not found, using mock data');
          setUpcomingGigs(15); // fallback to mock
          return;
        }

        console.log('ManageArtistScreen - Fetching deals for artist:', artistId);

        // Fetch deals for this artist
        const response = await apiService.getDeals({ profileId: artistId });

        console.log('ManageArtistScreen - API response:', response);

        if (response && response.deals) {
          // Store all deals for events list
          setDeals(response.deals || []);

          const today = new Date();
          const yearStart = new Date(today.getFullYear(), 0, 1); // January 1st of current year

          // Count upcoming gigs with PENDING, NEGOTIATING, or ACCEPTED status
          const upcoming = response.deals.filter(deal => {
            const dealDate = new Date(deal.date);
            const hasUpcomingDate = dealDate >= today;
            const hasActiveStatus = ['PENDING', 'NEGOTIATING', 'ACCEPTED'].includes(deal.status);
            return hasUpcomingDate && hasActiveStatus;
          });

          setUpcomingGigs(upcoming.length);
          setGigsError(false);

          // Calculate This Year Gigs: all deals this year (completed + upcoming)
          const thisYearDeals = response.deals.filter(deal => {
            const dealDate = new Date(deal.date);
            const isThisYear = dealDate >= yearStart;
            const hasRelevantStatus = ['COMPLETED', 'ACCEPTED', 'PENDING', 'NEGOTIATING'].includes(deal.status);
            return isThisYear && hasRelevantStatus;
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

              // Convert each deal to preferred currency and sum
              let totalRevenue = 0;
              for (const deal of ytdDeals) {
                const dealCurrency = deal.currency || 'USD';
                const dealFee = parseFloat(deal.currentFee) || 0;

                // Convert deal fee to preferred currency
                let convertedFee = dealFee;
                if (dealCurrency !== preferredCurrency) {
                  // Convert to USD first if needed
                  const feeInUSD = dealCurrency === 'USD' ? dealFee : dealFee / rates[dealCurrency];
                  // Then convert from USD to preferred currency
                  convertedFee = preferredCurrency === 'USD' ? feeInUSD : feeInUSD * rates[preferredCurrency];
                }

                totalRevenue += convertedFee;
              }

              setYtdRevenue(Math.round(totalRevenue * 100) / 100); // Round to 2 decimal places
            } catch (rateError) {
              console.error('Error fetching exchange rates:', rateError);
              // Fallback: calculate without conversion (assume all in same currency)
              const total = ytdDeals.reduce((sum, deal) => sum + (parseFloat(deal.currentFee) || 0), 0);
              setYtdRevenue(Math.round(total * 100) / 100);
            }
          } else {
            // No YTD deals
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

                // Convert to preferred currency
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

            // Convert to preferred currency
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

            // Move to next month
            iterDate.setMonth(iterDate.getMonth() + 1);
          }

          setRevenueChartData(chartData);
        } else {
          // No deals found, set to 0
          setUpcomingGigs(0);
          setYtdRevenue(0);
          setRevenueChartData([]);
          setGigsError(false);
        }
      } catch (error) {
        console.error('Error fetching upcoming gigs:', error);
        // On error, fall back to mock data
        setUpcomingGigs(15);
        setYtdRevenue(127450);
        setGigsError(true);
      }
    };

    fetchUpcomingGigs();
  }, [artist, preferredCurrency]); // Re-run when currency changes

  // Fetch fresh artist profile data (including availableDates) when component mounts
  useEffect(() => {
    const fetchArtistProfile = async () => {
      try {
        const artistId = artist.profileId || artist._id || artist.id;

        if (!artistId) {
          console.warn('ManageArtistScreen - No artist ID found, using passed artist data');
          return;
        }

        console.log('[ManageArtistScreen] Fetching fresh artist profile data for:', artistId);
        const freshProfile = await apiService.getProfile(artistId);

        console.log('[ManageArtistScreen] Fresh profile received:', freshProfile);

        // Update artist profile state
        setArtistProfile(freshProfile);

        // Update available dates from fresh data
        setSelectedDates(new Set(freshProfile.availableDates || []));

        // Update travel schedule from fresh data
        setTravelSchedule(freshProfile.travelSchedule || []);

      } catch (error) {
        console.error('[ManageArtistScreen] Error fetching artist profile:', error);
      }
    };

    fetchArtistProfile();
  }, []); // Run once on mount

  // Scroll to top when component mounts or when switching to dashboard tab
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeTab]);

  // Scroll revenue chart to show latest month
  useEffect(() => {
    if (activeTab === 'dashboard' && revenueChartData.length > 0) {
      // Wait for the chart to render
      setTimeout(() => {
        const chartScroll = document.querySelector('.revenue-chart-scroll');
        if (chartScroll) {
          // Scroll to the right (end of chart)
          chartScroll.scrollLeft = chartScroll.scrollWidth;
        }
      }, 100);
    }
  }, [activeTab, revenueChartData]);

  if (!artist) return null;

  const toggleEventDetails = (eventId) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  const goToPreviousMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const openTravelModal = () => {
    const today = new Date();
    const dateFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setTravelFilter({
      zone: '',
      country: '',
      city: '',
      startDate: dateFormatted,
      endDate: dateFormatted
    });
    setShowTravelModal(true);
  };

  const handleZoneChange = (zone) => {
    setTravelFilter({
      ...travelFilter,
      zone,
      country: '',
      city: ''
    });
  };

  const handleCountryChange = (country) => {
    const zone = Object.entries(countriesByZone).find(([_, countries]) =>
      countries.includes(country)
    )?.[0] || '';

    setTravelFilter({
      ...travelFilter,
      zone,
      country,
      city: ''
    });
  };

  const handleCityChange = (city) => {
    if (!city) {
      setTravelFilter({
        ...travelFilter,
        city: ''
      });
      return;
    }

    const country = Object.entries(citiesByCountry).find(([_, cities]) =>
      cities.includes(city)
    )?.[0] || '';

    const zone = Object.entries(countriesByZone).find(([_, countries]) =>
      countries.includes(country)
    )?.[0] || '';

    setTravelFilter({
      ...travelFilter,
      zone,
      country,
      city
    });
  };

  const saveTravelSchedule = async () => {
    if (travelFilter.zone || travelFilter.country || travelFilter.city) {
      // Clean the schedule data - only keep the location and date fields
      const scheduleData = {
        zone: travelFilter.zone || '',
        country: travelFilter.country || '',
        city: travelFilter.city || '',
        startDate: travelFilter.startDate || '',
        endDate: travelFilter.endDate || '',
        lookingFor: lookingFor
      };

      let updatedSchedule;
      if (editingScheduleIndex !== null) {
        // Editing existing schedule - replace it at the same index
        updatedSchedule = travelSchedule.map((schedule, idx) =>
          idx === editingScheduleIndex ? scheduleData : schedule
        );
      } else {
        // Adding new schedule
        scheduleData.id = Date.now();
        updatedSchedule = [...travelSchedule, scheduleData];
      }

      setTravelSchedule(updatedSchedule);

      // Save to backend
      try {
        console.log('Saving travel schedule:', updatedSchedule);
        const artistId = artistProfile?.profileId || artistProfile?._id || artistProfile?.id || artist._id;
        await apiService.updateProfile(artistId, {
          travelSchedule: updatedSchedule
        });
        console.log('Travel schedule saved successfully to backend');
      } catch (error) {
        console.error('Failed to save travel schedule:', error);
        // Revert on error
        setTravelSchedule(travelSchedule);

        // Check if it's an authentication error
        if (error.message && error.message.includes('Token expired')) {
          alert('Your session has expired. Please log out and log back in.');
        } else if (error.message && error.message.includes('Unauthorized')) {
          alert('Authentication error. Please log out and log back in.');
        } else {
          alert('Failed to save travel schedule: ' + (error.message || 'Please try again'));
        }
      }
    }
    setShowTravelModal(false);
    setEditingScheduleIndex(null); // Reset editing index
  };

  const editTravelSchedule = (index) => {
    const schedule = travelSchedule[index];

    // Format dates for HTML date input (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Set travel filter with formatted dates
    setTravelFilter({
      zone: schedule.zone || '',
      country: schedule.country || '',
      city: schedule.city || '',
      startDate: formatDateForInput(schedule.startDate),
      endDate: formatDateForInput(schedule.endDate)
    });

    // Set looking for preferences
    setLookingFor({
      promoter: schedule.lookingFor?.promoter || false,
      venue: schedule.lookingFor?.venue || false
    });

    // Set the editing index so save knows to update instead of add
    setEditingScheduleIndex(index);

    setShowTravelModal(true);
  };

  const deleteTravelSchedule = async (index) => {
    const updatedSchedule = travelSchedule.filter((_, i) => i !== index);
    const previousSchedule = [...travelSchedule];
    setTravelSchedule(updatedSchedule);

    // Save to backend
    try {
      await apiService.updateProfile(artist._id, {
        travelSchedule: updatedSchedule
      });
      console.log('Travel schedule deleted successfully from backend');
    } catch (error) {
      console.error('Failed to delete travel schedule:', error);
      // Revert on error
      setTravelSchedule(previousSchedule);

      // Check if it's an authentication error
      if (error.message && error.message.includes('Token expired')) {
        alert('Your session has expired. Please log out and log back in.');
      } else if (error.message && error.message.includes('Unauthorized')) {
        alert('Authentication error. Please log out and log back in.');
      } else {
        alert('Failed to delete travel schedule: ' + (error.message || 'Please try again'));
      }
    }
  };

  const getLocationDisplay = (schedule) => {
    if (schedule.city && schedule.country) {
      return `${schedule.city}, ${schedule.country}`;
    } else if (schedule.country) {
      return schedule.country;
    } else {
      return schedule.zone;
    }
  };

  const formatScheduleDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

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
      { month: 'Jan', amount: 15000 },
      { month: 'Feb', amount: 17500 },
      { month: 'Mar', amount: 16000 },
      { month: 'Apr', amount: 19000 },
      { month: 'May', amount: 20500 },
      { month: 'Jun', amount: 18500 },
      { month: 'Jul', amount: 22000 },
      { month: 'Aug', amount: 19500 },
      { month: 'Sep', amount: 25000 },
      { month: 'Oct', amount: 21000 },
      { month: 'Nov', amount: 21450 },
      { month: 'Dec', amount: 23500 }
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

  const formatCurrencyWithSymbol = (amount, currency = 'USD') => {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥'
    };

    const symbol = symbols[currency] || '$';
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

    return `${symbol}${formatted}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'confirmed': return '✅';
      case 'pending-payment': return '⏳';
      case 'offer-pending': return '📝';
      default: return '📅';
    }
  };

  const getCurrencySymbol = (currency = 'USD') => {
    const symbols = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      JPY: '¥'
    };
    return symbols[currency] || '$';
  };

  const getActionIcon = (type) => {
    switch (type) {
      case 'contract': return <FileIcon />;
      case 'payment': return <DollarIcon />;
      case 'inquiry': return <MailIcon />;
      default: return <AlertIcon />;
    }
  };

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
            {gigsError && <span style={{ fontSize: '12px', color: '#999' }}>*</span>}
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

      {/* Action Items */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3><AlertIcon /> Action Required</h3>
          <span className="badge">{mockData.actionItems.length}</span>
        </div>
        <div className="action-items">
          {mockData.actionItems.map(item => (
            <div key={item.id} className="action-item">
              <div className="action-icon">{getActionIcon(item.type)}</div>
              <div className="action-content">
                <div className="action-title">{item.title}</div>
                <div className="action-description">{item.description}</div>
              </div>
              <button className="btn btn-outline btn-sm">{item.action}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderInlineCalendar = () => {
    const getDaysInMonth = (month, year) => {
      return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (month, year) => {
      return new Date(year, month, 1).getDay();
    };

    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth, currentYear);

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Save available dates to backend
    const saveAvailableDatesToBackend = async (dates) => {
      try {
        const artistId = artistProfile?.profileId || artistProfile?._id || artistProfile?.id;

        if (!artistId) {
          console.error('[ManageArtistScreen] Cannot save available dates - Artist ID is missing');
          return;
        }

        console.log('[ManageArtistScreen] Saving available dates to backend for artist:', artistId, 'dates:', Array.from(dates));

        await apiService.updateProfile(artistId, {
          availableDates: Array.from(dates)
        });

        console.log('[ManageArtistScreen] Available dates saved successfully');
      } catch (error) {
        console.error('[ManageArtistScreen] Failed to save available dates:', error);
      }
    };

    const handleDateClick = async (day) => {
      const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
      const newSelected = new Set(selectedDates);

      if (newSelected.has(dateKey)) {
        newSelected.delete(dateKey);
      } else {
        newSelected.add(dateKey);
      }

      setSelectedDates(newSelected);

      // Save to backend immediately
      await saveAvailableDatesToBackend(newSelected);
    };

    const handleDragStart = (day) => {
      setIsDragging(true);
      setDragStartDate(day);
      setIsActuallyDragging(false);
    };

    const handleDragEnter = (day) => {
      if (isDragging && dragStartDate) {
        setIsActuallyDragging(true);
        const start = Math.min(dragStartDate, day);
        const end = Math.max(dragStartDate, day);
        const startDateKey = `${currentYear}-${currentMonth + 1}-${dragStartDate}`;
        const newSelected = new Set();

        // Check if we're selecting or deselecting based on the start date
        const isSelecting = !selectedDates.has(startDateKey);

        // Copy all existing selected dates
        selectedDates.forEach(date => newSelected.add(date));

        for (let i = start; i <= end; i++) {
          const dateKey = `${currentYear}-${currentMonth + 1}-${i}`;
          if (isSelecting) {
            newSelected.add(dateKey);
          } else {
            newSelected.delete(dateKey);
          }
        }

        setSelectedDates(newSelected);
      }
    };

    const handleDragEnd = async () => {
      setIsDragging(false);
      setDragStartDate(null);
      setIsActuallyDragging(false);

      // Save to backend after drag completes
      await saveAvailableDatesToBackend(selectedDates);
    };

    const handleTouchStart = (day) => {
      handleDragStart(day);
    };

    const handleTouchMove = (e) => {
      if (isDragging) {
        e.preventDefault();
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);
        if (element && element.classList.contains('calendar-day') && !element.classList.contains('empty')) {
          const day = parseInt(element.textContent);
          if (!isNaN(day)) {
            handleDragEnter(day);
          }
        }
      }
    };

    const handleTouchEnd = () => {
      handleDragEnd();
    };

    const getSchedulePosition = (day) => {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const current = new Date(dateStr);

      for (const schedule of travelSchedule) {
        const start = new Date(schedule.startDate);
        const end = new Date(schedule.endDate);

        if (current >= start && current <= end) {
          const isStart = current.getTime() === start.getTime();
          const isEnd = current.getTime() === end.getTime();
          const isSingle = isStart && isEnd;

          return {
            hasSchedule: true,
            isStart: isStart && !isSingle,
            isEnd: isEnd && !isSingle,
            isSingle: isSingle,
            isMiddle: !isStart && !isEnd,
            schedule: schedule  // Include the schedule object
          };
        }
      }

      return { hasSchedule: false };
    };

    const getLocationDisplayText = (schedule) => {
      if (!schedule) return '';
      // Priority: City → Country → Zone
      if (schedule.city) return schedule.city;
      if (schedule.country) return schedule.country;
      if (schedule.zone) return schedule.zone;
      return '';
    };

    const renderCalendarDays = () => {
      const days = [];
      const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

      // Render weekday headers
      weekDays.forEach(day => {
        days.push(
          <div key={`header-${day}`} className="calendar-weekday">
            {day}
          </div>
        );
      });

      // Empty cells for days before month starts
      for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(
          <div key={`empty-${i}`} className="calendar-day empty"></div>
        );
      }

      // Render days of month
      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
        const isSelected = selectedDates.has(dateKey);
        const schedulePos = getSchedulePosition(day);

        let scheduleClasses = '';
        if (schedulePos.hasSchedule) {
          if (schedulePos.isSingle) {
            scheduleClasses = 'schedule-single';
          } else if (schedulePos.isStart) {
            scheduleClasses = 'schedule-start';
          } else if (schedulePos.isEnd) {
            scheduleClasses = 'schedule-end';
          } else if (schedulePos.isMiddle) {
            scheduleClasses = 'schedule-middle';
          }
        }

        days.push(
          <div
            key={`day-${day}`}
            className={`calendar-day ${isSelected ? 'available' : ''} ${scheduleClasses}`}
            onClick={(e) => {
              if (!isActuallyDragging) {
                handleDateClick(day);
              }
            }}
            onMouseDown={(e) => {
              if (e.button === 2) return; // Ignore right-click
              e.preventDefault();
              handleDragStart(day);
            }}
            onMouseUp={() => {
              handleDragEnd();
            }}
            onMouseEnter={() => handleDragEnter(day)}
            onTouchStart={() => {
              handleTouchStart(day);
            }}
            onTouchMove={handleTouchMove}
            onTouchEnd={() => {
              handleTouchEnd();
            }}
          >
            {day}
            {schedulePos.hasSchedule && (
              <div className="schedule-label">
                {getLocationDisplayText(schedulePos.schedule)}
              </div>
            )}
          </div>
        );
      }

      return days;
    };

    return (
      <div className="calendar-inline-wrapper">
        <div className="calendar-header-inline">
          <button className="calendar-nav-btn" onClick={goToPreviousMonth}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12 16L6 10L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="calendar-month-info">
            <h4>{monthNames[currentMonth]} {currentYear}</h4>
            <p className="calendar-instructions">
              Tap dates to mark availability. Drag to select multiple dates.
            </p>
          </div>
          <button className="calendar-nav-btn" onClick={goToNextMonth}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M8 16L14 10L8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="calendar-grid">
          {renderCalendarDays()}
        </div>

        <div className="calendar-legend">
          <div className="legend-item">
            <span className="legend-dot available"></span>
            <span>Available</span>
          </div>
          <div className="legend-item">
            <span className="legend-dot unavailable"></span>
            <span>Unavailable</span>
          </div>
        </div>
      </div>
    );
  };

  const renderUpcomingEvents = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter upcoming deals
    const upcomingDeals = deals.filter(deal => {
      const dealDate = new Date(deal.date);
      dealDate.setHours(0, 0, 0, 0);
      return dealDate >= today && deal.status !== 'DECLINED';
    });

    // Cluster deals by month/year
    const clusters = {};
    upcomingDeals.forEach(deal => {
      const date = new Date(deal.date);
      const monthYear = `${date.toLocaleString('en-US', { month: 'long' })} ${date.getFullYear()}`;

      if (!clusters[monthYear]) {
        clusters[monthYear] = {
          monthYear,
          date: date,
          deals: []
        };
      }
      clusters[monthYear].deals.push(deal);
    });

    // Sort clusters by date (ascending for upcoming)
    const sortedClusters = Object.values(clusters).sort((a, b) => a.date - b.date);

    // Sort deals within each cluster
    sortedClusters.forEach(cluster => {
      cluster.deals.sort((a, b) => new Date(a.date) - new Date(b.date));
    });

    const formatDate = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    };

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'PENDING':
          return 'status-badge status-pending';
        case 'NEGOTIATING':
          return 'status-badge status-negotiating';
        case 'ACCEPTED':
          return 'status-badge status-accepted';
        case 'COMPLETED':
          return 'status-badge status-completed';
        default:
          return 'status-badge';
      }
    };

    const toggleDealExpanded = (dealId) => {
      setExpandedDealId(expandedDealId === dealId ? null : dealId);
    };

    if (upcomingDeals.length === 0) {
      return (
        <div className="no-events-message">
          <p>No upcoming events</p>
        </div>
      );
    }

    return (
      <div className="events-list-by-month">
        {sortedClusters.map(cluster => (
          <div key={cluster.monthYear} className="events-month-cluster">
            <div className="month-year-header">{cluster.monthYear}</div>
            <div className="bookings-list">
              {cluster.deals.map(deal => {
                const isExpanded = expandedDealId === deal._id;
                const dealDate = new Date(deal.date);
                const dayNumber = dealDate.getDate();
                const otherParty = deal.venue || deal.artist || {};

                // Check if this is a deal viewed by the artist via their agent
                const artistProfileId = artist.profileId || artist._id || artist.id;
                const isViaAgent = deal.artistId && deal.artistId === artistProfileId && deal.artist._id !== artistProfileId;

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
                          otherParty.name?.charAt(0).toUpperCase() || '?'
                        )}
                      </div>

                      <div
                        className="party-info"
                        onClick={() => toggleDealExpanded(deal._id)}
                        style={{ cursor: 'pointer', flex: 1 }}
                      >
                        <div className="party-name-role">
                          <h3>{otherParty.name || 'Unknown'}</h3>
                          {otherParty.role && (
                            <span className={`role-badge ${otherParty.role.toLowerCase()}`}>
                              {otherParty.role}
                            </span>
                          )}
                        </div>
                        <p className="party-location">{otherParty.location || 'Location TBD'}</p>
                        <div className="party-status-row">
                          <span className={getStatusBadgeClass(deal.status)}>
                            {deal.status}
                          </span>
                          {isViaAgent && (
                            <span className="via-agent-badge">
                              via agent
                            </span>
                          )}
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
                      <div className="booking-details">
                        {deal.eventName && (
                          <div className="booking-detail-row">
                            <span className="detail-label">Event:</span>
                            <span className="detail-value">{deal.eventName}</span>
                          </div>
                        )}
                        {deal.artistName && (
                          <div className="booking-detail-row">
                            <span className="detail-label">Artist:</span>
                            <span className="detail-value">{deal.artistName}</span>
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
                              {deal.setStartTime} - {deal.setEndTime}
                            </span>
                          </div>
                        )}
                        <div className="booking-detail-row">
                          <span className="detail-label">Fee:</span>
                          <span className="detail-value">
                            {deal.currency}{parseInt(deal.currentFee).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderEventsTab = () => (
    <div className="events-tab">
      {/* Calendar View */}
      <div className="dashboard-section">
        <h3><CalendarIcon /> Calendar View</h3>
        {renderInlineCalendar()}

        {/* Travel Schedules */}
        <div className="travel-schedules-section">
          <div className="travel-schedules-header">
            <h3><PlaneIcon /> Travel Schedules</h3>
            <button className="btn btn-primary btn-sm" onClick={openTravelModal}>Add Schedule</button>
          </div>

          {travelSchedule.length === 0 ? (
            <div className="travel-schedules-empty">
              <p>No schedules added yet</p>
              <button className="btn-add-travel-schedule" onClick={openTravelModal}>
                + ADD TRAVEL SCHEDULE
              </button>
            </div>
          ) : (
            <div className="travel-schedules-list">
              {travelSchedule.map((schedule, index) => (
                <div key={index} className="travel-schedule-item">
                  <div className="schedule-location">
                    {getLocationDisplay(schedule)}
                  </div>
                  <div className="schedule-bottom-row">
                    {formatScheduleDate(schedule.startDate)} - {formatScheduleDate(schedule.endDate)}
                    <button className="icon-btn-edit" onClick={() => editTravelSchedule(index)} title="Edit schedule">
                      <EditIcon />
                    </button>
                    <button className="icon-btn-delete" onClick={() => deleteTravelSchedule(index)} title="Delete schedule">
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Event List */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3><ListIcon /> Upcoming Events</h3>
        </div>
        {renderUpcomingEvents()}
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

      {/* Travel Schedule Modal */}
      <Modal
        isOpen={showTravelModal}
        onClose={() => {
          setShowTravelModal(false);
          setEditingScheduleIndex(null);
        }}
        title="Add Travel Schedule"
        className="location-filter-modal"
      >
        <div className="location-filter-form">
          <div className="form-group">
            <label>Zone</label>
            <select
              value={travelFilter.zone}
              onChange={(e) => handleZoneChange(e.target.value)}
            >
              <option value="">All Zones</option>
              {zones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>

          {travelFilter.zone && (
            <div className="form-group">
              <label>Country</label>
              <select
                value={travelFilter.country}
                onChange={(e) => handleCountryChange(e.target.value)}
              >
                <option value="">All Countries</option>
                {countriesByZone[travelFilter.zone]?.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          )}

          {travelFilter.country && (
            <div className="form-group">
              <label>City</label>
              <select
                value={travelFilter.city}
                onChange={(e) => handleCityChange(e.target.value)}
              >
                <option value="">All Cities</option>
                {citiesByCountry[travelFilter.country]?.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={travelFilter.startDate}
              onChange={(e) => setTravelFilter({...travelFilter, startDate: e.target.value})}
            />
          </div>

          <div className="form-group">
            <label>End Date</label>
            <input
              type="date"
              value={travelFilter.endDate}
              onChange={(e) => setTravelFilter({...travelFilter, endDate: e.target.value})}
            />
          </div>

          {/* Looking For Section */}
          <div className="looking-for-section">
            <h4>What are you looking for?</h4>
            <div className="looking-for-options">
              <label className="looking-for-option">
                <input
                  type="checkbox"
                  checked={lookingFor.promoter}
                  onChange={(e) => setLookingFor({...lookingFor, promoter: e.target.checked})}
                />
                <span>Promoters</span>
              </label>
              <label className="looking-for-option">
                <input
                  type="checkbox"
                  checked={lookingFor.venue}
                  onChange={(e) => setLookingFor({...lookingFor, venue: e.target.checked})}
                />
                <span>Venues</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button
              className="btn btn-outline"
              onClick={() => {
                setShowTravelModal(false);
                setEditingScheduleIndex(null);
              }}
            >
              Cancel
            </button>
            <button
              className="btn btn-primary"
              onClick={saveTravelSchedule}
            >
              Add Schedule
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ManageArtistScreen;
