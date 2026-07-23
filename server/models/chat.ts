import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChat extends Document {
    title: string;
    imageUrl?: string;
    active: boolean;
    inActiveUser?: Types.ObjectId;
    ipAddress?: string;
    userId: Types.ObjectId;
    createdAt?: Date;
    updatedAt?: Date;
}

const chatSchema = new Schema<IChat>(
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
        ipAddress: {
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

export default mongoose.model<IChat>('Chat', chatSchema);
