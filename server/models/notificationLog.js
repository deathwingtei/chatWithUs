const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const notificationLogSchema = new Schema(
    {
        notificationTo: {
            type: String,
            required: true
        },
        notificationType: {
            type: String,
            default: 'lineNotify',
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

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
