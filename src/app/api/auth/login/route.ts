import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DepartmentUser from '@/models/DepartmentUser';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'scamshield-secret';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        const user = await DepartmentUser.findOne({ email, isActive: true });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isValidPassword = await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const token = jwt.sign(
            {
                userId: user._id,
                email: user.email,
                role: user.role,
                name: user.name,
                department: user.department,
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                badge: user.badge,
            },
        });
    } catch (error) {
        console.error('Auth API Error:', error);
        return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
        );
    }
}
