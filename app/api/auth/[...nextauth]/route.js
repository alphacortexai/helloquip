import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Anonymous",
      credentials: {},
      async authorize() {
        // Create an anonymous session for the agent chat
        return {
          id: "anonymous",
          name: "Anonymous User",
          email: "anonymous@example.com",
          accessToken: "anonymous_token",
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
      }
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.user.id = token.id;
      session.user.name = token.name;
      session.user.email = token.email;
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET || "your-secret-key-here",
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: '/', // Redirect to home page instead of sign-in page
  },
});

export { handler as GET, handler as POST };
