const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationLogSchema = new Schema(
    {
        notificationTo: {
            type: String,
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

module.exports = mongoose.model('Chat', notificationLogSchema);
