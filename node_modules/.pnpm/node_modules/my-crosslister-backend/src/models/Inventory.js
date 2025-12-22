const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  sku: String,
  price: Number,
  description: String,
  size: String,
  tags: [String],
  internalNote: String,
  status: { type: String, default: 'draft' },
  source: String,
  images: [String],
  listingLinks: {
    depop: String,
    ebayUS: String,
    ebayCA: String,
    etsy: String,
    shopify: String,
    facebook: String,
    grailed: String,
    mercari: String,
    poshmarkCA: String,
    poshmarkUS: String
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', inventorySchema);