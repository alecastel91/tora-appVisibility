import React, { useState, useEffect } from 'react';
import { CloseIcon, CalendarIcon, DollarIcon, AlertIcon, FileIcon, MailIcon, TrendingUpIcon, BriefcaseIcon, PlaneIcon, ListIcon, EditIcon, TrashIcon } from '../../utils/icons';
import Modal from '../common/Modal';
import { zones, countriesByZone, citiesByCountry } from '../../data/profiles';
import apiService from '../../services/api';
import { useAppContext } from '../../contexts/AppContext';

const ManageArtistScreen = ({ artist, onClose }) => {
  const { user, preferredCurrency } = useAppContext();
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, events, info
  const [selectedDates, setSelectedDates] = useState(new Set());
  const [travelSchedule, setTravelSchedule] = useState(artist.travelSchedule || []);
  const [expandedEventId, setExpandedEventId] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState(null);
  const [isActuallyDragging, setIsActuallyDragging] = useState(false);
  const [showTravelModal, setShowTravelModal] = useState(false);
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
        } else {
          // No deals found, set to 0
          setUpcomingGigs(0);
          setYtdRevenue(0);
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
      const newSchedule = {
        zone: travelFilter.zone || '',
        country: travelFilter.country || '',
        city: travelFilter.city || '',
        startDate: travelFilter.startDate || '',
        endDate: travelFilter.endDate || '',
        id: Date.now()
      };
      const updatedSchedule = [...travelSchedule, newSchedule];
      setTravelSchedule(updatedSchedule);

      // Save to backend
      try {
        console.log('Saving travel schedule:', updatedSchedule);
        await apiService.updateProfile(artist._id, {
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
  };

  const editTravelSchedule = (index) => {
    const schedule = travelSchedule[index];
    setTravelFilter(schedule);
    setShowTravelModal(true);
    // Remove the schedule temporarily - it will be re-added when saved
    const updatedSchedule = travelSchedule.filter((_, i) => i !== index);
    setTravelSchedule(updatedSchedule);
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
      {/* Hero Metrics */}
      <div className="hero-metrics hero-metrics-two">
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
            {ytdRevenue === null ? '...' : formatCurrencyWithSymbol(ytdRevenue, preferredCurrency)}
          </div>
          <div className="metric-label">YTD Revenue</div>
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

      {/* Revenue Chart */}
      <div className="dashboard-section">
        <h3><TrendingUpIcon /> Revenue Overview</h3>
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
      </div>

      {/* Pending Offers */}
      <div className="dashboard-section">
        <div className="section-header">
          <h3><BriefcaseIcon /> Pending Booking Offers</h3>
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

    const handleDateClick = (day) => {
      const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
      const newSelected = new Set(selectedDates);

      if (newSelected.has(dateKey)) {
        newSelected.delete(dateKey);
      } else {
        newSelected.add(dateKey);
      }

      setSelectedDates(newSelected);
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

    const handleDragEnd = () => {
      setIsDragging(false);
      setDragStartDate(null);
      setIsActuallyDragging(false);
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

    const isDateInTravelSchedule = (day) => {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return travelSchedule.some(schedule => {
        const start = new Date(schedule.startDate);
        const end = new Date(schedule.endDate);
        const current = new Date(dateStr);
        return current >= start && current <= end;
      });
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
        const hasSchedule = isDateInTravelSchedule(day);

        days.push(
          <div
            key={`day-${day}`}
            className={`calendar-day ${isSelected ? 'available' : ''} ${hasSchedule ? 'has-location' : ''}`}
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
            {hasSchedule && <span className="location-dot"></span>}
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
                    {schedule.startDate} - {schedule.endDate}
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
          <span className="badge">{mockData.upcomingEvents.length}</span>
        </div>
        <div className="pending-offers">
          {mockData.upcomingEvents.map(event => {
            const isExpanded = expandedEventId === event.id;
            return (
              <div key={event.id} className="offer-card event-card-with-top-row">
                <div className="event-top-row">
                  <div className="offer-venue">
                    {event.venue}, {event.location}
                  </div>
                  <span className={`status-badge status-${event.status}`}>
                    {getStatusIcon(event.status)} {event.statusLabel}
                  </span>
                </div>
                <div className="offer-details-row">
                  <div className="offer-details">
                    {event.date} • {event.time} • {event.currency}{event.fee.toLocaleString()}
                  </div>
                  {event.status !== 'offer-pending' && (
                    <button
                      className="expand-arrow-btn"
                      onClick={() => toggleEventDetails(event.id)}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        style={{
                          transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s'
                        }}
                      >
                        <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </div>

                {isExpanded && (
                  <div className="event-details-expanded">
                    <div className="event-detail-item">
                      <span className="detail-label">Status:</span>
                      <span className="detail-value">{event.statusDetails}</span>
                    </div>
                    <div className="event-detail-item">
                      <span className="detail-label">Promoter:</span>
                      <span className="detail-value">{event.promoter || 'N/A'}</span>
                    </div>
                    <div className="event-detail-item">
                      <span className="detail-label">Capacity:</span>
                      <span className="detail-value">{event.capacity || 'N/A'}</span>
                    </div>
                    <div className="event-detail-item">
                      <span className="detail-label">Notes:</span>
                      <span className="detail-value">{event.notes || 'No additional notes'}</span>
                    </div>
                  </div>
                )}

                {event.status === 'offer-pending' && (
                  <div className="offer-actions">
                    <button className="btn btn-outline btn-sm">Decline</button>
                    <button className="btn btn-primary btn-sm">Accept</button>
                  </div>
                )}
              </div>
            );
          })}
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

      {/* Travel Schedule Modal */}
      <Modal
        isOpen={showTravelModal}
        onClose={() => setShowTravelModal(false)}
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
              onClick={() => setShowTravelModal(false)}
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
