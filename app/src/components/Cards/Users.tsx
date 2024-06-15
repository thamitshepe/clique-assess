import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

interface User {
  userId: string;
  name: string;
  interests: string[];
  selected: boolean;
}

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string[]>([]);
  const [selectedUserName, setSelectedUserName] = useState<string>('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [deletedInterests, setDeletedInterests] = useState<string[]>([]);
  const [addedInterests, setAddedInterests] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Function to fetch user data from Flask backend
    const fetchUserData = () => {
      axios.get('http://localhost:5000/users')
        .then(response => {
          // Set fetched users data to state
          setUsers(response.data);
        })
        .catch(error => {
          // Handle error if fetching data fails
          console.error('Error fetching user data:', error);
        });
    };

    // Initial fetch
    fetchUserData();

    // Set up Firestore listener
    const unsubscribe = firebase.firestore().collection('users').onSnapshot(() => {
      // Re-fetch user data whenever the users collection changes
      fetchUserData();
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);

  const handleUserDoubleClick = (userId: string, userName: string, interests: string[]) => {
    setSelectedUserId([userId]);
    setSelectedUserName(userName);
    setSelectedInterests(interests);
    setModalVisible(true);
  };

  const handleRemoveInterest = (index: number) => {
    const updatedInterests = [...selectedInterests];
    const removedInterest = updatedInterests.splice(index, 1)[0].trim().replace(/^'|'$/g, '');
    setSelectedInterests(updatedInterests);
    setDeletedInterests([...deletedInterests, removedInterest]);
  };

  const handleAddInterest = (interest: string) => {
    const cleanedInterest = interest.trim().replace(/^'|'$/g, '');
    setSelectedInterests([...selectedInterests, cleanedInterest]);
    setAddedInterests([...addedInterests, cleanedInterest]);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedUserId([]);
    setSelectedUserName('');
    setSelectedInterests([]);
    setDeletedInterests([]);
    setAddedInterests([]);
  };

  const handleSave = () => {
    const cleanedDeletedInterests = deletedInterests.map(interest => interest.trim().replace(/^'|'$/g, ''));
    const cleanedAddedInterests = addedInterests.map(interest => interest.trim().replace(/^'|'$/g, ''));

    const payload = {
      userId: selectedUserId,
      action: 'update',
      interests: {
        add: cleanedAddedInterests,
        delete: cleanedDeletedInterests,
      },
      name: selectedUserName,
    };

    // Make a call to update user data
    axios.put('http://localhost:5000/update_user_data', payload)
      .then(response => {
        console.log('Updated user data:', response.data);
        handleCloseModal();
      })
      .catch(error => {
        console.error('Error updating user data:', error);
      });
  };

  const handleDeleteUser = (userId: string) => {
    axios.delete(`http://localhost:5000/delete_document?type=user&documentId=${userId}`)
      .then(response => {
        console.log('Deleted user successfully:', response.data);
        // Optionally, update state to reflect the deletion
        const updatedUsers = users.filter(user => user.userId !== userId);
        setUsers(updatedUsers);
        handleCloseModal(); // Close modal after deletion
      })
      .catch(error => {
        console.error('Error deleting user:', error);
      });
  };

  return (
    <div className="overflow-y-scroll scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent scrollbar-thumb-rounded-full h-full" style={{ height: "100vh" }}>
      {users.map((user, index) => (
        <div
          key={index}
          className={`h-18 rounded-md bg-black mb-4 p-6 px-10 flex items-center justify-between cursor-pointer ${selectedUserId.includes(user.userId) ? 'bg-purple-900' : ''}`}
          style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
          onDoubleClick={() => handleUserDoubleClick(user.userId, user.name, user.interests)}
        >
          <div className="flex items-center">
            <img
              className="w-8 h-8 mr-6"
              src="path_to_avatar"
              alt="User Avatar"
            />
            <div className="flex flex-col">
              <p className="text-white text-md text-left">{user.name}</p>
              <p className="text-white text-sm text-left truncate" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.interests.join(', ')}
              </p>
            </div>
          </div>
        </div>
      ))}
      {modalVisible && (
        <div ref={modalRef} className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg">
            <input
              type="text"
              value={selectedUserName}
              onChange={(e) => setSelectedUserName(e.target.value)}
              className="border border-gray-300 p-2 mb-2"
            />
            <h2 className="text-lg font-bold mb-2">Interests</h2>
            <ul>
              {selectedInterests.map((interest, index) => (
                <li key={index} className="flex items-center">
                  <span>{interest}</span>
                  <button onClick={() => handleRemoveInterest(index)} className="ml-2 text-red-600">&#10006;</button>
                </li>
              ))}
            </ul>
            <input type="text" onKeyDown={(e) => { if (e.key === 'Enter') handleAddInterest(e.currentTarget.value); }} placeholder="Add interest" />
            <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4">Save</button>
            <button onClick={handleCloseModal} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2">Cancel</button>
            <button onClick={() => handleDeleteUser(selectedUserId[0])} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};
