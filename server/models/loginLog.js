const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const loginLogSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true
    },
    message: {
      type: String,
      required: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('LoginLog', loginLogSchema);
