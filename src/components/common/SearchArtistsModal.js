import React, { useState, useEffect } from 'react';
import { CloseIcon } from '../../utils/icons';
import apiService from '../../services/api';
import ViewProfileScreen from '../screens/ViewProfileScreen';

const SearchArtistsModal = ({ onClose, onSelectArtist, currentAgentId }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [artists, setArtists] = useState([]);
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
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('');

  // Fetch all artists and sent requests on mount
  useEffect(() => {
    console.log('[SearchArtistsModal] Mounting - fetching data for agent:', currentAgentId);
    fetchArtists();
    fetchSentRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run on mount

  const fetchSentRequests = async () => {
    try {
      const data = await apiService.getProfileData(currentAgentId);

      console.log('[SearchArtistsModal] Profile data received:', {
        agentId: currentAgentId,
        sentRequestsCount: data.sentRequests?.length,
        receivedRequestsCount: data.requests?.length,
        representingArtistsCount: data.profile?.representingArtists?.length
      });

      // Extract IDs of artists we've sent PENDING representation requests to
      const sentRequestedArtistIds = (data.sentRequests || [])
        .filter(req => req.type === 'REPRESENTATION_REQUEST' && req.status === 'PENDING')
        .map(req => req.to._id || req.to.id);

      // Extract IDs of artists who sent us PENDING representation requests
      const receivedRequestedArtistIds = (data.requests || [])
        .filter(req => req.type === 'REPRESENTATION_REQUEST' && req.status === 'PENDING')
        .map(req => req.from._id || req.from.id || req.from);

      // Extract IDs from representingArtists array (source of truth for accepted representations)
      const representedArtistIds = (data.profile?.representingArtists || [])
        .map(artist => artist.profileId?.toString() || artist.profileId);

      // Also check ACCEPTED requests for backward compatibility
      const acceptedRequestedArtistIds = (data.sentRequests || [])
        .filter(req => req.type === 'REPRESENTATION_REQUEST' && req.status === 'ACCEPTED')
        .map(req => req.to._id || req.to.id);

      const acceptedReceivedArtistIds = (data.requests || [])
        .filter(req => req.type === 'REPRESENTATION_REQUEST' && req.status === 'ACCEPTED')
        .map(req => req.from._id || req.from.id || req.from);

      // Combine both sent and received pending requests
      const allPendingRequestIds = [...sentRequestedArtistIds, ...receivedRequestedArtistIds];

      // Combine all accepted: from representingArtists array + ACCEPTED requests
      const allAcceptedRequestIds = [...representedArtistIds, ...acceptedRequestedArtistIds, ...acceptedReceivedArtistIds];

      setSentRequestIds(new Set(allPendingRequestIds));
      setAcceptedRequestIds(new Set(allAcceptedRequestIds));

      // Extract IDs of artists who DECLINED our representation requests
      const declinedArtistIds = (data.sentRequests || [])
        .filter(req => req.type === 'REPRESENTATION_REQUEST' && req.status === 'REJECTED')
        .map(req => req.to._id || req.to.id);
      setDeclinedRequestIds(new Set(declinedArtistIds));

      // Extract IDs of artists we're connected to
      // Use connectedProfileIds from backend (already processed)
      const connectedArtistIds = data.connectedProfileIds || [];

      console.log('[SearchArtistsModal] Connection data:', {
        connectedProfileIdsCount: connectedArtistIds.length,
        connectedIds: connectedArtistIds
      });

      setConnectedIds(new Set(connectedArtistIds));

      // Extract IDs of artists with pending connection requests
      const pendingConnectionArtistIds = (data.sentRequests || [])
        .filter(req => req.type === 'CONNECTION_REQUEST' && req.status === 'PENDING')
        .map(req => req.to._id || req.to.id);
      setPendingConnectionIds(new Set(pendingConnectionArtistIds));

      console.log('[SearchArtistsModal] Final state:', {
        connectedCount: connectedArtistIds.length,
        pendingCount: pendingConnectionArtistIds.length,
        representationRequestsCount: allPendingRequestIds.length,
        acceptedRepresentationCount: allAcceptedRequestIds.length,
        representedArtistIds: representedArtistIds,
        acceptedRequestIds: [...acceptedRequestedArtistIds, ...acceptedReceivedArtistIds],
        allAcceptedIds: allAcceptedRequestIds
      });
    } catch (error) {
      console.error('[SearchArtistsModal] Error fetching sent requests:', error);
    }
  };

  const fetchArtists = async (query = '') => {
    setLoading(true);
    try {
      const params = {
        role: 'ARTIST' // Only search for artists
      };

      if (query) {
        params.search = query;
      }

      const profiles = await apiService.searchProfiles(params);

      // Filter out current agent's profile (just in case)
      const filteredArtists = (profiles || []).filter(profile => {
        const profileId = profile._id || profile.id;
        return profileId !== currentAgentId;
      });

      setArtists(filteredArtists);
      setHasSearched(true);
    } catch (error) {
      console.error('Error fetching artists:', error);
      setArtists([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchArtists(searchQuery);
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Auto-search as user types (debounced effect would be better but this works)
    if (value.length === 0) {
      fetchArtists('');
    }
  };

  const getInitial = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'A';
  };

  const handleCardClick = (artist) => {
    setViewingProfile(artist._id || artist.id);
  };

  const handleConnectClick = (artist) => {
    // Show connection modal when user clicks "Connect"
    setSelectedArtist(artist);
    setConnectionMessage(''); // Reset message
    setShowConnectionModal(true);
  };

  const handleRequestClick = (artist) => {
    // Show message modal when user clicks "Send Request"
    setSelectedArtist(artist);
    setMessageText(''); // Reset message
    setShowMessageModal(true);
  };

  const handleSendRequest = async () => {
    if (!selectedArtist) return;

    setSending(true);
    try {
      const artistId = selectedArtist._id || selectedArtist.id;

      // Call the parent's onSelectArtist function with the artist and message
      await onSelectArtist(selectedArtist, messageText);

      // Update local state to show "Requested" immediately
      setSentRequestIds(prev => new Set([...prev, artistId]));

      // Close the message modal
      setShowMessageModal(false);
      setSelectedArtist(null);
      setMessageText('');

    } catch (error) {
      console.error('Error in handleSendRequest:', error);
    } finally {
      setSending(false);
    }
  };

  const handleSendConnection = async () => {
    if (!selectedArtist) return;

    setSending(true);
    try {
      const artistId = selectedArtist._id || selectedArtist.id;

      // Send connection request (from currentAgentId to artistId)
      await apiService.sendConnectionRequest(currentAgentId, artistId, connectionMessage);

      // Update local state to show "Requested" immediately
      setPendingConnectionIds(prev => new Set([...prev, artistId]));

      // Close the connection modal
      setShowConnectionModal(false);
      setSelectedArtist(null);
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
    setSelectedArtist(null);
    setConnectionMessage('');
  };

  const handleCancelMessage = () => {
    setShowMessageModal(false);
    setSelectedArtist(null);
    setMessageText('');
  };

  return (
    <>
      {/* Main Search Modal */}
      <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content search-artists-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Search TORA Artists</h2>
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
              <p>Searching artists...</p>
            </div>
          )}

          {/* Results */}
          {!loading && hasSearched && (
            <div className="artists-list">
              {artists.length === 0 ? (
                <div className="empty-state">
                  <p>No artists found</p>
                  {searchQuery && (
                    <p className="empty-state-hint">Try a different search term</p>
                  )}
                </div>
              ) : (
                <>
                  <div className="results-header">
                    <p>{artists.length} artist{artists.length !== 1 ? 's' : ''} found</p>
                  </div>
                  {artists.map((artist) => {
                    const artistId = artist._id || artist.id;
                    const hasRequested = sentRequestIds.has(artistId);
                    const hasAccepted = acceptedRequestIds.has(artistId);
                    const wasDeclined = declinedRequestIds.has(artistId);
                    const isConnected = connectedIds.has(artistId);
                    const hasPendingConnection = pendingConnectionIds.has(artistId);

                    // Determine button state and text
                    let buttonText = 'Connect';
                    let buttonClass = 'btn-primary';
                    let buttonDisabled = false;
                    let buttonAction = () => handleConnectClick(artist);

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
                        buttonAction = () => handleRequestClick(artist);
                      }
                    }

                    return (
                      <div key={artistId} className="artist-item">
                        <div
                          className="artist-info clickable"
                          onClick={() => handleCardClick(artist)}
                        >
                          <div className="artist-avatar">
                            {artist.avatar ? (
                              <img src={artist.avatar} alt={artist.name} />
                            ) : (
                              getInitial(artist.name)
                            )}
                          </div>
                          <div className="artist-details">
                            <h4>{artist.name}</h4>
                            <p className="artist-location">{artist.location}</p>
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
      {showConnectionModal && selectedArtist && (
        <div className="modal-overlay" onClick={handleCancelConnection}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Connect with {selectedArtist.name}</h2>
              <button className="close-btn" onClick={handleCancelConnection}>
                <CloseIcon />
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Send a connection request to <strong>{selectedArtist.name}</strong>
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
      {showMessageModal && selectedArtist && (
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
                Sending representation request to <strong>{selectedArtist.name}</strong>
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

export default SearchArtistsModal;
