const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        imageUrl: {
            type: String,
            required: false
        },
        active: {
            type: Boolean,
            default: true
        },
        inActiveUser: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        ipAddress:{
            type: String,
            required: false
        },
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Chat', chatSchema);
