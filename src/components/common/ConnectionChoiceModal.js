import React, { useState } from 'react';
import Modal from './Modal';
import { InfoIcon, HandshakeIcon, UserIcon } from '../../utils/icons';

const ConnectionChoiceModal = ({ artist, onClose, onConnect }) => {
  // This modal should only be shown when artist has a representedBy agent
  // The parent component (ViewProfileScreen) handles the check

  console.log('ConnectionChoiceModal rendered', { artist, onConnect, onClose });

  const [step, setStep] = useState('choice'); // 'choice' or 'message'
  const [selectedType, setSelectedType] = useState(null); // 'AGENT' or 'ARTIST'
  const [message, setMessage] = useState('');

  const handleSelectAgent = () => {
    console.log('Agent selected');
    setSelectedType('AGENT');
    setStep('message');
  };

  const handleSelectArtist = () => {
    console.log('Artist selected');
    setSelectedType('ARTIST');
    setStep('message');
  };

  const handleSendRequest = () => {
    console.log('Sending request with message:', message);
    if (selectedType === 'AGENT') {
      const agentId = artist.representedBy.agentId || artist.representedBy._id;
      console.log('Calling onConnect with agentId:', agentId);
      onConnect(agentId, 'AGENT', artist, message);
    } else {
      console.log('Calling onConnect with artist._id:', artist._id);
      onConnect(artist._id, 'ARTIST', null, message);
    }
    onClose();
  };

  const handleBack = () => {
    setStep('choice');
    setSelectedType(null);
    setMessage('');
  };

  // For the message step, show the simplified message modal
  if (step === 'message') {
    const targetName = selectedType === 'AGENT'
      ? artist.representedBy.name
      : artist.name;

    return (
      <div className="message-modal-overlay" onClick={onClose}>
        <div className="message-modal-bottom" onClick={(e) => e.stopPropagation()}>
          <h2 className="message-modal-title">Send message to {targetName}</h2>

          <textarea
            placeholder="Write a message (optional)..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="5"
            className="message-textarea-bottom"
          />

          <div className="message-modal-actions">
            <button
              className="btn btn-outline btn-modal-cancel"
              onClick={handleBack}
            >
              Back
            </button>
            <button
              className="btn btn-primary btn-modal-send"
              onClick={handleSendRequest}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    );
  }

  // For the choice step, show the selection modal
  return (
    <Modal isOpen={true} onClose={onClose}>
      <div className="connection-choice-modal">
        <h2>Connect with {artist.name}</h2>

        <div className="info-banner">
          <InfoIcon />
          <span>This artist is represented by an agent</span>
        </div>

        <p className="modal-description">
          Who would you like to connect with?
        </p>

        {/* Option 1: Connect with Agent */}
        <button
          className="connection-option agent-option"
          onClick={handleSelectAgent}
        >
          <div className="option-icon">
            <HandshakeIcon />
          </div>
          <div className="option-content">
            <div className="option-title">Connect with Agent</div>
            <div className="option-name">{artist.representedBy.name}</div>
            <div className="option-description">
              For booking inquiries
            </div>
          </div>
          <div className="option-badge">Recommended</div>
        </button>

        {/* Option 2: Connect with Artist */}
        <button
          className="connection-option artist-option"
          onClick={handleSelectArtist}
        >
          <div className="option-icon">
            <UserIcon />
          </div>
          <div className="option-content">
            <div className="option-title">Connect with Artist</div>
            <div className="option-name">{artist.name}</div>
            <div className="option-description">
              For personal collaboration matters
            </div>
          </div>
        </button>

        <button className="btn btn-secondary btn-full" onClick={onClose}>
          Cancel
        </button>
      </div>
    </Modal>
  );
};

export default ConnectionChoiceModal;
