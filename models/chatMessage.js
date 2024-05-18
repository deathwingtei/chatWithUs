const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema(
  {
    data: {
      type: String,
      required: true
    },
    imageUrl: {
      type: String,
      required: true
    },
    discard: {
        type: String,
        required: false
    },
    sender: {
        type: String,
        required: "admin"
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ChatMessage', postSchema);
