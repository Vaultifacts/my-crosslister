require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');

const app = express();

app.use(express.json());
app.use(cors({ origin: true, credentials: true }));

// Session setup
app.use(session({
  secret: process.env.JWT_SECRET || 'fallback_secret_for_sessions',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
    ttl: 7 * 24 * 60 * 60,
    autoRemove: 'native'
  }),
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false,
    sameSite: 'lax'
  }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

// Login protection middleware
const requireLogin = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/');
  }
};

// Root route
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/inventory');
  } else {
    res.render('login');
  }
});

// Inventory dashboard
app.get('/inventory', requireLogin, async (req, res) => {
  try {
    const Inventory = require('./models/Inventory');
    const items = await Inventory.find({ userId: req.session.userId })
      .sort({ createdAt: -1 })
      .lean();
    res.render('inventory', { items, user: { email: req.session.email } });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).send('Server error');
  }
});

// Settings page
app.get('/settings', requireLogin, (req, res) => {
  res.render('settings', { user: { email: req.session.email } });
});

// My Shops page
app.get('/my-shops', requireLogin, (req, res) => {
  res.render('my-shops', { user: { email: req.session.email } });
});

// Create New Listing page
app.get('/inventory/create', requireLogin, (req, res) => {
  res.render('create-listing', { user: { email: req.session.email } });
});

// Feedback form page
app.get('/feedback', requireLogin, (req, res) => {
  res.render('feedback', { user: { email: req.session.email } });
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.redirect('/inventory');
    }
    res.clearCookie('connect.sid');
    res.redirect('/');
  });
});

// API routes (for extension)
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));