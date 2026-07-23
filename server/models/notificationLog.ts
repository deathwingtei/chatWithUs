import mongoose, { Schema, Document, Types } from 'mongoose';

export interface INotificationLog extends Document {
    notificationTo: string;
    notificationType: string;
    chatId: Types.ObjectId | string;
    createdAt?: Date;
    updatedAt?: Date;
}

const notificationLogSchema = new Schema<INotificationLog>(
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

export default mongoose.model<INotificationLog>('NotificationLog', notificationLogSchema);
