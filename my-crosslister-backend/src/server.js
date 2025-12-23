const express = require('express');
const path = require('path');

const server = express();
const PORT = process.env.PORT || 5000;

// View engine setup (EJS)
server.set('view engine', 'ejs');
server.set('views', path.join(__dirname, 'views'));

// Serve static files
server.use(express.static(path.join(__dirname, 'public')));

// Middleware
server.use(express.urlencoded({ extended: true }));
server.use(express.json());

// User object
const user = {
    email: 'user@example.com'
};

// Routes
server.get('/', (req, res) => {
    res.redirect('/feedback');
});

server.get('/inventory', (req, res) => {
    const items = [];
    res.render('inventory', { user, items });
});

server.get('/my-shops', (req, res) => {
    res.render('my-shops', { user });
});

server.get('/settings', (req, res) => {
    res.render('settings', { user });
});

// NEW: Tasks route
server.get('/tasks', (req, res) => {
    res.render('tasks', { user });
});

server.get('/feedback', (req, res) => {
    res.render('feedback', { user });
});

server.get('/feedback/depop-refresh-listings', (req, res) => {
    res.render('feedback-detail', { user });
});

server.get('/feedback/adding-price-shipping', (req, res) => {
    res.render('feedback-detail', { user });
});

server.get('/feedback/:slug', (req, res) => {
    res.render('feedback-detail', { user });
});

server.get('/roadmap', (req, res) => {
    res.render('roadmap', { user });
});

server.get('/changelog', (req, res) => {
    res.render('changelog', { user });
});

server.get('/bugs-fixes', (req, res) => {
    res.render('bugs-fixes', { user });
});

server.get('/orders', (req, res) => {
    res.render('orders', { user });
});

// 404 handler
server.use((req, res) => {
    res.status(404).send('<h1>404 - Page Not Found</h1>');
});

// Start server
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Pages: /feedback, /roadmap, /changelog, /bugs-fixes, /inventory, /my-shops, /settings, /orders, /tasks`);
});