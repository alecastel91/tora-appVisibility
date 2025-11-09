import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/common/Header';
import TabBar from './components/common/TabBar';
import ProfileScreen from './components/screens/ProfileScreen';
import SearchScreen from './components/screens/SearchScreen';
import MatchesScreen from './components/screens/MatchesScreen';
import ExploreScreen from './components/screens/ExploreScreen';
import BookingsScreen from './components/screens/BookingsScreen';
import MessagesScreen from './components/screens/MessagesScreen';
import ChatScreen from './components/screens/ChatScreen';
import ViewProfileScreen from './components/screens/ViewProfileScreen';
import LoginScreen from './components/screens/LoginScreen';
import SignupScreen from './components/screens/SignupScreen';
import Modal from './components/common/Modal';
import { useLanguage } from './contexts/LanguageContext';
import { useAppContext } from './contexts/AppContext';
import apiService from './services/api';
import './styles/App.css';
import './styles/responsive.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showPremium, setShowPremium] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [subscriptionStep, setSubscriptionStep] = useState('payment'); // payment, processing, success
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordChangeData, setPasswordChangeData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordChangeError, setPasswordChangeError] = useState('');
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false);
  const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const { t, language, changeLanguage, availableLanguages } = useLanguage();
  const { updateUser, user, getConversations } = useAppContext();

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await apiService.getCurrentUser();
          // Use profiles array if available, otherwise fallback to single profile
          updateUser(data.profiles || data.profile);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('token');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!isAuthenticated || !user || !user._id) return;

      try {
        const conversations = await getConversations();
        const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
        setUnreadMessagesCount(totalUnread);
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Refresh every 30 seconds when authenticated
    const interval = setInterval(() => {
      if (isAuthenticated && user && user._id) {
        fetchUnreadCount();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, user, activeChatUser]); // Refresh when chat changes

  const handleLoginSuccess = (data) => {
    // Use profiles array if available, otherwise fallback to single profile
    updateUser(data.profiles || data.profile);
    setIsAuthenticated(true);
  };

  const handleSignupSuccess = (data) => {
    updateUser(data.profile);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    apiService.logout();
    setIsAuthenticated(false);
    updateUser(null);
  };

  const handlePasswordChange = async () => {
    setPasswordChangeError('');

    // Validate passwords
    if (passwordChangeData.newPassword !== passwordChangeData.confirmPassword) {
      setPasswordChangeError('New passwords do not match');
      return;
    }

    if (passwordChangeData.newPassword.length < 6) {
      setPasswordChangeError('New password must be at least 6 characters');
      return;
    }

    setPasswordChangeLoading(true);

    try {
      await apiService.changePassword(
        passwordChangeData.currentPassword,
        passwordChangeData.newPassword
      );

      setPasswordChangeSuccess(true);
      setTimeout(() => {
        setShowPasswordChange(false);
        setPasswordChangeData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setPasswordChangeSuccess(false);
      }, 2000);
    } catch (error) {
      setPasswordChangeError(error.message || 'Failed to change password');
    } finally {
      setPasswordChangeLoading(false);
    }
  };

  const renderScreen = () => {
    switch(activeTab) {
      case 'profile':
        return <ProfileScreen />;
      case 'search':
        return <SearchScreen onOpenChat={setActiveChatUser} onNavigateToMessages={() => setActiveTab('messages')} onOpenPremium={() => setShowPremium(true)} />;
      case 'matches':
        return <MatchesScreen onOpenChat={setActiveChatUser} onNavigateToMessages={() => setActiveTab('messages')} />;
      case 'bookings':
        return <BookingsScreen onOpenChat={setActiveChatUser} onNavigateToMessages={() => setActiveTab('messages')} />;
      case 'messages':
        return <MessagesScreen onOpenChat={setActiveChatUser} />;
      default:
        return <ProfileScreen />;
    }
  };

  const handleSelectPlan = (plan) => {
    setSelectedPlan(plan);
    setShowPremium(false);
    setShowSubscription(true);
    setSubscriptionStep('payment');
  };

  const handlePaymentSubmit = () => {
    setSubscriptionStep('processing');
    // Simulate payment processing
    setTimeout(() => {
      setSubscriptionStep('success');
    }, 2000);
  };

  const handleSubscriptionComplete = () => {
    setShowSubscription(false);
    setSubscriptionStep('payment');
    setSelectedPlan(null);
    // Here you would update the user's premium status
  };

  // Show loading screen while checking auth
  if (loading) {
    return (
      <div className="auth-screen">
        <div className="auth-container">
          <div className="auth-header">
            <h1 className="auth-title">TORA</h1>
            <p className="auth-subtitle">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show login/signup screen if not authenticated
  if (!isAuthenticated) {
    return authMode === 'login' ? (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onSwitchToSignup={() => setAuthMode('signup')}
      />
    ) : (
      <SignupScreen
        onSignupSuccess={handleSignupSuccess}
        onSwitchToLogin={() => setAuthMode('login')}
      />
    );
  }

  return (
    <Router>
      <div className="app-container">
        <Header
          onOpenSettings={() => setShowSettings(true)}
          onOpenPremium={() => setShowPremium(true)}
        />
        <main className="app-content">
          {renderScreen()}
        </main>
        {activeChatUser && !viewingProfile && (
          <ChatScreen
            user={activeChatUser}
            onClose={() => setActiveChatUser(null)}
            onOpenProfile={(profile) => setViewingProfile(profile)}
          />
        )}
        {viewingProfile && (
          <ViewProfileScreen
            profile={viewingProfile}
            onClose={() => setViewingProfile(null)}
            onOpenChat={(user) => {
              setViewingProfile(null);
              setActiveChatUser(user);
            }}
          />
        )}
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} unreadMessagesCount={unreadMessagesCount} />
        
        {/* Settings Modal */}
        <Modal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          title={t('settings.title')}
        >
          <div className="settings-content">
            <div className="settings-section">
              <h3>{t('settings.account')}</h3>
              <div className="settings-item">
                <span>{t('settings.email')}</span>
                <span className="settings-value">user@example.com</span>
              </div>
              <div className="settings-item">
                <span>{t('settings.phone')}</span>
                <span className="settings-value">+1 234 567 8900</span>
              </div>
              <button className="btn btn-outline" onClick={() => setShowPasswordChange(true)}>{t('settings.changePassword')}</button>
            </div>
            
            <div className="settings-section">
              <h3>{t('settings.language')}</h3>
              <div className="language-selector">
                {availableLanguages.map(lang => (
                  <button
                    key={lang.code}
                    className={`language-option ${language === lang.code ? 'active' : ''}`}
                    onClick={() => changeLanguage(lang.code)}
                  >
                    <span className="lang-name">{lang.nativeName}</span>
                    {language === lang.code && <span className="checkmark">✓</span>}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="settings-section">
              <h3>{t('settings.notifications')}</h3>
              <div className="settings-item">
                <label className="settings-toggle">
                  <input type="checkbox" defaultChecked />
                  <span>{t('settings.pushNotifications')}</span>
                </label>
              </div>
              <div className="settings-item">
                <label className="settings-toggle">
                  <input type="checkbox" defaultChecked />
                  <span>{t('settings.emailNotifications')}</span>
                </label>
              </div>
              <div className="settings-item">
                <label className="settings-toggle">
                  <input type="checkbox" />
                  <span>{t('settings.smsNotifications')}</span>
                </label>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>{t('settings.privacy')}</h3>
              <div className="settings-item">
                <label className="settings-toggle">
                  <input type="checkbox" defaultChecked />
                  <span>{t('settings.showProfile')}</span>
                </label>
              </div>
              <div className="settings-item">
                <label className="settings-toggle">
                  <input type="checkbox" defaultChecked />
                  <span>{t('settings.allowMessages')}</span>
                </label>
              </div>
              <div className="settings-item">
                <label className="settings-toggle">
                  <input type="checkbox" />
                  <span>{t('settings.shareLocation')}</span>
                </label>
              </div>
            </div>
            
            <div className="settings-section">
              <h3>{t('settings.about')}</h3>
              <div className="settings-item">
                <span>{t('settings.version')}</span>
                <span className="settings-value">1.0.0</span>
              </div>
              <div className="settings-item">
                <button className="settings-link" onClick={() => console.log('Terms of Service')}>{t('settings.termsOfService')}</button>
              </div>
              <div className="settings-item">
                <button className="settings-link" onClick={() => console.log('Privacy Policy')}>{t('settings.privacyPolicy')}</button>
              </div>
            </div>
            
            <div className="settings-actions">
              <button className="btn btn-outline" onClick={handleLogout}>{t('settings.signOut') || 'Sign Out'}</button>
              <button className="btn btn-danger">{t('settings.deleteAccount')}</button>
            </div>
          </div>
        </Modal>

        {/* Password Change Modal */}
        <Modal
          isOpen={showPasswordChange}
          onClose={() => {
            setShowPasswordChange(false);
            setPasswordChangeData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setPasswordChangeError('');
            setPasswordChangeSuccess(false);
          }}
          title="Change Password"
        >
          <div className="password-change-content">
            {passwordChangeSuccess ? (
              <div className="success-state">
                <div className="success-icon">✓</div>
                <h3>Password Changed Successfully</h3>
                <p>Your password has been updated.</p>
              </div>
            ) : (
              <>
                {passwordChangeError && (
                  <div className="error-message">
                    {passwordChangeError}
                  </div>
                )}

                <div className="form-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={passwordChangeData.currentPassword}
                    onChange={(e) => setPasswordChangeData({
                      ...passwordChangeData,
                      currentPassword: e.target.value
                    })}
                    placeholder="Enter current password"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={passwordChangeData.newPassword}
                    onChange={(e) => setPasswordChangeData({
                      ...passwordChangeData,
                      newPassword: e.target.value
                    })}
                    placeholder="Enter new password (min 6 characters)"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordChangeData.confirmPassword}
                    onChange={(e) => setPasswordChangeData({
                      ...passwordChangeData,
                      confirmPassword: e.target.value
                    })}
                    placeholder="Re-enter new password"
                    className="form-input"
                  />
                </div>

                <button
                  className="btn btn-primary btn-full"
                  onClick={handlePasswordChange}
                  disabled={passwordChangeLoading ||
                    !passwordChangeData.currentPassword ||
                    !passwordChangeData.newPassword ||
                    !passwordChangeData.confirmPassword}
                >
                  {passwordChangeLoading ? 'Changing Password...' : 'Change Password'}
                </button>
              </>
            )}
          </div>
        </Modal>

        {/* Premium Upgrade Modal */}
        <Modal
          isOpen={showPremium}
          onClose={() => setShowPremium(false)}
          title="TORA Premium"
        >
          <div className="premium-content">
            <div className="premium-hero">
              <div className="premium-icon-large">
                <StarIcon />
              </div>
              <h2 className="premium-title">Unlock Global Access</h2>
              <p className="premium-description">
                Connect with music professionals worldwide and access exclusive features
              </p>
            </div>
            
            <div className="premium-features">
              <h3>Premium Features</h3>
              <ul className="premium-features-list">
                <li>
                  <span className="feature-icon">🌍</span>
                  <div>
                    <strong>Global Search & Discovery</strong>
                    <p>Connect with artists, venues, and promoters worldwide</p>
                  </div>
                </li>
                <li>
                  <span className="feature-icon">📅</span>
                  <div>
                    <strong>Calendar Matching</strong>
                    <p>Find professionals with matching availability</p>
                  </div>
                </li>
                <li>
                  <span className="feature-icon">🔒</span>
                  <div>
                    <strong>Privacy Controls</strong>
                    <p>Hide your calendar while viewing others</p>
                  </div>
                </li>
                <li>
                  <span className="feature-icon">✈️</span>
                  <div>
                    <strong>Travel Mode</strong>
                    <p>Appear in cities before you arrive</p>
                  </div>
                </li>
                <li>
                  <span className="feature-icon">💬</span>
                  <div>
                    <strong>Unlimited Messages</strong>
                    <p>Connect with unlimited professionals</p>
                  </div>
                </li>
                <li>
                  <span className="feature-icon">⚡</span>
                  <div>
                    <strong>Priority Support</strong>
                    <p>Get help when you need it</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="premium-pricing">
              <div className="price-card">
                <h4>Monthly</h4>
                <div className="price">€19<span>/month</span></div>
                <button className="btn btn-outline" onClick={() => handleSelectPlan('monthly')}>Choose Monthly</button>
              </div>
              <div className="price-card featured">
                <div className="badge">Save 20%</div>
                <h4>Yearly</h4>
                <div className="price">€180<span>/year</span></div>
                <button className="btn btn-primary" onClick={() => handleSelectPlan('yearly')}>Choose Yearly</button>
              </div>
            </div>
            
            <p className="premium-note">
              Cancel anytime. All prices in EUR.
            </p>
          </div>
        </Modal>

        {/* Subscription Modal */}
        <Modal
          isOpen={showSubscription}
          onClose={() => setShowSubscription(false)}
          title={subscriptionStep === 'success' ? 'Welcome to TORA Premium!' : 'Complete Your Subscription'}
        >
          <div className="subscription-content">
            {subscriptionStep === 'payment' && (
              <>
                <div className="subscription-summary">
                  <h3>Order Summary</h3>
                  <div className="summary-item">
                    <span>TORA Premium</span>
                    <span className="summary-value">
                      {selectedPlan === 'monthly' ? '€19/month' : '€180/year'}
                    </span>
                  </div>
                  <div className="summary-item">
                    <span>Plan Type</span>
                    <span className="summary-value">
                      {selectedPlan === 'monthly' ? 'Monthly' : 'Yearly (Save 20%)'}
                    </span>
                  </div>
                  <div className="summary-total">
                    <span>Total</span>
                    <span className="total-value">
                      {selectedPlan === 'monthly' ? '€19' : '€180'}
                    </span>
                  </div>
                </div>

                <div className="payment-section">
                  <h3>Payment Method</h3>
                  <div className="payment-methods">
                    <label className="payment-option">
                      <input type="radio" name="payment" defaultChecked />
                      <div className="payment-card">
                        <span className="payment-icon">💳</span>
                        <span>Credit/Debit Card</span>
                      </div>
                    </label>
                    <label className="payment-option">
                      <input type="radio" name="payment" />
                      <div className="payment-card">
                        <span className="payment-icon">📱</span>
                        <span>Apple Pay</span>
                      </div>
                    </label>
                    <label className="payment-option">
                      <input type="radio" name="payment" />
                      <div className="payment-card">
                        <span className="payment-icon">🅿️</span>
                        <span>PayPal</span>
                      </div>
                    </label>
                  </div>

                  <div className="card-details">
                    <input 
                      type="text" 
                      placeholder="Card Number" 
                      className="input-field"
                      maxLength="19"
                    />
                    <div className="card-row">
                      <input 
                        type="text" 
                        placeholder="MM/YY" 
                        className="input-field"
                        maxLength="5"
                      />
                      <input 
                        type="text" 
                        placeholder="CVV" 
                        className="input-field"
                        maxLength="3"
                      />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Cardholder Name" 
                      className="input-field"
                    />
                  </div>

                  <button 
                    className="btn btn-primary btn-full"
                    onClick={handlePaymentSubmit}
                  >
                    Subscribe Now
                  </button>
                  
                  <p className="payment-note">
                    🔒 Secure payment processed by Stripe
                  </p>
                </div>
              </>
            )}

            {subscriptionStep === 'processing' && (
              <div className="processing-state">
                <div className="spinner"></div>
                <h3>Processing Payment...</h3>
                <p>Please wait while we secure your subscription</p>
              </div>
            )}

            {subscriptionStep === 'success' && (
              <div className="success-state">
                <div className="success-icon">✨</div>
                <h2>You're Now Premium!</h2>
                <p>Welcome to TORA Premium. You now have access to all premium features.</p>
                
                <div className="success-features">
                  <div className="success-feature">
                    <span>✓</span> Global Search Unlocked
                  </div>
                  <div className="success-feature">
                    <span>✓</span> Calendar Matching Active
                  </div>
                  <div className="success-feature">
                    <span>✓</span> Unlimited Messages
                  </div>
                  <div className="success-feature">
                    <span>✓</span> Travel Mode Enabled
                  </div>
                </div>

                <button 
                  className="btn btn-primary btn-full"
                  onClick={handleSubscriptionComplete}
                >
                  Start Exploring
                </button>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </Router>
  );
}

const StarIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
  </svg>
);

export default App;