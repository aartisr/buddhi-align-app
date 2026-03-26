/**
 * Input validation utilities for API endpoints
 */

class ValidationError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = statusCode;
  }
}

/**
 * Validates that a request body is a valid non-null object
 */
function validateRequestBody(body) {
  if (!body || typeof body !== 'object') {
    throw new ValidationError(400, 'Request body must be a valid JSON object');
  }

  if (Array.isArray(body)) {
    throw new ValidationError(400, 'Request body must be an object, not an array');
  }
}

/**
 * Validates that a required ID is present and valid
 */
function validateId(id) {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    throw new ValidationError(400, 'Invalid or missing ID');
  }
}

/**
 * Express error handling middleware
 */
function errorHandler(err, req, res, next) {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({ error: err.message });
  } else if (err instanceof Error) {
    console.error('[ERROR]', err.message);
    res.status(500).json({ error: 'Internal server error' });
  } else {
    res.status(500).json({ error: 'Unknown error' });
  }
}

module.exports = {
  ValidationError,
  validateRequestBody,
  validateId,
  errorHandler,
};
