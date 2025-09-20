'use client';

import { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';

export default function AutoSignIn() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only run on client side and when session is not loading
    if (status === 'loading') return;
    
    // If no session exists, automatically sign in as anonymous user
    if (!session) {
      console.log('No session found, auto-signing in as anonymous user...');
      signIn('credentials', { 
        redirect: false,
        callbackUrl: window.location.pathname 
      }).then((result) => {
        if (result?.ok) {
          console.log('✅ Auto-signed in as anonymous user');
        } else {
          console.error('❌ Failed to auto-sign in:', result?.error);
        }
      }).catch((error) => {
        console.error('❌ Error during auto-sign in:', error);
      });
    } else {
      console.log('✅ Session already exists:', session.user?.id);
    }
  }, [session, status]);

  // This component doesn't render anything
  return null;
}
