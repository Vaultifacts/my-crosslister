const express = require('express');
const Inventory = require('../models/Inventory');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

router.use(authMiddleware);

router.post('/', async (req, res) => {
  try {
    const { title, price, description, url } = req.body;
    const inventory = new Inventory({
      userId: req.userId,
      title,
      price,
      description,
      url,
    });
    await inventory.save();
    res.status(201).json({ message: 'Inventory added' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add inventory' });
  }
});

router.get('/', async (req, res) => {
  try {
    const inventories = await Inventory.find({ userId: req.userId });
    res.json(inventories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch inventory' });
  }
});

module.exports = router;