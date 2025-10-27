// Application constants

const EVENT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  PAUSED: 'paused'
};

const CONTRIBUTION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
};

const USER_ROLES = {
  ADMIN: 'admin',
  ORGANIZER: 'organizer',
  DONOR: 'donor'
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500
};

const ERROR_MESSAGES = {
  EVENT_NOT_FOUND: 'Event not found',
  CONTRIBUTION_NOT_FOUND: 'Contribution not found',
  INVALID_EMAIL: 'Invalid email format',
  INVALID_AMOUNT: 'Amount must be positive',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden action',
  VALIDATION_ERROR: 'Validation failed',
  SERVER_ERROR: 'Internal server error'
};

module.exports = {
  EVENT_STATUS,
  CONTRIBUTION_STATUS,
  USER_ROLES,
  HTTP_STATUS,
  ERROR_MESSAGES
};
