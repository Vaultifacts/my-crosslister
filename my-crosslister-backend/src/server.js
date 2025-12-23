const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const authRoutes = require('./routes/auth');          // Fixed path
const inventoryRoutes = require('./routes/inventory'); // Fixed path

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));                    // Fixed: points to src/views
app.use(express.static(path.join(__dirname, '../public')));         // Fixed: public is one level up from src

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/crosslister', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Session with connect-mongo v5+ syntax
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({               // Fixed: new MongoStore() instead of MongoStore.create()
      mongoUrl: 'mongodb://localhost:27017/crosslister',
      collectionName: 'sessions'
    }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hours
  })
);

// Routes
app.use('/auth', authRoutes);
app.use('/inventory', inventoryRoutes);

// Protected Routes
app.get('/orders', (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  res.render('orders');
});

app.get('/tasks', (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  res.render('tasks');
});

app.get('/my-shops', (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  res.render('my-shops');
});

app.get('/settings', (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  res.render('settings');
});

app.get('/feedback', (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  res.render('feedback');
});

app.get('/bugs-fixes', (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  res.render('bugs-fixes');
});

app.get('/roadmap', (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  res.render('roadmap');
});

app.get('/changelog', (req, res) => {
  if (!req.session.userId) return res.redirect('/auth/login');
  res.render('changelog');
});

// Home/Dashboard Redirect
app.get('/', (req, res) => {
  if (req.session.userId) {
    res.redirect('/inventory');
  } else {
    res.redirect('/auth/login');
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));