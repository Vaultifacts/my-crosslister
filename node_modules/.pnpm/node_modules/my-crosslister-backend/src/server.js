const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const authMiddleware = require('./middleware/auth');

dotenv.config();

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/my-crosslister')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback-secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/my-crosslister' }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 7 days
}));

// Routes
app.use('/auth', authRoutes);

app.get('/', authMiddleware.isAuthenticated, (req, res) => {
  res.redirect('/inventory');
});

app.get('/login', authMiddleware.isNotAuthenticated, (req, res) => {
  res.render('login', { error: null });
});

app.use('/inventory', authMiddleware.isAuthenticated, inventoryRoutes);

// Orders route (example - adjust if you have a dedicated orders.js route file)
app.get('/orders', authMiddleware.isAuthenticated, (req, res) => {
  // Mock data or fetch from DB
  const orders = []; // Replace with actual query
  res.render('orders', { orders, user: req.session.user });
});

// Tasks route
app.get('/tasks', authMiddleware.isAuthenticated, (req, res) => {
  // Mock data or fetch from DB for tasks
  const tasks = []; // Replace with actual query if tasks model exists
  res.render('tasks', { tasks, user: req.session.user });
});

app.get('/account', authMiddleware.isAuthenticated, (req, res) => {
  res.render('account', { user: req.session.user });
});

// Add other protected routes here (e.g., /my-shops, /settings, etc.)
// Example:
// app.get('/my-shops', authMiddleware.isAuthenticated, (req, res) => { res.render('my-shops'); });

app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});