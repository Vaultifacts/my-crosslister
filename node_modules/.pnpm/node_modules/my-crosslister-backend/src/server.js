const express = require('express');
const path = require('path');

const server = express();
const PORT = process.env.PORT || 5000;

// View engine setup (EJS)
server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, 'views'));

// Serve static files (CSS, JS, images, etc.) if you have a public folder
server.use(express.static(path.join(__dirname, 'public')));

// Middleware for parsing body (useful if you add forms later)
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

// Example user object (used in avatar button)
// Replace this with your real authentication/session logic later
const user = {
    email: 'user@example.com'
};

// Routes

// Root route (redirects to feedback for testing)
server.get('/', (req, res) => {
    res.redirect('/feedback');
});

// Inventory page
server.get('/inventory', (req, res) => {
    const items = []; // empty for now – prevents "items is not defined"
    res.render('inventory', { user, items });
});

server.get('/my-shops', (req, res) => {
    res.render('my-shops', { user });
});

server.get('/settings', (req, res) => {
    res.render('settings', { user });
});

// Feedback list page
server.get('/feedback', (req, res) => {
    res.render('feedback', { user });
});

// Feedback detail routes
server.get('/feedback/depop-refresh-listings', (req, res) => {
    res.render('feedback-detail', { user });
});

server.get('/feedback/adding-price-shipping', (req, res) => {
    res.render('feedback-detail', { user });
});

server.get('/feedback/:slug', (req, res) => {
    res.render('feedback-detail', { user });
});

// Roadmap page
server.get('/roadmap', (req, res) => {
    res.render('roadmap', { user });
});

// Change Log page
server.get('/changelog', (req, res) => {
    res.render('changelog', { user });
});

// Bugs & Fixes board page
server.get('/bugs-fixes', (req, res) => {
    res.render('bugs-fixes', { user });
});

// Orders page ← FIXED AND ADDED
server.get('/orders', (req, res) => {
    res.render('orders', { user });
});

// Catch-all 404 handler
server.use((req, res) => {
    res.status(404).send('<h1>404 - Page Not Found</h1><p>The page you are looking for does not exist.</p>');
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Available pages:`);
    console.log(`  /feedback     - Feedback & Improvements`);
    console.log(`  /roadmap      - Roadmap`);
    console.log(`  /changelog    - Change Log`);
    console.log(`  /bugs-fixes   - Bugs & Fixes board`);
    console.log(`  /inventory    - Inventory`);
    console.log(`  /my-shops     - My Shops`);
    console.log(`  /settings     - Settings`);
    console.log(`  /orders       - Orders (now working)`);
});