import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILoginLog extends Document {
    userId: Types.ObjectId | string;
    message?: string;
    loginWith?: string;
    ipAddress?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const loginLogSchema = new Schema<ILoginLog>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        message: {
            type: String,
            required: false
        },
        loginWith: {
            type: String,
            required: false
        },
        ipAddress: {
            type: String,
            required: false
        },
    },
    { timestamps: true }
);

export default mongoose.model<ILoginLog>('LoginLog', loginLogSchema);
