const fs = require('fs');
const path = require('path');

// Logger middleware - logs all incoming requests
function logger(req, res, next) {
    const logDir = path.join(__dirname, '../logs');
    const logFile = path.join(logDir, 'requests.txt');

    // Ensure logs directory exists
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }

    // Create log entry with timestamp
    const timestamp = new Date().toLocaleString();
    const logMessage = `[${timestamp}] ${req.method} ${req.path}\n`;

    // Append to log file
    fs.appendFileSync(logFile, logMessage, 'utf8');

    // Continue to next middleware
    next();
}

module.exports = logger;