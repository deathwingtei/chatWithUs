const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatMessageSchema = new Schema(
  {
    data: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: false
    },
    discard: {
        type: String,
        required: false
    },
    sender: {
        type: String,
        default: "admin",
        required: true
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
