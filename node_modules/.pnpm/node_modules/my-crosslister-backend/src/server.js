const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const authRoutes = require('./routes/auth');          // Fixed: removed extra './src'
const inventoryRoutes = require('./routes/inventory'); // Fixed: removed extra './src'
const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));                    // Fixed: was 'src/views'
app.use(express.static(path.join(__dirname, '../public')));         // Fixed: public is one level up

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/crosslister', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Session
app.use(
  session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://localhost:27017/crosslister' }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
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