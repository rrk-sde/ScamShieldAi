import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DailyDigest from '@/models/DailyDigest';

export async function GET() {
    const mockData = [
        {
            _id: '1',
            title: 'Daily Digest - 13 February 2026',
            digestId: 'CD-808',
            date: '2026-02-13',
            summary: 'Latest updates on UPI fraud patterns and emerging threats in digital banking.',
            downloadLink: '#',
        },
        {
            _id: '2',
            title: 'Daily Digest - 12 February 2026',
            digestId: 'CD-807',
            date: '2026-02-12',
            summary: 'Analysis of recent phishing campaigns targeting government employees via email.',
            downloadLink: '#',
        },
        {
            _id: '3',
            title: 'Daily Digest - 11 February 2026',
            digestId: 'CD-806',
            date: '2026-02-11',
            summary: 'New advisory on "Digital Arrest" scams involving fake CBI officers and video calls.',
            downloadLink: '#',
        },
        {
            _id: '4',
            title: 'Daily Digest - 10 February 2026',
            digestId: 'CD-805',
            date: '2026-02-10',
            summary: 'Overview of investment fraud schemes promising unrealistic returns in cryptocurrency.',
            downloadLink: '#',
        },
        {
            _id: '5',
            title: 'Daily Digest - 09 February 2026',
            digestId: 'CD-804',
            date: '2026-02-09',
            summary: 'Alert regarding "Electricity Bill Update" SMS phishing attacks targeting households.',
            downloadLink: '#',
        },
        {
            _id: '6',
            title: 'Daily Digest - 08 February 2026',
            digestId: 'CD-803',
            date: '2026-02-08',
            summary: 'Reports of fraudulent "Work from Home" job offers circulating on social media.',
            downloadLink: '#',
        },
        {
            _id: '7',
            title: 'Daily Digest - 07 February 2026',
            digestId: 'CD-802',
            date: '2026-02-07',
            summary: 'Detailed breakdown of a new "Customs Parcel" scam affecting international shipments.',
            downloadLink: '#',
        }
    ];

    try {
        // Attempt DB connection with 2s timeout to prevent hanging UI
        const dbPromise = connectDB();
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 2000));
        await Promise.race([dbPromise, timeoutPromise]);

        const digests = await DailyDigest.find({}).sort({ date: -1 });

        if (digests.length > 0) {
            return NextResponse.json(digests);
        }
    } catch (error) {
        if ((error as any).message !== 'DB Timeout') {
            console.warn('Daily Digest API: DB unavailable, serving mock data.');
        }
    }

    // Fallback to Mock Data
    return NextResponse.json(mockData);
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const body = await req.json();
        const digest = await DailyDigest.create(body);
        return NextResponse.json(digest, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
