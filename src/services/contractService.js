const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

/**
 * Contract Service
 * Handles all contract-related API calls
 */

/**
 * Upload a document PDF (not tied to a deal)
 * @param {File} file - The PDF file to upload
 * @param {string} profileId - The profile ID uploading the document
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Upload response with document metadata
 */
export const uploadDocument = async (file, profileId, token) => {
  const formData = new FormData();
  formData.append('contract', file);
  formData.append('profileId', profileId);

  const response = await fetch(`${API_URL}/contracts/upload-document`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload document');
  }

  return response.json();
};

/**
 * Upload a contract PDF for a deal
 * @param {File} file - The PDF file to upload
 * @param {string} dealId - The deal ID
 * @param {string} profileId - The profile ID uploading the contract
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Upload response with contract metadata
 */
export const uploadContract = async (file, dealId, profileId, token) => {
  const formData = new FormData();
  formData.append('contract', file);
  formData.append('dealId', dealId);
  formData.append('profileId', profileId);

  const response = await fetch(`${API_URL}/contracts/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload contract');
  }

  return response.json();
};

/**
 * Get contract file URL
 * @param {string} filename - The contract filename
 * @param {string} profileId - The profile ID requesting the file
 * @param {string} token - Authentication token
 * @returns {string} Full URL to access the contract file
 */
export const getContractFileUrl = (filename, profileId, token) => {
  return `${API_URL}/contracts/files/${filename}?profileId=${profileId}&token=${token}`;
};

/**
 * Sign a contract
 * @param {string} dealId - The deal ID
 * @param {string} profileId - The profile ID signing the contract
 * @param {Object} signatureData - Signature data (fullName, consentGiven, viewingTime)
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Signature response
 */
export const signContract = async (dealId, profileId, signatureData, token) => {
  const response = await fetch(`${API_URL}/contracts/sign`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      dealId,
      profileId,
      ...signatureData
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sign contract');
  }

  return response.json();
};

/**
 * Track contract viewing
 * @param {string} dealId - The deal ID
 * @param {string} profileId - The profile ID viewing the contract
 * @param {number} viewDuration - Time spent viewing in seconds
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} Tracking response
 */
export const trackContractView = async (dealId, profileId, viewDuration, token) => {
  const response = await fetch(`${API_URL}/contracts/track-view`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      dealId,
      profileId,
      viewDuration
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to track view');
  }

  return response.json();
};

/**
 * Download a signed contract
 * @param {string} filename - The signed contract filename
 * @param {string} profileId - The profile ID downloading the file
 * @param {string} token - Authentication token
 */
export const downloadSignedContract = (filename, profileId, token) => {
  const url = getContractFileUrl(filename, profileId, token);
  window.open(url, '_blank');
};

export default {
  uploadDocument,
  uploadContract,
  getContractFileUrl,
  signContract,
  trackContractView,
  downloadSignedContract
};
