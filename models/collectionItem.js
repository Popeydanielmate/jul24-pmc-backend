const mongoose = require('mongoose');

const CollectionItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  format: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('CollectionItem', CollectionItemSchema);
