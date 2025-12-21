const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  price: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }  // Automatically sets current date/time on creation
});

module.exports = mongoose.model('Inventory', inventorySchema);