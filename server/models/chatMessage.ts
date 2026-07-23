import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChatMessage extends Document {
    data: string;
    imageUrl?: string;
    discard: boolean;
    sender: string;
    userId: Types.ObjectId | string;
    chatId: Types.ObjectId | string;
    createdAt?: Date;
    updatedAt?: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
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

export default mongoose.model<IChatMessage>('ChatMessage', chatMessageSchema);
