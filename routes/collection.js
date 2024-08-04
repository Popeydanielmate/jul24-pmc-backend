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
        check('format', 'Format is required').not().isEmpty()
      ]
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { title, artist, format,  } = req.body;
  
      try {
        const newItem = new CollectionItem({
          title,
          artist,
          format,
          
          user: req.user.id,
        });
  
        const item = await newItem.save();
        res.json(item);
      } catch (err) {
        console.error(err.message);
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
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Update a collection item
router.put('/:id', auth, async (req, res) => {
  const { title, artist, format,  } = req.body;

  // Build item object
  const itemFields = {};
  if (title) itemFields.title = title;
  if (artist) itemFields.artist = artist;
  if (format) itemFields.format = format;
  

  try {
    let item = await CollectionItem.findById(req.params.id);

    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Ensure user owns the item
    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    item = await CollectionItem.findByIdAndUpdate(
      req.params.id,
      { $set: itemFields },
      { new: true }
    );

    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// Delete a collection item
router.delete('/:id', auth, async (req, res) => {
    try {
      let item = await CollectionItem.findById(req.params.id);
  
      if (!item) return res.status(404).json({ message: 'Item not found' });
  
      // Ensure user owns the item
      if (item.user.toString() !== req.user.id) {
        return res.status(401).json({ message: 'Not authorized' });
      }
  
      await CollectionItem.findByIdAndDelete(req.params.id);
  
      res.json({ message: 'Item removed' });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  });
  

module.exports = router;


