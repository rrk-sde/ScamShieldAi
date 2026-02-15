import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ScamCase from '@/models/ScamCase';

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const riskLevel = searchParams.get('riskLevel');
        const fraudCategory = searchParams.get('fraudCategory');
        const sortBy = searchParams.get('sortBy') || 'createdAt';
        const sortOrder = searchParams.get('sortOrder') || 'desc';

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const filter: any = {};

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (riskLevel && riskLevel !== 'all') {
            filter['analysis.riskLevel'] = riskLevel;
        }

        if (fraudCategory && fraudCategory !== 'all') {
            filter['analysis.fraudCategory'] = fraudCategory;
        }

        if (search) {
            filter.$or = [
                { caseId: { $regex: search, $options: 'i' } },
                { submittedBy: { $regex: search, $options: 'i' } },
                { originalMessage: { $regex: search, $options: 'i' } },
                { 'analysis.fraudCategory': { $regex: search, $options: 'i' } },
            ];
        }

        const skip = (page - 1) * limit;
        const sort: Record<string, 1 | -1> = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

        const [cases, total] = await Promise.all([
            ScamCase.find(filter).sort(sort).skip(skip).limit(limit),
            ScamCase.countDocuments(filter),
        ]);

        return NextResponse.json({
            cases,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Cases API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cases' },
            { status: 500 }
        );
    }
}
