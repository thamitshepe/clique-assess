import React, { lazy, Suspense, useState, useEffect } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { useAppSelector } from '../../store/hooks';
import ChatModal from '../../components/Cards/ChatModal';
import Groups from '../../components/Cards/Groups';
import { auth, firestore } from '../../firebase'; // Ensure correct path to firebase configuration
import firebase from 'firebase/compat/app'; // Import firebase from compat/app

const Users = lazy(() => import('../../components/Cards/Users').then(module => ({ default: module.Users })));

const Admin: React.FC = () => {
  const selectedState = useAppSelector((state) => state.selectedState.selectedState);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [user, setUser] = useState<firebase.User | null>(null); // Explicitly type user as firebase.User | null

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser: firebase.User | null) => {
      setUser(authUser);
      setDataLoading(false);
    });

    return () => {
      unsubscribe(); // Cleanup function for auth state change listener
    };
  }, []);

  const openChatModal = (groupId: string) => {
    setSelectedGroupId(groupId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGroupId(null);
  };

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const userRef = firestore.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
  
        if (!userDoc.exists) {
          // New user, set initial data
          await userRef.set({
            name: user.displayName,
            userId: user.uid,
            groupId: "defaultGroupId", // Set a default group ID if needed
            isAdmin: true // Set isAdmin to true for admin users
          });
        } else {
          // Existing user, ensure isAdmin field is set to true
          const userData = userDoc.data();
          if (userData && userData.isAdmin === undefined) {
            await userRef.update({ isAdmin: true });
          }
        }
      };
  
      fetchUserData();
    }
  }, [user]);   
  

  const renderComponent = () => {
    switch (selectedState) {
      case 'Users':
        return <Users />;
      case 'Groups':
        return <Groups openChatModal={openChatModal} />;
      default:
        return <Users />;
    }
  };

  const SkeletonLoader: React.FC = () => (
    <div className="p-2">
      <div className="h-19 rounded-md bg-black mb-4 p-6 flex items-center justify-between animate-pulse">
      </div>
    </div>
  );

  if (!user) {
    // Render sign-in component if user is not authenticated
    return (
      <DefaultLayout>
        <SignIn />
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <div className="w-full flex-col items-center relative">
        <div className="flex-1">
          <div className="flex flex-col h-full">
            <div className="flex-1 w-full">
              <Suspense fallback={<SkeletonLoader />}>
                {dataLoading ? <SkeletonLoader /> : renderComponent()}
              </Suspense>
            </div>
          </div>
        </div>
        {isModalOpen && selectedGroupId && (
          <ChatModal groupId={selectedGroupId} onClose={closeModal} />
        )}
      </div>
    </DefaultLayout>
  );
};

function SignIn() {
  const signInWithGoogle = async () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    try {
      await auth.signInWithPopup(provider);
      // Successful sign-in logic
    } catch (error) {
      console.error("Error signing in with Google:", error);
      // Handle error gracefully, e.g., show user a message or retry logic
    }
  };
  

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
    </>
  );
}

function SignOut() {
  const signOut = () => {
    auth.signOut();
  };

  return auth.currentUser && (
    <button className="sign-out" onClick={signOut}>Sign Out</button>
  );
}

export default Admin;
