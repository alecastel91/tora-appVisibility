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
  const [schedules, setSchedules] = useState(user?.schedules || []);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  
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

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
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

  const handleClose = async () => {
    try {
      const profileId = user._id || user.id;

      if (!profileId) {
        console.error('Profile ID is missing');
        onClose();
        return;
      }

      // Save available dates and schedules to backend
      const updatedProfile = await apiService.updateProfile(profileId, {
        ...user,
        availableDates: Array.from(selectedDates),
        schedules: schedules
      });

      // Update local state with response from backend
      updateUser(updatedProfile);
      onClose();
    } catch (error) {
      console.error('Failed to save calendar data:', error);
      // Still close even if save fails
      onClose();
    }
  };

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

  const handleSaveSchedule = async () => {
    if (scheduleForm.startDate && scheduleForm.endDate) {
      const newSchedule = {
        id: editingScheduleId || `schedule-${Date.now()}`,
        ...scheduleForm,
        createdAt: new Date().toISOString()
      };

      let updatedSchedules;
      if (editingScheduleId) {
        updatedSchedules = schedules.map(s =>
          s.id === editingScheduleId ? newSchedule : s
        );
      } else {
        updatedSchedules = [...schedules, newSchedule];
      }

      try {
        const profileId = user._id || user.id;

        if (!profileId) {
          console.error('Profile ID is missing');
          return;
        }

        // Save to backend
        const updatedProfile = await apiService.updateProfile(profileId, {
          ...user,
          schedules: updatedSchedules
        });

        // Update local state
        setSchedules(updatedSchedules);
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
        alert('Failed to save schedule. Please try again.');
      }
    }
  };

  const handleEditSchedule = (schedule) => {
    setScheduleForm(schedule);
    setEditingScheduleId(schedule.id);
    setShowLocationModal(true);
  };

  const handleRemoveSchedule = async (scheduleId) => {
    const updatedSchedules = schedules.filter(s => s.id !== scheduleId);

    try {
      const profileId = user._id || user.id;

      if (!profileId) {
        console.error('Profile ID is missing');
        return;
      }

      // Save to backend
      const updatedProfile = await apiService.updateProfile(profileId, {
        ...user,
        schedules: updatedSchedules
      });

      // Update local state
      setSchedules(updatedSchedules);
      updateUser(updatedProfile);
    } catch (error) {
      console.error('Failed to remove schedule:', error);
      alert('Failed to remove schedule. Please try again.');
    }
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
    if (schedule.city) return schedule.city;
    if (schedule.country) return schedule.country;
    if (schedule.zone) return schedule.zone;
    return 'Location';
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
      const hasSchedule = isDateInSchedule(day);
      
      days.push(
        <div
          key={`day-${day}`}
          className={`calendar-day ${isSelected ? 'available' : ''} ${hasSchedule ? 'has-location' : ''}`}
          onClick={() => handleDateClick(day)}
        >
          {day}
          {hasSchedule && <span className="location-dot"></span>}
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
      </div>

      <div className="calendar-content">
        <div className="calendar-container">
          <div className="calendar-month-header">
            <h3>{monthNames[currentMonth]} {currentYear}</h3>
            <p className="calendar-instructions">
              Tap dates to mark availability • Manage your schedules below
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
            <div className="schedules-list">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="schedule-card">
                  <div className="schedule-info">
                    <div className="schedule-location">
                      📍 {getLocationLabel(schedule)}
                    </div>
                    <div className="schedule-dates">
                      📅 {schedule.startDate} to {schedule.endDate}
                    </div>
                    <div className="schedule-looking-for">
                      Looking for: {getLookingForLabel(schedule)}
                    </div>
                  </div>
                  <div className="schedule-actions">
                    <button
                      className="btn-icon"
                      onClick={() => handleEditSchedule(schedule)}
                    >
                      ✏️
                    </button>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => handleRemoveSchedule(schedule.id)}
                    >
                      🗑️
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
    </div>
  );
};

export default CalendarScreen;