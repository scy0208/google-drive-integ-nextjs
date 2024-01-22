import 'next-auth';

declare module 'next-auth' {
  /**
   * Extend the built-in session types with the accessToken property
   */
  interface Session {
    accessToken?: string;
  }
}