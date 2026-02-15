import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ScamCase from '@/models/ScamCase';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const scamCase = await ScamCase.findById(id);

        if (!scamCase) {
            return NextResponse.json({ error: 'Case not found' }, { status: 404 });
        }

        return NextResponse.json({ case: scamCase });
    } catch (error) {
        console.error('Case Detail API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch case' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await connectDB();
        const { id } = await params;
        const body = await req.json();
        const { status, assignedTo, internalNote, noteAddedBy } = body;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = {};

        if (status) updateData.status = status;
        if (assignedTo !== undefined) updateData.assignedTo = assignedTo;

        let updateQuery;

        if (internalNote && noteAddedBy) {
            updateQuery = ScamCase.findByIdAndUpdate(
                id,
                {
                    ...updateData,
                    $push: {
                        internalNotes: {
                            note: internalNote,
                            addedBy: noteAddedBy,
                            addedAt: new Date(),
                        },
                    },
                },
                { new: true }
            );
        } else {
            updateQuery = ScamCase.findByIdAndUpdate(id, updateData, { new: true });
        }

        const scamCase = await updateQuery;

        if (!scamCase) {
            return NextResponse.json({ error: 'Case not found' }, { status: 404 });
        }

        return NextResponse.json({ case: scamCase });
    } catch (error) {
        console.error('Case Update API Error:', error);
        return NextResponse.json(
            { error: 'Failed to update case' },
            { status: 500 }
        );
    }
}
