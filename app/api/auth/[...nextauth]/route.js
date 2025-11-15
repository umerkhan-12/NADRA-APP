import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma"; // Make sure this points to your Prisma client
// import bcrypt from "bcrypt"; // Uncomment if you store hashed passwords

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null; // Missing credentials
        }

        // Fetch user from database
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null; // User not found
        }


        // If using hashed password, uncomment this:
        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) return null;

        // Return user object for session
        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id; // Store user id in JWT
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id; // Include user id in session
      console.log("Session User ID:", session.user.id);
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
// import NextAuth from "next-auth";
// import CredentialsProvider from "next-auth/providers/credentials";
// import prisma from "@/lib/prisma";
// import bcrypt from "bcrypt"; // Use this if passwords are hashed

// export const authOptions = {
//   providers: [
//     CredentialsProvider({
//       name: "Credentials",
//       credentials: {
//         email: { label: "Email", type: "text" },
//         password: { label: "Password", type: "password" },
//       },
//       async authorize(credentials) {
//         if (!credentials?.email || !credentials?.password) return null;

//         // Fetch user from database
//         const user = await prisma.user.findUnique({
//           where: { email: credentials.email },
//         });

//         if (!user) return null;

//         // If passwords are plain text (example)
//         // if (user.password !== credentials.password) return null;

//         // If hashed, use bcrypt:
//         const isValid = await bcrypt.compare(credentials.password, user.password);
//         if (!isValid) return null;

//         return { id: user.id, name: user.name, email: user.email };
//       },
//     }),
//   ],
//   secret: process.env.NEXTAUTH_SECRET,
//   session: { strategy: "jwt" },
//   callbacks: {
//     async jwt({ token, user }) {
//       if (user) token.id = user.id;
//       return token;
//     },
//     async session({ session, token }) {
//       session.user.id = token.id;
//       return session;
//     },
//   },
// };

// const handler = NextAuth(authOptions);

// export { handler as GET, handler as POST };
