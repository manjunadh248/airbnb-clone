// ==============================
// API: User Registration
// POST /api/auth/register
// Works with MongoDB OR demo mode (in-memory)
// ==============================

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { registerSchema } from '@/lib/validators';
import { registerDemoUser, findDemoUser } from '@/auth';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate input
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    // Try MongoDB first
    const db = await connectToDatabase();

    if (db) {
      // Real database mode
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = await User.create({ name, email, passwordHash });

      return NextResponse.json(
        {
          message: 'Account created successfully',
          user: { id: user._id, name: user.name, email: user.email },
        },
        { status: 201 }
      );
    } else {
      // Demo mode — in-memory registration
      const existing = findDemoUser(email);
      if (existing) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }

      const passwordHash = await bcrypt.hash(password, 12);
      const user = registerDemoUser(name, email, passwordHash);

      return NextResponse.json(
        {
          message: 'Account created successfully (demo mode)',
          user: { id: user.id, name: user.name, email: user.email },
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
