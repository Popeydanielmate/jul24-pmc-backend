const mongoose = require('mongoose');

const CollectionItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  description: String,
}, { timestamps: true });

const CollectionItem = mongoose.model('CollectionItem', CollectionItemSchema);

module.exports = CollectionItem;

