import { useEffect } from 'react';
import { useSession } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export const useCheckSubscription = () => {
  const { session } = useSession();  // This gives you the active session
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      const checkSubscription = async () => {
        try {
          const email = session.user.primaryEmailAddress?.emailAddress; // Optional chaining here
          if (!email) {
            throw new Error('User email is null or undefined');
          }

          const response = await fetch('https://stripevision.onrender.com/api/check-subscription', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId: session.id, email }), // Use email here
          });

          const data = await response.json();
          if (!data.subscribed) {
            window.location.href = 'https://betvisionai.com';
          }
        } catch (error) {
          console.error('Failed to check subscription:', error);
        }
      };

      checkSubscription();
    }
  }, [session, navigate]);

  return null;
};