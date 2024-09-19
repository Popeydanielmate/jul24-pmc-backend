const mongoose = require('mongoose');

const CollectionItemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  artist: {
    type: String,
    required: false,
  },
  format: {
    type: String,
    required: true,
  },
  
}, { timestamps: true });

const CollectionItem = mongoose.model('CollectionItem', CollectionItemSchema);

module.exports = CollectionItem;
