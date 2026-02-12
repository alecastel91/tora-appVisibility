import React, { useState, useEffect } from 'react';

/**
 * AddContractModal Component
 * Allows users to add documents via PDF upload or external platform link
 */
const AddContractModal = ({
  isOpen,
  onClose,
  onSave,
  category = 'contract',
  categoryLabel = 'Contract',
  initialTitle = '',
  initialUrl = '',
  initialType = 'link', // 'link' or 'existing'
  existingFileName = '', // For showing existing uploaded PDF
  existingContracts = [] // Array of existing contracts from user.documents.contracts
}) => {
  const [activeTab, setActiveTab] = useState(initialType); // 'link' or 'existing'
  const [title, setTitle] = useState(initialTitle);
  const [selectedFile, setSelectedFile] = useState(null);
  const [externalUrl, setExternalUrl] = useState(initialUrl);
  const [selectedExistingContract, setSelectedExistingContract] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keepExistingFile, setKeepExistingFile] = useState(true); // Whether to keep existing PDF

  // Update form when initial values change (for edit mode)
  useEffect(() => {
    if (isOpen) {
      console.log('[AddContractModal] Modal opened');
      console.log('[AddContractModal] existingContracts received:', existingContracts);
      console.log('[AddContractModal] existingContracts.length:', existingContracts.length);

      setTitle(initialTitle);
      setExternalUrl(initialUrl);
      // Default to 'existing' tab if there are existing contracts, otherwise 'link'
      setActiveTab(existingContracts.length > 0 ? 'existing' : (initialType || 'link'));
      setSelectedFile(null); // Reset file selection when opening
      setSelectedExistingContract(null); // Reset existing contract selection
      setKeepExistingFile(!!existingFileName); // Keep existing if there is one
      setError('');
    }
  }, [isOpen, initialTitle, initialUrl, initialType, existingFileName, existingContracts.length]);

  const handleFileSelect = (file) => {
    setError('');

    // Validate file type
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be under 10MB');
      return;
    }

    setSelectedFile(file);
    setKeepExistingFile(false); // Mark that we're replacing the existing file

    // Auto-fill title from filename if empty
    if (!title) {
      setTitle(file.name.replace('.pdf', ''));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation for 'existing' tab
    if (activeTab === 'existing') {
      if (!selectedExistingContract) {
        setError('Please select a contract');
        return;
      }
    }
    // Validation for 'link' tab
    else {
      if (!title.trim()) {
        setError(`Please enter a ${categoryLabel.toLowerCase()} title`);
        return;
      }

      if (!externalUrl.trim()) {
        setError(`Please enter a ${categoryLabel.toLowerCase()} URL`);
        return;
      }

      // Basic URL validation
      try {
        new URL(externalUrl);
      } catch (err) {
        setError('Please enter a valid URL');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      await onSave({
        type: activeTab, // 'link' or 'existing'
        title: activeTab === 'existing' ? selectedExistingContract.title : title.trim(),
        url: activeTab === 'existing' ? selectedExistingContract.url : externalUrl.trim(),
        existingContract: activeTab === 'existing' ? selectedExistingContract : null
      });

      // Reset form
      setTitle('');
      setSelectedFile(null);
      setExternalUrl('');
      setSelectedExistingContract(null);
      setActiveTab('link');
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to add contract');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>Add {categoryLabel}</h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="modal-body" style={{ padding: '20px' }}>
          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            padding: '4px',
            borderRadius: '8px'
          }}>
            {existingContracts.length > 0 && (
              <button
                onClick={() => setActiveTab('existing')}
                style={{
                  flex: 1,
                  padding: '10px',
                  backgroundColor: activeTab === 'existing' ? '#FF3366' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <polyline points="9 15 11 17 15 13"></polyline>
                </svg>
                Select Existing
              </button>
            )}
            <button
              onClick={() => setActiveTab('link')}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: activeTab === 'link' ? '#FF3366' : 'transparent',
                border: 'none',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              Add External Link
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Select Existing Contract Tab */}
            {activeTab === 'existing' && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{
                  display: 'block',
                  marginBottom: '12px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  Select a Contract from Documents
                </label>
                <div style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)'
                }}>
                  {existingContracts.map((contract, index) => (
                    <div
                      key={contract.id || index}
                      onClick={() => setSelectedExistingContract(contract)}
                      style={{
                        padding: '14px 16px',
                        borderBottom: index < existingContracts.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                        cursor: 'pointer',
                        backgroundColor: selectedExistingContract?.id === contract.id ? 'rgba(255, 51, 102, 0.1)' : 'transparent',
                        transition: 'all 0.2s',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                      onMouseEnter={(e) => {
                        if (selectedExistingContract?.id !== contract.id) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedExistingContract?.id !== contract.id) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }
                      }}
                    >
                      {/* Checkbox Icon */}
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: `2px solid ${selectedExistingContract?.id === contract.id ? '#FF3366' : 'rgba(255, 255, 255, 0.3)'}`,
                        backgroundColor: selectedExistingContract?.id === contract.id ? '#FF3366' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {selectedExistingContract?.id === contract.id && (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>

                      {/* Contract Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#fff',
                          marginBottom: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {contract.title}
                        </div>
                        {contract.url && (
                          <div style={{
                            fontSize: '11px',
                            color: '#999',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {contract.url}
                          </div>
                        )}
                      </div>

                      {/* Document Icon */}
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, opacity: 0.5 }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                    </div>
                  ))}
                </div>
                {existingContracts.length === 0 && (
                  <div style={{
                    padding: '30px',
                    textAlign: 'center',
                    color: '#666',
                    fontSize: '13px'
                  }}>
                    No contracts found in your documents.
                  </div>
                )}
              </div>
            )}

            {/* Document Title - Only show for upload and link tabs */}
            {activeTab !== 'existing' && (
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor="title" style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {categoryLabel} Title *
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={`e.g., ${category === 'pressKit' ? '2026 Artist EPK' : category === 'technicalRider' ? 'Stage & Tech Requirements' : 'Booking Agreement 2026'}`}
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
            )}

            {/* Upload PDF Tab */}
            {activeTab === 'upload' && (
              <>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  style={{
                    border: `2px dashed ${isDragging ? '#FF3366' : 'rgba(255, 255, 255, 0.2)'}`,
                    borderRadius: '8px',
                    padding: '30px',
                    textAlign: 'center',
                    backgroundColor: isDragging ? 'rgba(255, 51, 102, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    transition: 'all 0.2s',
                    marginBottom: '16px'
                  }}
                >
                  {selectedFile ? (
                    <div>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#FF3366" strokeWidth="2" style={{ margin: '0 auto 12px' }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                      </svg>
                      <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                        {selectedFile.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#999' }}>
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setKeepExistingFile(!!existingFileName); // Revert to existing file if there is one
                        }}
                        style={{
                          marginTop: '12px',
                          padding: '6px 12px',
                          backgroundColor: 'transparent',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          borderRadius: '4px',
                          color: '#fff',
                          fontSize: '12px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : keepExistingFile && existingFileName ? (
                    <div>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" style={{ margin: '0 auto 12px' }}>
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="16" y1="13" x2="8" y2="13"></line>
                        <line x1="16" y1="17" x2="8" y2="17"></line>
                      </svg>
                      <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
                        Current PDF: {existingFileName}
                      </p>
                      <p style={{ fontSize: '12px', color: '#4CAF50', marginBottom: '12px' }}>
                        This file will be kept unless you upload a new one
                      </p>
                      <label style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        backgroundColor: '#FF3366',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}>
                        Replace PDF
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleFileSelect(e.target.files[0]);
                            }
                          }}
                          style={{ display: 'none' }}
                          disabled={isSubmitting}
                        />
                      </label>
                    </div>
                  ) : (
                    <>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ margin: '0 auto 12px', opacity: 0.3 }}>
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                      <p style={{ fontSize: '14px', marginBottom: '8px' }}>
                        Drag and drop your PDF here, or
                      </p>
                      <label style={{
                        display: 'inline-block',
                        padding: '8px 16px',
                        backgroundColor: '#FF3366',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}>
                        Browse Files
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              handleFileSelect(e.target.files[0]);
                            }
                          }}
                          style={{ display: 'none' }}
                          disabled={isSubmitting}
                        />
                      </label>
                      <p style={{ fontSize: '11px', color: '#666', marginTop: '12px' }}>
                        PDF only, max 10MB
                      </p>
                    </>
                  )}
                </div>

                {category === 'contracts' && (
                  <div style={{
                    padding: '12px',
                    backgroundColor: 'rgba(138, 43, 226, 0.1)',
                    border: '1px solid rgba(138, 43, 226, 0.2)',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#ccc',
                    lineHeight: '1.5'
                  }}>
                    <strong>Note:</strong> Uploaded PDF contracts will be signed within TORA using our built-in signature workflow. Both parties will need to provide their full legal name and consent before signing.
                  </div>
                )}
              </>
            )}

            {/* External Link Tab */}
            {activeTab === 'link' && (
              <>
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="externalUrl" style={{
                    display: 'block',
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {categoryLabel} URL *
                  </label>
                  <input
                    id="externalUrl"
                    type="url"
                    value={externalUrl}
                    onChange={(e) => setExternalUrl(e.target.value)}
                    placeholder={category === 'contracts' ? 'https://www.docusign.com/...' : 'https://example.com/...'}
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

                {category === 'contracts' && (
                  <>
                    <div style={{
                      padding: '12px',
                      backgroundColor: 'rgba(138, 43, 226, 0.1)',
                      border: '1px solid rgba(138, 43, 226, 0.2)',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#ccc',
                      lineHeight: '1.5',
                      marginBottom: '12px'
                    }}>
                      <strong>External Signing Platforms:</strong> Use this option for contracts hosted on platforms like DocuSign, HelloSign, Adobe Sign, PandaDoc, or similar services. The signature process will be handled by the external platform.
                    </div>

                    <div style={{
                      padding: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '6px',
                      fontSize: '11px',
                      color: '#888'
                    }}>
                      <strong>Supported Platforms:</strong> DocuSign, HelloSign (Dropbox Sign), Adobe Sign, PandaDoc, SignNow, and other e-signature services
                    </div>
                  </>
                )}
              </>
            )}

            {/* Error Message */}
            {error && (
              <div style={{
                marginTop: '16px',
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

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
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
                disabled={isSubmitting}
              >
                {isSubmitting ? (activeTab === 'existing' ? 'Sending...' : 'Adding...') : (activeTab === 'existing' ? 'Send Contract' : 'Add')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddContractModal;
