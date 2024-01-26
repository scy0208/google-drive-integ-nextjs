import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    maxAge: 24 * 60 * 60, // One day
  },
  providers: [
    GoogleProvider({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_ID,
      authorization: {
        params: {
          scope: 'openid https://www.googleapis.com/auth/drive', // Adjust scopes as needed
          // Additional parameters
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Forward the access token to the JWT token
      if (account?.accessToken) {
        token.accessToken = account.accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      // Include the access token in the user's session
      session.accessToken = token.accessToken;
      return session;
    },
  },
  // Additional configuration
});
