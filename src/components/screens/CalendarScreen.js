import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAppContext } from '../../contexts/AppContext';
import { zones, countriesByZone, citiesByCountry } from '../../data/profiles';
import { CloseIcon } from '../../utils/icons';
import Modal from '../common/Modal';
import apiService from '../../services/api';

const CalendarScreen = ({ onClose }) => {
  const { t } = useLanguage();
  const { user, updateUser } = useAppContext();
  const [selectedDates, setSelectedDates] = useState(new Set(user?.availableDates || []));
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [schedules, setSchedules] = useState(user?.travelSchedule || []);
  const [editingScheduleId, setEditingScheduleId] = useState(null);

  // Delete confirmation state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState(null);

  // Drag selection state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartDate, setDragStartDate] = useState(null);
  const [dragMode, setDragMode] = useState(null); // 'select' or 'deselect'
  const [hasDragged, setHasDragged] = useState(false); // Track if user actually dragged

// Refresh travel schedule and available dates from backend when calendar opens
  React.useEffect(() => {
    const refreshCalendarData = async () => {
      try {
        const profileId = user?._id || user?.id;
        if (!profileId) return;

        console.log('[CalendarScreen] Refreshing calendar data from backend...');
        const freshProfile = await apiService.getProfile(profileId);

        // Update travel schedule
        setSchedules(freshProfile.travelSchedule || []);

        // Update available dates from backend
        setSelectedDates(new Set(freshProfile.availableDates || []));

        // Also update context to keep it in sync
        updateUser({
          ...user,
          travelSchedule: freshProfile.travelSchedule || [],
          availableDates: freshProfile.availableDates || []
        });

        console.log('[CalendarScreen] Calendar data refreshed successfully');
      } catch (error) {
        console.error('[CalendarScreen] Failed to refresh calendar data:', error);
      }
    };

    refreshCalendarData();
  }, []); // Run once when component mounts

  // Update schedules when user changes (to keep in sync with context)
  React.useEffect(() => {
    if (user?.travelSchedule) {
      setSchedules(user.travelSchedule);
    }
  }, [user?.travelSchedule]);

  // NOTE: We refresh both availableDates and travelSchedule from backend on mount
  // This ensures we have the latest data when switching between CalendarScreen and ManageArtistScreen
  
  const [scheduleForm, setScheduleForm] = useState({
    zone: '',
    country: '',
    city: '',
    startDate: '',
    endDate: '',
    lookingFor: {
      promoter: false,
      venue: false,
      artist: false
    }
  });

  // State for calendar navigation
  const todayDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(todayDate.getMonth());
  const [currentYear, setCurrentYear] = useState(todayDate.getFullYear());
  
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

  // Determine what roles current user can look for based on their role
  const getAvailableLookingForOptions = () => {
    const role = user?.role;
    switch(role) {
      case 'ARTIST':
        return ['promoter', 'venue'];
      case 'PROMOTER':
        return ['artist', 'venue'];
      case 'VENUE':
        return ['artist', 'promoter'];
      case 'AGENT':
        return ['promoter', 'venue'];
      default:
        return [];
    }
  };

  const availableOptions = getAvailableLookingForOptions();

  // Navigation functions
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

  const goToToday = () => {
    setCurrentMonth(todayDate.getMonth());
    setCurrentYear(todayDate.getFullYear());
  };

  const handleClose = () => {
    console.log('[CalendarScreen] Closing with schedules:', schedules);
    console.log('[CalendarScreen] User object:', user);

    // Get profile ID - try multiple possible fields
    const profileId = user?._id || user?.id;

    if (!profileId) {
      console.error('[CalendarScreen] Cannot save - Profile ID is missing. User object:', user);
      // Still close the screen even if we can't save
      onClose();
      return;
    }

    console.log('[CalendarScreen] Using profileId:', profileId);

    // Update context immediately with current state before closing
    const updatedUserData = {
      ...user,
      availableDates: Array.from(selectedDates),
      travelSchedule: schedules
    };

    console.log('[CalendarScreen] Updating context with:', updatedUserData);
    updateUser(updatedUserData);

    // Close immediately
    onClose();

    // Save to backend in background (don't await)
    const saveData = async () => {
      try {
        console.log('[CalendarScreen] Saving to backend, profileId:', profileId, 'data:', {
          availableDates: Array.from(selectedDates),
          travelSchedule: schedules
        });

        // Save available dates and schedules to backend
        const result = await apiService.updateProfile(profileId, {
          availableDates: Array.from(selectedDates),
          travelSchedule: schedules
        });
        console.log('[CalendarScreen] Backend save successful:', result);
      } catch (error) {
        console.error('[CalendarScreen] Failed to save calendar data:', error);
      }
    };

    saveData();
  };

  // Save dates to backend
  const saveDatesToBackend = async (dates) => {
    try {
      const profileId = user?._id || user?.id;

      if (!profileId) {
        console.error('[CalendarScreen] Cannot save available dates - Profile ID is missing, user:', user);
        return;
      }

      console.log('[CalendarScreen] Saving available dates to backend, profileId:', profileId, 'dates:', Array.from(dates));

      // Update context immediately
      const updatedUserData = {
        ...user,
        availableDates: Array.from(dates)
      };
      updateUser(updatedUserData);
      console.log('[CalendarScreen] Context updated');

      // Save to backend using apiService (same as handleClose does at line 175)
      console.log('[CalendarScreen] Calling apiService.updateProfile...');

      const result = await apiService.updateProfile(profileId, {
        availableDates: Array.from(dates)
      });

      console.log('[CalendarScreen] API response:', result);
      console.log('[CalendarScreen] Available dates saved successfully to backend');
    } catch (error) {
      console.error('[CalendarScreen] Failed to save available dates:', error);
      console.error('[CalendarScreen] Error details:', error.message, error.stack);
    }
  };

  // Handle mouse/touch down on a date (start potential drag)
  const handleDateMouseDown = (day) => {
    const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;
    setIsDragging(true);
    setHasDragged(false); // Reset drag tracking
    setDragStartDate(dateKey);

    // Determine if we're selecting or deselecting based on current state
    const isCurrentlySelected = selectedDates.has(dateKey);
    setDragMode(isCurrentlySelected ? 'deselect' : 'select');

    // Toggle immediately for instant visual feedback
    const newSelected = new Set(selectedDates);
    if (isCurrentlySelected) {
      newSelected.delete(dateKey);
    } else {
      newSelected.add(dateKey);
    }

    console.log('[CalendarScreen] Mouse down on date:', dateKey, 'New state:', Array.from(newSelected));
    setSelectedDates(newSelected);
  };

  // Handle mouse/touch enter on a date (during drag)
  const handleDateMouseEnter = (day) => {
    if (!isDragging) return;

    const dateKey = `${currentYear}-${currentMonth + 1}-${day}`;

    // If entering a different date, this is a drag not a click
    if (dateKey !== dragStartDate) {
      setHasDragged(true);
      console.log('[CalendarScreen] Dragging detected');
    }

    const newSelected = new Set(selectedDates);

    if (dragMode === 'select') {
      newSelected.add(dateKey);
    } else {
      newSelected.delete(dateKey);
    }

    setSelectedDates(newSelected);
  };

  // Handle mouse/touch up (end drag or click)
  const handleDateMouseUp = async () => {
    if (isDragging) {
      console.log('[CalendarScreen] Mouse up - hasDragged:', hasDragged, 'dragStartDate:', dragStartDate);

      setIsDragging(false);
      setDragStartDate(null);
      setDragMode(null);
      setHasDragged(false);

      // Trigger save
      setShouldSave(true);
    }
  };

  // Save effect - triggered after drag/click completes
  const [shouldSave, setShouldSave] = React.useState(false);

  React.useEffect(() => {
    console.log('[CalendarScreen] Save effect triggered - shouldSave:', shouldSave, 'selectedDates:', Array.from(selectedDates));
    if (shouldSave) {
      console.log('[CalendarScreen] Saving selectedDates:', Array.from(selectedDates));

      // Call the existing saveDatesToBackend function
      saveDatesToBackend(selectedDates);

      setShouldSave(false);
    }
  }, [shouldSave, selectedDates, saveDatesToBackend]);

  // Add effect to handle global mouse up (in case user releases outside calendar)
  React.useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isDragging) {
        handleDateMouseUp();
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('touchend', handleGlobalMouseUp);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('touchend', handleGlobalMouseUp);
    };
  }, [isDragging, selectedDates]);

  const handleSaveSchedule = async () => {
    if (scheduleForm.startDate && scheduleForm.endDate) {
      // Validate that end date is not before start date
      const startDate = new Date(scheduleForm.startDate);
      const endDate = new Date(scheduleForm.endDate);

      if (endDate < startDate) {
        alert('End date cannot be before start date. Please adjust your dates.');
        return;
      }

      // Check for overlapping schedules
      const hasOverlap = schedules.some((schedule) => {
        // Skip the schedule being edited (check both id and _id)
        if (editingScheduleId && (schedule.id === editingScheduleId || schedule._id === editingScheduleId)) {
          return false;
        }

        const existingStart = new Date(schedule.startDate);
        const existingEnd = new Date(schedule.endDate);

        // Check if date ranges overlap
        // Two date ranges overlap if: start1 <= end2 AND start2 <= end1
        return startDate <= existingEnd && existingStart <= endDate;
      });

      if (hasOverlap) {
        alert('This travel schedule overlaps with an existing schedule. Please choose different dates.');
        return;
      }

      let updatedSchedules;
      if (editingScheduleId) {
        // Editing existing schedule - preserve all existing fields
        updatedSchedules = schedules.map(s => {
          // Check both id and _id (backend uses _id, frontend uses id)
          if (s.id === editingScheduleId || s._id === editingScheduleId) {
            return {
              ...s,              // Preserve all existing fields (including _id, createdAt, etc.)
              ...scheduleForm    // Override with new form data
            };
          }
          return s;
        });
        console.log('[CalendarScreen] Editing existing schedule with id:', editingScheduleId);
      } else {
        // Adding new schedule
        const newSchedule = {
          id: `schedule-${Date.now()}`,
          ...scheduleForm,
          createdAt: new Date().toISOString()
        };
        updatedSchedules = [...schedules, newSchedule];
        console.log('[CalendarScreen] Adding new schedule with id:', newSchedule.id);
      }

      // Update local state immediately for instant feedback
      setSchedules(updatedSchedules);

      try {
        const profileId = user._id || user.id;

        if (!profileId) {
          console.error('Profile ID is missing');
          return;
        }

        // Save to backend
        const updatedProfile = await apiService.updateProfile(profileId, {
          ...user,
          travelSchedule: updatedSchedules
        });

        // Update context with backend response
        updateUser(updatedProfile);

        setShowLocationModal(false);
        setEditingScheduleId(null);
        setScheduleForm({
          zone: '',
          country: '',
          city: '',
          startDate: '',
          endDate: '',
          lookingFor: {
            promoter: false,
            venue: false,
            artist: false
          }
        });
      } catch (error) {
        console.error('Failed to save schedule:', error);
        // Revert local state on error
        setSchedules(schedules);
        alert('Failed to save schedule. Please try again.');
      }
    }
  };

  const handleEditSchedule = (schedule) => {
    // Format dates for HTML date input (YYYY-MM-DD)
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Set schedule form with properly formatted data
    setScheduleForm({
      zone: schedule.zone || '',
      country: schedule.country || '',
      city: schedule.city || '',
      startDate: formatDateForInput(schedule.startDate),
      endDate: formatDateForInput(schedule.endDate),
      lookingFor: {
        promoter: schedule.lookingFor?.promoter || false,
        venue: schedule.lookingFor?.venue || false,
        artist: schedule.lookingFor?.artist || false
      }
    });

    // Use _id if available (backend), otherwise use id (frontend)
    const scheduleId = schedule._id || schedule.id;
    console.log('[CalendarScreen] Editing schedule with id:', scheduleId);
    setEditingScheduleId(scheduleId);
    setShowLocationModal(true);
  };

  const handleRemoveSchedule = (scheduleId) => {
    // Show confirmation dialog
    setScheduleToDelete(scheduleId);
    setShowDeleteConfirmation(true);
  };

  const confirmDeleteSchedule = async () => {
    if (!scheduleToDelete) return;

    // Check both id and _id (backend uses _id, frontend uses id)
    const updatedSchedules = schedules.filter(s => {
      const scheduleId = s._id || s.id;
      return scheduleId !== scheduleToDelete;
    });

    try {
      const profileId = user._id || user.id;

      if (!profileId) {
        console.error('Profile ID is missing');
        setShowDeleteConfirmation(false);
        setScheduleToDelete(null);
        return;
      }

      // Save to backend
      const updatedProfile = await apiService.updateProfile(profileId, {
        ...user,
        travelSchedule: updatedSchedules
      });

      // Update local state
      setSchedules(updatedSchedules);
      updateUser(updatedProfile);

      // Close confirmation dialog
      setShowDeleteConfirmation(false);
      setScheduleToDelete(null);
    } catch (error) {
      console.error('Failed to remove schedule:', error);
      alert('Failed to remove schedule. Please try again.');
      setShowDeleteConfirmation(false);
      setScheduleToDelete(null);
    }
  };

  const cancelDeleteSchedule = () => {
    setShowDeleteConfirmation(false);
    setScheduleToDelete(null);
  };

  const openNewScheduleModal = () => {
    const today = new Date();
    const dateFormatted = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    setScheduleForm({
      zone: '',
      country: '',
      city: '',
      startDate: dateFormatted,
      endDate: dateFormatted,
      lookingFor: {
        promoter: false,
        venue: false,
        artist: false
      }
    });
    setEditingScheduleId(null);
    setShowLocationModal(true);
  };

  const getLocationLabel = (schedule) => {
    const parts = [];

    // Add each location part if it exists and is not empty
    if (schedule.city && schedule.city.trim()) {
      parts.push(schedule.city);
    }
    if (schedule.country && schedule.country.trim()) {
      parts.push(schedule.country);
    }
    if (schedule.zone && schedule.zone.trim()) {
      parts.push(schedule.zone);
    }

    // Return all parts joined with commas, or fallback
    return parts.length > 0 ? parts.join(', ') : 'No location';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getLookingForLabel = (schedule) => {
    const looking = [];
    if (schedule.lookingFor?.promoter) looking.push('Promoters');
    if (schedule.lookingFor?.venue) looking.push('Venues');
    if (schedule.lookingFor?.artist) looking.push('Artists');
    return looking.length > 0 ? looking.join(', ') : 'Not specified';
  };

  const isDateInSchedule = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return schedules.some(schedule => {
      const start = new Date(schedule.startDate);
      const end = new Date(schedule.endDate);
      const current = new Date(dateStr);
      return current >= start && current <= end;
    });
  };

  const getSchedulePosition = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const current = new Date(dateStr);

    for (const schedule of schedules) {
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
    weekDays.forEach((day, index) => {
      days.push(
        <div key={`header-${index}`} className="calendar-weekday">
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
          onClick={() => {
            console.log('[CalendarScreen] onClick fired for day:', day);
            handleDateMouseDown(day);
            handleDateMouseUp();
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleDateMouseDown(day);
          }}
          onMouseEnter={() => handleDateMouseEnter(day)}
          onMouseUp={() => handleDateMouseUp()}
          onTouchStart={(e) => {
            e.preventDefault();
            handleDateMouseDown(day);
          }}
          onTouchMove={(e) => {
            e.preventDefault();
            // Get the element under the touch point
            const touch = e.touches[0];
            const element = document.elementFromPoint(touch.clientX, touch.clientY);
            if (element && element.classList.contains('calendar-day')) {
              // Extract day number from the element's text content
              const dayNum = parseInt(element.textContent);
              if (!isNaN(dayNum)) {
                handleDateMouseEnter(dayNum);
              }
            }
          }}
          onTouchEnd={() => handleDateMouseUp()}
          style={{ userSelect: 'none', WebkitUserSelect: 'none', cursor: 'pointer' }}
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
    <div className="screen active calendar-screen">
      <div className="calendar-header">
        <button className="back-btn" onClick={handleClose}>
          <CloseIcon />
        </button>
        <h1>{t('calendar.title') || 'Calendar & Schedule'}</h1>
        <div style={{ width: '40px' }}></div>
      </div>

      <div className="calendar-content">
        <div className="calendar-container">
          <div className="calendar-month-header">
            <div className="calendar-nav">
              <button className="calendar-nav-btn" onClick={goToPreviousMonth} title="Previous month">
                ‹
              </button>
              <h3 className="calendar-month-title">{monthNames[currentMonth]} {currentYear}</h3>
              <button className="calendar-nav-btn" onClick={goToNextMonth} title="Next month">
                ›
              </button>
            </div>
            <p className="calendar-instructions">
              Tap dates to mark availability. Drag to select multiple dates.
            </p>
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
              <span className="legend-dot has-location"></span>
              <span>Scheduled</span>
            </div>
          </div>
        </div>

        {/* Schedules Display */}
        <div className="schedules-section">
          <div className="schedules-header">
            <h3>Travel Schedules</h3>
            <button 
              className="btn btn-primary btn-small"
              onClick={openNewScheduleModal}
            >
              Add Schedule
            </button>
          </div>

          {schedules.length === 0 ? (
            <div className="no-schedules">
              <p>No schedules added yet</p>
              <button 
                className="add-travel-schedule-btn"
                onClick={openNewScheduleModal}
              >
                + ADD TRAVEL SCHEDULE
              </button>
            </div>
          ) : (
            <div className="travel-schedules-list">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="travel-schedule-item">
                  <div className="schedule-location">
                    {getLocationLabel(schedule)}
                  </div>
                  <div className="schedule-bottom-row">
                    {formatDate(schedule.startDate)} - {formatDate(schedule.endDate)}
                    <button className="icon-btn-edit" onClick={() => handleEditSchedule(schedule)} title="Edit schedule">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button className="icon-btn-delete" onClick={() => handleRemoveSchedule(schedule._id || schedule.id)} title="Delete schedule">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Form Modal */}
      <Modal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        title={editingScheduleId ? 'Edit Schedule' : 'Add Schedule'}
      >
        <div className="schedule-form">
          <div className="form-group">
            <label>Zone</label>
            <select
              value={scheduleForm.zone}
              onChange={(e) => {
                setScheduleForm({
                  ...scheduleForm,
                  zone: e.target.value,
                  country: '',
                  city: ''
                });
              }}
            >
              <option value="">Select Zone</option>
              {zones.map(zone => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>

          {scheduleForm.zone && (
            <div className="form-group">
              <label>Country</label>
              <select
                value={scheduleForm.country}
                onChange={(e) => {
                  setScheduleForm({
                    ...scheduleForm,
                    country: e.target.value,
                    city: ''
                  });
                }}
              >
                <option value="">Select Country</option>
                {countriesByZone[scheduleForm.zone]?.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          )}

          {scheduleForm.country && (
            <div className="form-group">
              <label>City</label>
              <select
                value={scheduleForm.city}
                onChange={(e) => {
                  setScheduleForm({
                    ...scheduleForm,
                    city: e.target.value
                  });
                }}
              >
                <option value="">Select City</option>
                {citiesByCountry[scheduleForm.country]?.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={scheduleForm.startDate}
                onChange={(e) => setScheduleForm({...scheduleForm, startDate: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={scheduleForm.endDate}
                onChange={(e) => setScheduleForm({...scheduleForm, endDate: e.target.value})}
              />
            </div>
          </div>

          {/* What are you looking for section */}
          {availableOptions.length > 0 && (
            <div className="looking-for-section">
              <h4>What are you looking for?</h4>
              <div className="looking-for-options">
                {availableOptions.includes('promoter') && (
                  <label className="looking-for-option">
                    <input
                      type="checkbox"
                      checked={scheduleForm.lookingFor.promoter}
                      onChange={(e) => setScheduleForm({
                        ...scheduleForm,
                        lookingFor: {
                          ...scheduleForm.lookingFor,
                          promoter: e.target.checked
                        }
                      })}
                    />
                    <span>Promoters</span>
                  </label>
                )}
                {availableOptions.includes('venue') && (
                  <label className="looking-for-option">
                    <input
                      type="checkbox"
                      checked={scheduleForm.lookingFor.venue}
                      onChange={(e) => setScheduleForm({
                        ...scheduleForm,
                        lookingFor: {
                          ...scheduleForm.lookingFor,
                          venue: e.target.checked
                        }
                      })}
                    />
                    <span>Venues</span>
                  </label>
                )}
                {availableOptions.includes('artist') && (
                  <label className="looking-for-option">
                    <input
                      type="checkbox"
                      checked={scheduleForm.lookingFor.artist}
                      onChange={(e) => setScheduleForm({
                        ...scheduleForm,
                        lookingFor: {
                          ...scheduleForm.lookingFor,
                          artist: e.target.checked
                        }
                      })}
                    />
                    <span>Artists</span>
                  </label>
                )}
              </div>
            </div>
          )}

          <div className="form-actions">
            <button 
              className="btn btn-secondary"
              onClick={() => setShowLocationModal(false)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-primary"
              onClick={handleSaveSchedule}
            >
              {editingScheduleId ? 'Update' : 'Save'} Schedule
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirmation}
        onClose={cancelDeleteSchedule}
        title="Delete Travel Schedule"
      >
        <div className="delete-confirmation">
          <p>Are you sure you want to delete this travel schedule?</p>
          <div className="form-actions">
            <button
              className="btn btn-secondary"
              onClick={cancelDeleteSchedule}
            >
              Cancel
            </button>
            <button
              className="btn btn-danger"
              onClick={confirmDeleteSchedule}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CalendarScreen;