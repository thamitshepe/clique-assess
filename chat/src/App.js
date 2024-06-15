import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import { auth, firestore, firebase } from './firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { addDoc, collection, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';

function App() {
  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>⚛️🔥💬</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom user={user} /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>Do not violate the community guidelines or you will be banned for life!</p>
    </>
  )
}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom({ user }) {
  const dummy = useRef();
  const [messages, setMessages] = useState([]);
  const [formValue, setFormValue] = useState('');
  const [groupId, setGroupId] = useState(null);
  const [showInterestModal, setShowInterestModal] = useState(false);
  const [interests, setInterests] = useState([]);
  const [fetchMessages, setFetchMessages] = useState(false); // New state to control message fetching

  // Fetch user data on component mount or when user changes
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userRef = firestore.collection('users').doc(user.uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
          // If user document does not exist, set default data
          await userRef.set({
            name: user.displayName,
            userId: user.uid,
            interests: [],
            groupId: "defaultGroupId" // Set a default group ID if necessary
          });
          setGroupId("defaultGroupId");
          setShowInterestModal(true); // Show interest modal for new users
        } else {
          const userData = userDoc.data();
          if (!userData.groupId) {
            console.error("Group ID is not set in user document.");
            // Handle the missing groupId here if necessary
            await userRef.update({ groupId: "defaultGroupId" }); // Optionally, set a default groupId
            setGroupId("defaultGroupId");
          } else {
            setGroupId(userData.groupId); // Ensure groupId is set correctly
          }
          setInterests(userData.interests || []);

          // Show interest modal if user has no interests
          if (!userData.interests || userData.interests.length === 0) {
            setShowInterestModal(true);
          }
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUser();
  }, [user]);

  // Subscribe to messages collection based on groupId
  useEffect(() => {
    if (groupId) {
      const q = query(collection(firestore, 'messages'), where('groupId', '==', groupId));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const messages = querySnapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        }));
        setMessages(messages);
      }, (error) => {
        console.error("Error fetching messages: ", error);
      });
      return unsubscribe;
    }
  }, [groupId, fetchMessages]); // Depend on groupId and fetchMessages state

  // Function to save user interests
  const saveInterests = async (newInterests) => {
    const userRef = firestore.collection('users').doc(user.uid);
    await userRef.update({ interests: newInterests });

    // Call Flask endpoint to re-cluster using axios GET request
    try {
      await axios.get('http://localhost:5000/re-cluster');

      // Fetch the updated user data including the new groupId
      const userDoc = await userRef.get();
      const userData = userDoc.data();

      if (userData && userData.groupId) {
        setGroupId(userData.groupId); // Update the groupId state
        setFetchMessages(prev => !prev); // Trigger re-fetch of messages
      } else {
        console.error("Failed to update Group ID after reclustering.");
      }
    } catch (error) {
      console.error("Error calling re-cluster endpoint: ", error);
    }

    setShowInterestModal(false); // Hide interest modal after saving interests
  };

  // Function to send a message
  const sendMessage = async (e) => {
    e.preventDefault();
    const { uid, photoURL } = auth.currentUser;
  
    // Ensure groupId is set before sending a message
    if (!groupId) {
      console.error("Group ID is not set.");
      // Re-fetch user document to ensure groupId is obtained
      try {
        const userRef = firestore.collection('users').doc(user.uid);
        const userDoc = await userRef.get();
        const userData = userDoc.data();
        if (userData && userData.groupId) {
          setGroupId(userData.groupId);
        } else {
          console.error("Failed to retrieve Group ID.");
          return;
        }
      } catch (error) {
        console.error("Error re-fetching user data: ", error);
        return;
      }
    }
  
    try {
      // Add a new message document to the messages collection
      await addDoc(collection(firestore, 'messages'), {
        text: formValue,
        createdAt: serverTimestamp(),
        uid,
        photoURL,
        groupId // Include the groupId here
      });
  
      setFormValue(''); // Clear the message input field after sending
      dummy.current.scrollIntoView({ behavior: 'smooth' }); // Scroll to the latest message
    } catch (error) {
      console.error("Error sending message: ", error);
    }
  };

  return (
    <>
      <main>
        {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />
        <button type="submit" disabled={!formValue}>🕊️</button>
      </form>

      {showInterestModal && <InterestModal saveInterests={saveInterests} />}
    </>
  )
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="User avatar" />
      <p>{text}</p>
    </div>
  )
}

function InterestModal({ saveInterests }) {
  const [interest, setInterest] = useState('');
  const [interests, setInterests] = useState([]);

  const addInterest = (e) => {
    if (e.key === 'Enter' && interest) {
      setInterests([...interests, interest]);
      setInterest('');
      e.preventDefault();
    }
  }

  const removeInterest = (interestToRemove) => {
    setInterests(interests.filter(interest => interest !== interestToRemove));
  }

  const handleSubmit = () => {
    saveInterests(interests);
  }

  return (
    <div className="modal">
      <h2>Enter your interests</h2>
      <input 
        type="text" 
        value={interest} 
        onChange={(e) => setInterest(e.target.value)} 
        onKeyDown={addInterest}  // Use onKeyDown to capture Enter key
        placeholder="Add an interest and press Enter" 
      />
      <ul>
        {interests.map((interest, index) => (
          <li key={index}>
            {interest} <button onClick={() => removeInterest(interest)}>x</button>
          </li>
        ))}
      </ul>
      <button onClick={handleSubmit}>Next</button>
    </div>
  );
}

export default App;
