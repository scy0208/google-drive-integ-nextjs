import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    maxAge: 24 * 60 * 60, // One day
  },
  providers: [
    GoogleProvider({
      clientId: "907677598391-95vummkg3983m58scqgg522mikqvvmec.apps.googleusercontent.com",
      clientSecret: "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",
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
