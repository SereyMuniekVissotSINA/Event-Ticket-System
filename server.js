const express = require('express');
const path = require('path');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = 3000;

// ===== MIDDLEWARE =====

// Built-in middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Custom logger middleware - logs all requests
app.use(logger);

// ===== ROUTES =====

// Home route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Assignment 4: Error Handler Middleware',
        routes: {
            home: '/',
            working: '/working',
            test_error: '/test-error',
            intentional_error: '/error'
        }
    });
});

// Working route - no errors
app.get('/working', (req, res) => {
    res.json({
        success: true,
        message: 'This route works perfectly!'
    });
});

// Test route 1: Intentional error - using next(err)
app.get('/error', (req, res, next) => {
    const err = new Error('This is an intentional test error!');
    err.name = 'IntentionalError';
    next(err);
});

// Test route 2: Synchronous error - accessing undefined property
app.get('/test-error', (req, res) => {
    // This will throw an error
    const data = undefined;
    const value = data.someProperty; // TypeError
    res.json({ value });
});

// Catch-all for 404 errors
app.use((req, res, next) => {
    const err = new Error('Page not found');
    err.name = 'NotFoundError';
    next(err);
});

// ===== ERROR HANDLER MIDDLEWARE =====
// IMPORTANT: Must be placed LAST, after all routes
// Must have 4 parameters: (err, req, res, next)
app.use(errorHandler);

// ===== START SERVER =====
app.listen(PORT, () => {
    console.log(`\n✓ Server running on http://localhost:${PORT}`);
    console.log(`\nTest routes:`);
    console.log(`  ✓ GET http://localhost:${PORT}/ (home)`);
    console.log(`  ✓ GET http://localhost:${PORT}/working (working route)`);
    console.log(`  ✗ GET http://localhost:${PORT}/error (intentional error)`);
    console.log(`  ✗ GET http://localhost:${PORT}/test-error (property access error)`);
    console.log(`\nError logs written to: logs/errorLog.txt\n`);
});
