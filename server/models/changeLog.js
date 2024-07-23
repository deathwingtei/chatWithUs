const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const changeLogSchema = new Schema(
    {
        documentName: {
            type: String,
            required: true
        },
        changeMessage: {
            type: String,
            required: false
        },
        logValue: {
            type: String,
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

module.exports = mongoose.model('ChangeLog', changeLogSchema);
