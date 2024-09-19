const express = require('express');
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const CollectionItem = require('../models/collectionItem');

const router = express.Router();

// Create a collection item
router.post(
  '/',
  [
    auth,
    [
      check('title', 'Title is required').not().isEmpty(),
      check('format', 'Format is required').not().isEmpty(),
      check('price', 'Price must be a number').optional().isNumeric(),
    ],
  ],
  async (req, res) => {
    console.log('Request received with data:', req.body); 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array()); 
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, artist, format, price } = req.body;

    try {
      const newItem = new CollectionItem({
        title,
        artist,
        format,
        price,  
        user: req.user.id,
      });

      const item = await newItem.save();
      console.log('Item successfully saved:', item); 
      res.json(item);
    } catch (err) {
      console.error('Server error during save:', err.message); 
      res.status(500).send('Server error');
    }
  }
);

// Get all collection items for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const items = await CollectionItem.find({ user: req.user.id }).sort({
      date: -1,
    });
    console.log('Fetched items:', items);
    res.json(items);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
});

// Update a collection item
router.put('/:id', auth, async (req, res) => {
  const { title, artist, format, price } = req.body;

  // Build item object
  const itemFields = {};
  if (title) itemFields.title = title;
  if (artist) itemFields.artist = artist;
  if (format) itemFields.format = format;
  if (price !== undefined) itemFields.price = price; 

  console.log('Updating item with data:', itemFields);

  try {
    let item = await CollectionItem.findById(req.params.id);

    if (!item) {
      console.log('Item not found:', req.params.id);
      return res.status(404).json({ message: 'Item not found' });
    }

    // Ensure user owns the item
    if (item.user.toString() !== req.user.id) {
      console.log('Not authorized to update item:', req.params.id);
      return res.status(401).json({ message: 'Not authorized' });
    }

    item = await CollectionItem.findByIdAndUpdate(
      req.params.id,
      { $set: itemFields },
      { new: true }
    );

    console.log('Updated item:', item);
    res.json(item);
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
});

// Delete a collection item
router.delete('/:id', auth, async (req, res) => {
  try {
    let item = await CollectionItem.findById(req.params.id);

    if (!item) {
      console.log('Item not found:', req.params.id);
      return res.status(404).json({ message: 'Item not found' });
    }

    // Ensure user owns the item
    if (item.user.toString() !== req.user.id) {
      console.log('Not authorized to delete item:', req.params.id);
      return res.status(401).json({ message: 'Not authorized' });
    }

    await CollectionItem.findByIdAndDelete(req.params.id);
    console.log('Deleted item:', req.params.id);

    res.json({ message: 'Item removed' });
  } catch (err) {
    console.error('Server error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
