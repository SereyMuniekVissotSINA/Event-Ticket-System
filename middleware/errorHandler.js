const fs = require('fs');
const path = require('path');

// Error handler middleware - must have 4 parameters (err, req, res, next)
function errorHandler(err, req, res, next) {
    const logDir = path.join(__dirname, '../logs');
    const logFile = path.join(logDir, 'errorLog.txt');

    // Ensure logs directory exists
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    // Get error details
    const errorName = err.name || 'Unknown Error';
    const errorMessage = err.message || 'No message provided';
    const timestamp = new Date().toLocaleString();

    // Create detailed error log entry
    const errorEntry = `
=====================================
Date and Time: ${timestamp}
Error Name: ${errorName}
Error Message: ${errorMessage}
Stack Trace:
${err.stack || 'No stack trace available'}
=====================================
`;

    // Write error to log file
    fs.appendFileSync(logFile, errorEntry, 'utf8');

    // Log error to console
    console.error(`[ERROR] ${errorName}: ${errorMessage}`);

    // Send 500 response to client
    res.status(500).json({
        success: false,
        message: 'An error occurred on the server. Please try again later.'
    });
}

module.exports = errorHandler;