const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    status: {
      type: String,
      default: 'online'
    },
    permission:{
      type: String,
      default: 'user'
    },
    googleLogin: {
      type: Boolean,
      default: false
    },
    googleLoginValue: {
      type: String,
      default: null
    },
    chats: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Chat'
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
