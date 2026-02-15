import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartmentUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'officer' | 'admin' | 'analyst';
    department: string;
    badge: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const DepartmentUserSchema = new Schema<IDepartmentUser>(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ['officer', 'admin', 'analyst'],
            default: 'officer',
        },
        department: {
            type: String,
            default: 'Cyber Crime Cell',
        },
        badge: {
            type: String,
            default: '',
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.DepartmentUser || mongoose.model<IDepartmentUser>('DepartmentUser', DepartmentUserSchema);
