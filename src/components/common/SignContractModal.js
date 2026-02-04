import React, { useState, useEffect } from 'react';

/**
 * SignContractModal Component
 * Modal for signing contracts with legal compliance features:
 * - Full name input
 * - Consent checkbox
 * - Viewing time tracking
 * - IP address capture
 */
const SignContractModal = ({ isOpen, onClose, onSign, contractUrl, dealId, senderName }) => {
  const [fullName, setFullName] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [viewingStartTime, setViewingStartTime] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Track viewing time
  useEffect(() => {
    if (isOpen) {
      setViewingStartTime(Date.now());
      // Reset form when modal opens
      setFullName('');
      setConsentGiven(false);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    if (!consentGiven) {
      setError('You must consent to sign this contract');
      return;
    }

    // Calculate viewing time in seconds
    const viewingTime = viewingStartTime ? Math.floor((Date.now() - viewingStartTime) / 1000) : 0;

    setIsSubmitting(true);

    try {
      await onSign({
        fullName: fullName.trim(),
        consentGiven: true,
        viewingTime: viewingTime
      });

      // Close modal on success
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to sign contract. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Sign Contract</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {/* Contract Info */}
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(138, 43, 226, 0.1)',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid rgba(138, 43, 226, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'rgba(138, 43, 226, 1)' }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>Contract from {senderName}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#999' }}>
                  Please review the contract before signing
                </p>
              </div>
            </div>
          </div>

          {/* Contract Viewer Link */}
          <div style={{ marginBottom: '20px' }}>
            <a
              href={contractUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                textDecoration: 'none',
                width: '100%'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              Open Contract (PDF)
            </a>
          </div>

          {/* Signature Form */}
          <form onSubmit={handleSubmit}>
            {/* Full Name Input */}
            <div style={{ marginBottom: '16px' }}>
              <label htmlFor="fullName" style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '500'
              }}>
                Full Legal Name *
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full legal name"
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px'
                }}
                disabled={isSubmitting}
                required
              />
            </div>

            {/* Consent Checkbox */}
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                cursor: 'pointer',
                fontSize: '13px',
                lineHeight: '1.5'
              }}>
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  disabled={isSubmitting}
                  style={{
                    marginTop: '3px',
                    cursor: 'pointer'
                  }}
                  required
                />
                <span>
                  I have read and reviewed the contract in its entirety. By signing below with my full legal name,
                  I agree to be legally bound by the terms and conditions set forth in this contract.
                  I understand that my electronic signature has the same legal effect as a handwritten signature.
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div style={{
                marginBottom: '16px',
                padding: '10px 12px',
                backgroundColor: 'rgba(255, 51, 51, 0.1)',
                border: '1px solid rgba(255, 51, 51, 0.3)',
                borderRadius: '6px',
                color: '#ff3333',
                fontSize: '13px'
              }}>
                {error}
              </div>
            )}

            {/* Legal Notice */}
            <div style={{
              marginBottom: '20px',
              padding: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.02)',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#666',
              lineHeight: '1.4'
            }}>
              <strong>Legal Notice:</strong> Your signature will be recorded with a timestamp, IP address,
              and unique signature ID for verification purposes. This information will be permanently attached
              to the signed contract document.
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary"
                style={{ flex: 1 }}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={isSubmitting || !fullName.trim() || !consentGiven}
              >
                {isSubmitting ? 'Signing...' : '✓ Sign Contract'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignContractModal;
