import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ScamCase from '@/models/ScamCase';

export async function GET() {
    try {
        await connectDB();

        const [
            totalCases,
            openCases,
            investigatingCases,
            resolvedCases,
            riskDistribution,
            categoryDistribution,
            recentCases,
            monthlyTrend,
        ] = await Promise.all([
            ScamCase.countDocuments(),
            ScamCase.countDocuments({ status: 'open' }),
            ScamCase.countDocuments({ status: 'under_investigation' }),
            ScamCase.countDocuments({ status: 'resolved' }),
            ScamCase.aggregate([
                { $group: { _id: '$analysis.riskLevel', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
            ]),
            ScamCase.aggregate([
                { $group: { _id: '$analysis.fraudCategory', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
            ]),
            ScamCase.find()
                .sort({ createdAt: -1 })
                .limit(5)
                .select('caseId analysis.fraudCategory analysis.riskLevel analysis.confidence status createdAt submittedBy senderEmail'),
            ScamCase.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: '$createdAt' },
                            month: { $month: '$createdAt' },
                            day: { $dayOfMonth: '$createdAt' },
                        },
                        count: { $sum: 1 },
                        avgConfidence: { $avg: '$analysis.confidence' },
                    },
                },
                { $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 } },
                { $limit: 30 },
            ]),
        ]);

        const avgConfidence = await ScamCase.aggregate([
            { $group: { _id: null, avg: { $avg: '$analysis.confidence' } } },
        ]);

        const scamRate = await ScamCase.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    scams: { $sum: { $cond: ['$analysis.isScam', 1, 0] } },
                },
            },
        ]);

        return NextResponse.json({
            overview: {
                totalCases,
                openCases,
                investigatingCases,
                resolvedCases,
                dismissedCases: totalCases - openCases - investigatingCases - resolvedCases,
                avgConfidence: avgConfidence[0]?.avg || 0,
                scamDetectionRate: scamRate[0] ? (scamRate[0].scams / scamRate[0].total) * 100 : 0,
            },
            riskDistribution: riskDistribution.map((r: { _id: string; count: number }) => ({
                name: r._id || 'Unknown',
                value: r.count,
            })),
            categoryDistribution: categoryDistribution.map((c: { _id: string; count: number }) => ({
                name: c._id || 'Unknown',
                value: c.count,
            })),
            recentCases,
            monthlyTrend: monthlyTrend.map((m: { _id: { year: number; month: number; day: number }; count: number; avgConfidence: number }) => ({
                date: `${m._id.year}-${String(m._id.month).padStart(2, '0')}-${String(m._id.day).padStart(2, '0')}`,
                cases: m.count,
                avgConfidence: Math.round(m.avgConfidence),
            })).reverse(),
        });
    } catch (error) {
        console.error('Analytics API Error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch analytics' },
            { status: 500 }
        );
    }
}
