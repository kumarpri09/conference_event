
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ''
    },
    date: {
      type: Date,
      required: true
    },
    location: {
      type: String,
      required: true
    },
    speaker: {
      type: String,
      default: ''
    },
    capacity: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

module.exports =
    mongoose.models.Event || mongoose.model('Event', eventSchema);
