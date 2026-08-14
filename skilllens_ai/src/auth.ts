// ==============================
// NextAuth.js v5 Configuration
// Supports BOTH real MongoDB auth AND demo mode (no DB required)
// ==============================

import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import connectToDatabase, { isMongoConnected } from '@/lib/mongodb';
import User from '@/models/User';

// In-memory user store for demo mode (no MongoDB)
interface DemoUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
}

// Global in-memory store for demo users
const demoUsers: Map<string, DemoUser> = new Map();

// Pre-seed a demo user
const DEMO_USER: DemoUser = {
  id: 'demo-user-001',
  name: 'Demo User',
  email: 'demo@skilllens.ai',
  passwordHash: bcrypt.hashSync('demo123', 10),
};
demoUsers.set(DEMO_USER.email, DEMO_USER);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const email = (credentials.email as string).toLowerCase().trim();
        const password = credentials.password as string;

        // Try MongoDB first
        const db = await connectToDatabase();

        if (db) {
          // Real database mode
          const user = await User.findOne({ email });
          if (!user) {
            throw new Error('No account found with this email');
          }
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            throw new Error('Invalid password');
          }
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            image: user.image,
          };
        } else {
          // Demo mode — use in-memory store
          const demoUser = demoUsers.get(email);
          if (!demoUser) {
            throw new Error('No account found. Try demo@skilllens.ai / demo123');
          }
          const isValid = await bcrypt.compare(password, demoUser.passwordHash);
          if (!isValid) {
            throw new Error('Invalid password. Demo credentials: demo@skilllens.ai / demo123');
          }
          return {
            id: demoUser.id,
            name: demoUser.name,
            email: demoUser.email,
          };
        }
      },
    }),
  ],
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  secret: process.env.AUTH_SECRET || 'dev-secret-change-in-production',
});

/** Register a new demo user (used by /api/auth/register in demo mode) */
export function registerDemoUser(name: string, email: string, passwordHash: string): DemoUser {
  const user: DemoUser = {
    id: `demo-user-${Date.now()}`,
    name,
    email: email.toLowerCase().trim(),
    passwordHash,
  };
  demoUsers.set(user.email, user);
  return user;
}

/** Check if a demo user exists */
export function findDemoUser(email: string): DemoUser | undefined {
  return demoUsers.get(email.toLowerCase().trim());
}
