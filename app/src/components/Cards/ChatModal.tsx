import React, { useRef, useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { firestore } from '../../firebase';
import './ChatComponent.css';

interface ChatModalProps {
  groupId: string;
  onClose: () => void;
}

const ChatModal: React.FC<ChatModalProps> = ({ groupId, onClose }) => {
  const dummy = useRef<HTMLSpanElement>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    if (groupId) {
      const q = query(
        collection(firestore, 'messages'),
        where('groupId', '==', groupId),
        orderBy('createdAt')
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const fetchedMessages = querySnapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setMessages(fetchedMessages);
      }, (error) => {
        console.error("Error fetching messages: ", error);
      });
      return () => unsubscribe();
    }
  }, [groupId]);

  useEffect(() => {
    if (dummy.current) {
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg relative">
        <main>
          {messages.length > 0 ? messages.map((msg) => (
            <ChatMessage key={msg.id} message={msg} />
          )) : <p>No messages yet</p>}
          <span ref={dummy}></span>
        </main>
        <button onClick={onClose} className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded">Close</button>
      </div>
    </div>
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
  const { text, photoURL } = message;
  const messageClass = 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} alt="User Avatar" />
      <p>{text}</p>
    </div>
  );
};

export default ChatModal;
