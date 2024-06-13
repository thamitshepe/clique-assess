import React, { useRef, useState, useEffect } from 'react';
import './ChatComponent.css';
import db from "../../firebase";

interface ChatComponentProps {
  groupId: string;
  onClose: () => void; // Add onClose prop to handle modal closing
}

const ChatModal: React.FC<ChatComponentProps> = ({ groupId, onClose }) => {
  const dummy = useRef<HTMLSpanElement>(null);
  const messagesRef = db.collection('messages'); // Use db from Firebase instance
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = messagesRef
      .where('groupId', '==', groupId)
      .orderBy('createdAt')
      .limit(25)
      .onSnapshot((snapshot) => {
        const messages = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setMessages(messages);
      });

    return () => unsubscribe();
  }, [groupId]);

  return (
    <>
      <main>
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <span ref={dummy}></span>
      </main>
      <button onClick={onClose}>Close Chat Modal</button> {/* Change button text and use onClose prop */}
    </>
  );
};

interface ChatMessageProps {
  message: {
    text: string;
    uid: string;
    photoURL: string | null;
  };
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const { text, uid, photoURL } = message;
  // Replace with your authentication logic
  const currentUserUid = ''; // Replace with your logic to get current user's UID
  const messageClass = uid === currentUserUid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="User Avatar" />
      <p>{text}</p>
    </div>
  );
};

export default ChatModal;
