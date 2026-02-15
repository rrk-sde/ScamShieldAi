import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ScamCase from '@/models/ScamCase';
import { analyzeScam, generateFIRDraft } from '@/lib/ai-engine';

function generateCaseId(): string {
    const prefix = 'SC';
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `${prefix}-${year}-${random}`;
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();
        const { message, messageType, submittedBy, contactEmail, contactPhone, senderEmail } = body;

        if (!message || !messageType || !submittedBy) {
            return NextResponse.json(
                { error: 'Message, message type, and submitter name are required' },
                { status: 400 }
            );
        }

        // AI Analysis
        const analysis = await analyzeScam(message, messageType, senderEmail || '');

        // Generate FIR Draft
        const firDraft = await generateFIRDraft(analysis, message, messageType, submittedBy);

        // Create case
        const scamCase = new ScamCase({
            caseId: generateCaseId(),
            submittedBy,
            contactEmail: contactEmail || '',
            contactPhone: contactPhone || '',
            senderEmail: senderEmail || '',
            messageType,
            originalMessage: message,
            analysis,
            firDraft,
            status: 'open',
        });

        await scamCase.save();

        return NextResponse.json({
            success: true,
            case: scamCase,
        });
    } catch (error) {
        console.error('Analyze API Error:', error);
        return NextResponse.json(
            { error: 'Failed to analyze message', details: (error as any).message },
            { status: 500 }
        );
    }
}
