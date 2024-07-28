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
  format: {
    type: String,
    required: true,
  },
  description: String,
}, { timestamps: true });

const CollectionItem = mongoose.model('CollectionItem', CollectionItemSchema);

module.exports = CollectionItem;


