/**
 * Email utility functions
 */

/**
 * Normalize email address for consistent comparison
 * - Trims whitespace
 * - Converts to lowercase
 * 
 * @param {string} email - Email address to normalize
 * @returns {string} Normalized email address
 */
const normalizeEmail = (email) => {
  return (email || '').trim().toLowerCase();
};

module.exports = {
  normalizeEmail
};
