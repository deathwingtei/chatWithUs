import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string;
    name: string;
    status: string;
    permission: string;
    userPicture?: string | null;
    googleLogin: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        status: {
            type: String,
            default: 'online'
        },
        permission: {
            type: String,
            default: 'user'
        },
        userPicture: {
            type: String,
            default: null,
            required: false
        },
        googleLogin: {
            type: Boolean,
            default: false
        }
    },
    { timestamps: true }
);

export default mongoose.model<IUser>('User', userSchema);
