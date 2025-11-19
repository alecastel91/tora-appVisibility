import React, { useState, useEffect } from 'react';
import { CloseIcon } from '../../utils/icons';
import apiService from '../../services/api';
import ViewProfileScreen from '../screens/ViewProfileScreen';

const SearchAgentsModal = ({ onClose, onSelectAgent, currentArtistId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [viewingProfile, setViewingProfile] = useState(null);
  const [sentRequestIds, setSentRequestIds] = useState(new Set());
  const [acceptedRequestIds, setAcceptedRequestIds] = useState(new Set());
  const [declinedRequestIds, setDeclinedRequestIds] = useState(new Set());
  const [connectedIds, setConnectedIds] = useState(new Set());
  const [pendingConnectionIds, setPendingConnectionIds] = useState(new Set());
  const [sending, setSending] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');

  // Fetch all agents and sent requests on mount
  useEffect(() => {
    console.log('[SearchAgentsModal] Mounting - fetching data for artist:', currentArtistId);
    fetchAgents();
    fetchSentRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run on mount

  const fetchSentRequests = async () => {
    try {
      const data = await apiService.getProfileData(currentArtistId);

      console.log('[SearchAgentsModal] Profile data received:', {
        artistId: currentArtistId,
        sentRequestsCount: data.sentRequests?.length,
        receivedRequestsCount: data.requests?.length
      });

      // Extract IDs of agents we've sent PENDING representation requests to
      const sentRequestedAgentIds = (data.sentRequests || [])
        .filter(req => req.type === 'REPRESENTATION_REQUEST' && req.status === 'PENDING')
        .map(req => req.to._id || req.to.id);

      // Extract IDs of agents who sent us PENDING representation requests
      const receivedRequestedAgentIds = (data.requests || [])
        .filter(req => req.type === 'REPRESENTATION_REQUEST' && req.status === 'PENDING')
        .map(req => req.from._id || req.from.id || req.from);

      // Extract IDs of agents with ACCEPTED representation requests (bidirectional)
      const acceptedRequestedAgentIds = (data.sentRequests || [])
        .filter(req => req.type === 'REPRESENTATION_REQUEST' && req.status === 'ACCEPTED')
        .map(req => req.to._id || req.to.id);

      const acceptedReceivedAgentIds = (data.requests || [])
        .filter(req => req.type === 'REPRESENTATION_REQUEST' && req.status === 'ACCEPTED')
        .map(req => req.from._id || req.from.id || req.from);

      // Combine both sent and received pending requests
      const allPendingRequestIds = [...sentRequestedAgentIds, ...receivedRequestedAgentIds];
      const allAcceptedRequestIds = [...acceptedRequestedAgentIds, ...acceptedReceivedAgentIds];

      setSentRequestIds(new Set(allPendingRequestIds));
      setAcceptedRequestIds(new Set(allAcceptedRequestIds));

      // Extract IDs of agents who DECLINED our representation requests
      const declinedAgentIds = (data.sentRequests || [])
        .filter(req => req.type === 'REPRESENTATION_REQUEST' && req.status === 'REJECTED')
        .map(req => req.to._id || req.to.id);
      setDeclinedRequestIds(new Set(declinedAgentIds));

      // Extract IDs of agents we're connected to
      // Use connectedProfileIds from backend (already processed)
      const connectedAgentIds = data.connectedProfileIds || [];

      console.log('[SearchAgentsModal] Connection data:', {
        connectedProfileIdsCount: connectedAgentIds.length,
        connectedIds: connectedAgentIds
      });

      setConnectedIds(new Set(connectedAgentIds));

      // Extract IDs of agents with pending connection requests
      const pendingConnectionAgentIds = (data.sentRequests || [])
        .filter(req => req.type === 'CONNECTION_REQUEST' && req.status === 'PENDING')
        .map(req => req.to._id || req.to.id);
      setPendingConnectionIds(new Set(pendingConnectionAgentIds));

      console.log('[SearchAgentsModal] Final state:', {
        connectedCount: connectedAgentIds.length,
        pendingCount: pendingConnectionAgentIds.length,
        representationRequestsCount: allPendingRequestIds.length
      });
    } catch (error) {
      console.error('[SearchAgentsModal] Error fetching sent requests:', error);
    }
  };

  const fetchAgents = async (query = '') => {
    setLoading(true);
    try {
      const params = {
        role: 'AGENT' // Only search for agents
      };

      if (query) {
        params.search = query;
      }

      const profiles = await apiService.searchProfiles(params);

      // Filter out current artist's profile (just in case)
      const filteredAgents = (profiles || []).filter(profile => {
        const profileId = profile._id || profile.id;
        return profileId !== currentArtistId;
      });

      setAgents(filteredAgents);
      setHasSearched(true);
    } catch (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAgents(searchQuery);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Auto-search as user types
    if (value.length === 0) {
      fetchAgents('');
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  const handleCardClick = (agent) => {
    setViewingProfile(agent._id || agent.id);
  };

  const handleConnectClick = (agent) => {
    // Show connection modal when user clicks "Connect"
    setSelectedAgent(agent);
    setConnectionMessage(''); // Reset message
    setShowConnectionModal(true);
  };

  const handleRequestClick = (agent) => {
    // Show message modal when user clicks "Send Request"
    setSelectedAgent(agent);
    setMessageText(''); // Reset message
    setShowMessageModal(true);
  };

  const handleSendRequest = async () => {
    if (!selectedAgent) return;

    setSending(true);
    try {
      const agentId = selectedAgent._id || selectedAgent.id;

      // Call the parent's onSelectAgent function with the agent and message
      await onSelectAgent(selectedAgent, messageText);

      // Update local state to show "Requested" immediately
      setSentRequestIds(prev => new Set([...prev, agentId]));

      // Close the message modal
      setShowMessageModal(false);
      setSelectedAgent(null);
      setMessageText('');

    } catch (error) {
      console.error('Error in handleSendRequest:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSendConnection = async () => {
    if (!selectedAgent) return;

    setSending(true);
    try {
      const agentId = selectedAgent._id || selectedAgent.id;

      // Send connection request (from currentArtistId to agentId)
      await apiService.sendConnectionRequest(currentArtistId, agentId, connectionMessage);

      // Update local state to show "Requested" immediately
      setPendingConnectionIds(prev => new Set([...prev, agentId]));

      // Close the connection modal
      setShowConnectionModal(false);
      setSelectedAgent(null);
      setConnectionMessage('');

    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Failed to send connection request');
    } finally {
      setSending(false);
    }
  };

  const handleCancelConnection = () => {
    setShowConnectionModal(false);
    setSelectedAgent(null);
    setConnectionMessage('');
  };

  const handleCancelMessage = () => {
    setShowMessageModal(false);
    setSelectedAgent(null);
    setMessageText('');
  };

  return (
    <>
      {/* Main Search Modal */}
      <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content search-artists-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Search TORA Agents</h2>
          <button className="close-btn" onClick={onClose}>
            <CloseIcon />
          </button>
        </div>

        <div className="modal-body">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="search-form">
            <input
              type="text"
              placeholder="Search by name..."
              value={searchQuery}
              onChange={handleSearchInputChange}
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">
              Search
            </button>
          </form>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <p>Searching agents...</p>
            </div>
          )}

          {/* Results */}
          {!loading && hasSearched && (
            <div className="artists-list">
              {agents.length === 0 ? (
                <div className="empty-state">
                  <p>No agents found</p>
                  {searchQuery && (
                    <p className="empty-state-hint">Try a different search term</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="results-header">
                    <p>{agents.length} agent{agents.length !== 1 ? 's' : ''} found</p>
                  </div>
                  {agents.map((agent) => {
                    const agentId = agent._id || agent.id;
                    const hasRequested = sentRequestIds.has(agentId);
                    const hasAccepted = acceptedRequestIds.has(agentId);
                    const wasDeclined = declinedRequestIds.has(agentId);
                    const isConnected = connectedIds.has(agentId);
                    const hasPendingConnection = pendingConnectionIds.has(agentId);

                    // Determine button state and text
                    let buttonText = 'Connect';
                    let buttonClass = 'btn-primary';
                    let buttonDisabled = false;
                    let buttonAction = () => handleConnectClick(agent);

                    if (hasAccepted) {
                      buttonText = '✓ Represented';
                      buttonClass = 'btn-success';
                      buttonDisabled = true;
                    } else if (wasDeclined) {
                      buttonText = 'Declined';
                      buttonClass = 'btn-secondary';
                      buttonDisabled = true;
                    } else if (hasPendingConnection) {
                      buttonText = 'Requested';
                      buttonClass = 'btn-secondary';
                      buttonDisabled = true;
                    } else if (isConnected) {
                      if (hasRequested) {
                        buttonText = 'Pending';
                        buttonClass = 'btn-secondary';
                        buttonDisabled = true;
                      } else {
                        buttonText = 'Send Request';
                        buttonClass = 'btn-primary';
                        buttonDisabled = false;
                        buttonAction = () => handleRequestClick(agent);
                      }
                    }

                    return (
                      <div key={agentId} className="artist-item">
                        <div
                          className="artist-info clickable"
                          onClick={() => handleCardClick(agent)}
                        >
                          <div className="artist-avatar">
                            {agent.avatar ? (
                              <img src={agent.avatar} alt={agent.name} />
                            ) : (
                              getInitial(agent.name)
                            )}
                          </div>
                          <div className="artist-details">
                            <h4>{agent.name}</h4>
                            <p className="artist-location">{agent.location}</p>
                          </div>
                        </div>
                        <button
                          className={`btn btn-sm ${buttonClass}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!buttonDisabled) {
                              buttonAction();
                            }
                          }}
                          disabled={buttonDisabled}
                        >
                          {buttonText}
                        </button>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Profile View Modal - rendered on top */}
      {viewingProfile && (
        <ViewProfileScreen
          profileId={viewingProfile}
          onClose={() => setViewingProfile(null)}
        />
      )}

      {/* Connection Modal - rendered on top of everything */}
      {showConnectionModal && selectedAgent && (
        <div className="modal-overlay" onClick={handleCancelConnection}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Connect with {selectedAgent.name}</h2>
              <button className="close-btn" onClick={handleCancelConnection}>
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Send a connection request to <strong>{selectedAgent.name}</strong>
              </p>

              <div className="form-group">
                <label>Message (optional)</label>
                <textarea
                  value={connectionMessage}
                  onChange={(e) => setConnectionMessage(e.target.value)}
                  placeholder="Say hi and introduce yourself... (optional)"
                  rows={5}
                  className="form-control"
                  maxLength={500}
                />
                <small className="character-count">{connectionMessage.length}/500</small>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={handleCancelConnection}
                disabled={sending}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSendConnection}
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal - rendered on top of everything */}
      {showMessageModal && selectedAgent && (
        <div className="modal-overlay" onClick={handleCancelMessage}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Send Representation Request</h2>
              <button className="close-btn" onClick={handleCancelMessage}>
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Sending representation request to <strong>{selectedAgent.name}</strong>
              </p>

              <div className="form-group">
                <label>Message (optional)</label>
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Add a personal message to introduce yourself... (optional)"
                  rows={5}
                  className="form-control"
                  maxLength={500}
                />
                <small className="character-count">{messageText.length}/500</small>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-outline"
                onClick={handleCancelMessage}
                disabled={sending}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={handleSendRequest}
                disabled={sending}
              >
                {sending ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SearchAgentsModal;
