import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import DepartmentUser from '@/models/DepartmentUser';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { name, email, password, role, department, badge } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        const existingUser = await DepartmentUser.findOne({ email });
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new DepartmentUser({
            name,
            email,
            password: hashedPassword,
            role: role || 'officer',
            department: department || 'Cyber Crime Cell',
            badge: badge || '',
        });

        await user.save();

        return NextResponse.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
            },
        });
    } catch (error) {
        console.error('Register API Error:', error);
        return NextResponse.json(
            { error: 'Registration failed' },
            { status: 500 }
        );
    }
}
