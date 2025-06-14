// Custom error class for API errors
class ApiError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Development error response
  if (process.env.NODE_ENV === 'development') {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack
    });
  } 
  // Production error response
  else {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    } 
    // Programming or other unknown error: don't leak error details
    else {
      // Log error for debugging
      console.error('ERROR 💥', err);
      
      // Send generic message
      res.status(500).json({
        status: 'error',
        message: 'Something went wrong!'
      });
    }
  }
};

// Handle specific error types
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new ApiError(400, message);
};

const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new ApiError(400, message);
};

const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new ApiError(400, message);
};

const handleJWTError = () => 
  new ApiError(401, 'Invalid token. Please log in again!');

const handleJWTExpiredError = () => 
  new ApiError(401, 'Your token has expired! Please log in again.');

// Export the error handler and custom error class
module.exports = {
  ApiError,
  errorHandler,
  handleCastErrorDB,
  handleDuplicateFieldsDB,
  handleValidationErrorDB,
  handleJWTError,
  handleJWTExpiredError
}; 