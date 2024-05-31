import { useEffect, useState } from 'react';
import { useSession } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';

export const useCheckSubscription = () => {
  const { session } = useSession(); // This gives you the active session
  const navigate = useNavigate();
  const [loginLink, setLoginLink] = useState<string | null>(null);

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
          } else {
            // Fetch the login link for the subscription management
            const loginLinkResponse = await fetch('https://stripevision.onrender.com/api/manage-subscription', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ customerId: session.user.id }), // Assuming session.user.id is the customer ID
            });

            const loginLinkData = await loginLinkResponse.json();
            setLoginLink(loginLinkData.url);
          }
        } catch (error) {
          console.error('Failed to check subscription:', error);
        }
      };

      checkSubscription();
    }
  }, [session, navigate]);

  return loginLink;
};
