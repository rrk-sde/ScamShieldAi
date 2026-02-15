import mongoose, { Schema, Document } from 'mongoose';

export interface IScamCase extends Document {
    caseId: string;
    submittedBy: string;
    contactEmail: string;
    contactPhone: string;
    senderEmail: string;
    messageType: 'whatsapp' | 'email' | 'call_transcript' | 'payment_request' | 'sms' | 'other';
    originalMessage: string;
    analysis: {
        isScam: boolean;
        confidence: number;
        fraudCategory: string;
        riskLevel: 'low' | 'medium' | 'high' | 'critical';
        financialRisk: string;
        scamPatterns: string[];
        explanation: string;
        suggestedReply: string;
        actionSteps: string[];
    };
    firDraft: string;
    status: 'open' | 'under_investigation' | 'resolved' | 'dismissed';
    assignedTo: string;
    internalNotes: {
        note: string;
        addedBy: string;
        addedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}

const ScamCaseSchema = new Schema<IScamCase>(
    {
        caseId: {
            type: String,
            required: true,
            unique: true,
        },
        submittedBy: {
            type: String,
            required: true,
        },
        contactEmail: {
            type: String,
            default: '',
        },
        contactPhone: {
            type: String,
            default: '',
        },
        senderEmail: {
            type: String,
            default: '',
        },
        messageType: {
            type: String,
            enum: ['whatsapp', 'email', 'call_transcript', 'payment_request', 'sms', 'other'],
            required: true,
        },
        originalMessage: {
            type: String,
            required: true,
        },
        analysis: {
            isScam: { type: Boolean, default: false },
            confidence: { type: Number, default: 0 },
            fraudCategory: { type: String, default: '' },
            riskLevel: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
            financialRisk: { type: String, default: '' },
            scamPatterns: [{ type: String }],
            explanation: { type: String, default: '' },
            suggestedReply: { type: String, default: '' },
            actionSteps: [{ type: String }],
        },
        firDraft: {
            type: String,
            default: '',
        },
        status: {
            type: String,
            enum: ['open', 'under_investigation', 'resolved', 'dismissed'],
            default: 'open',
        },
        assignedTo: {
            type: String,
            default: '',
        },
        internalNotes: [
            {
                note: { type: String, required: true },
                addedBy: { type: String, required: true },
                addedAt: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
    }
);

export default mongoose.models.ScamCase || mongoose.model<IScamCase>('ScamCase', ScamCaseSchema);
