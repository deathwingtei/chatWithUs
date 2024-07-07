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
        type: Boolean,
        default: false,
        required: false
    },
    sender: {
        type: String,
        default: "user",
        required: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
