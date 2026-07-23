import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IChangeLog extends Document {
    documentName: string;
    changeMessage?: string;
    logValue?: string;
    ipAddress?: string;
    userId: Types.ObjectId | string;
    createdAt?: Date;
    updatedAt?: Date;
}

const changeLogSchema = new Schema<IChangeLog>(
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

export default mongoose.model<IChangeLog>('ChangeLog', changeLogSchema);
