import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      id: "user-login",
      name: "User Login",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) return null;

        // Check password with bcrypt
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
          userType: user.role, // USER or ADMIN
        };
      },
    }),
    CredentialsProvider({
      id: "agent-login",
      name: "Agent Login",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          console.log("❌ Agent login: Missing credentials");
          return null;
        }

        const agent = await prisma.agent.findUnique({
          where: { username: credentials.username },
        });

        if (!agent) {
          console.log("❌ Agent login: Agent not found with username:", credentials.username);
          return null;
        }

        if (!agent.password) {
          console.log("❌ Agent login: No password set for agent");
          return null;
        }

        // Check password with bcrypt
        const isValid = await bcrypt.compare(credentials.password, agent.password);
        console.log("🔐 Agent password check:", isValid ? "✅ Valid" : "❌ Invalid");
        
        if (!isValid) return null;

        console.log("✅ Agent login successful:", agent.name);
        return {
          id: agent.id.toString(),
          email: agent.email,
          name: agent.name,
          role: "AGENT",
          userType: "AGENT",
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { 
    strategy: "jwt", // Use JWT for credentials provider
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.userType = user.userType;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.userType = token.userType;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
