import React, { useState, useEffect } from 'react';
import axios from 'axios';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import ChatModal from './ChatModal';

interface User {
  userId: string;
  name: string;
}

interface Group {
  groupId: string;
  name: string;
  users: User[];
  selected: boolean;
}

interface GroupsProps {
  openChatModal: (groupId: string) => void;
}

const Groups: React.FC<GroupsProps> = ({ openChatModal }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string[]>([]);
  const [selectedGroupName, setSelectedGroupName] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [chatGroupId, setChatGroupId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/groups');
        setGroups(response.data);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    // Initial fetch
    fetchData();

    // Set up Firestore listener
    const unsubscribe = firebase.firestore().collection('groups').onSnapshot(() => {
      // Re-fetch group data whenever the groups collection changes
      fetchData();
    });

    // Clean up listener on unmount
    return () => unsubscribe();
  }, []);

  const handleGroupDoubleClick = (groupId: string, groupName: string, users: User[]) => {
    setSelectedGroupId([groupId]);
    setSelectedGroupName(groupName);
    setSelectedUsers(users);
    setModalVisible(true);
  };

  const handleRemoveUser = (userId: string) => {
    const updatedUsers = selectedUsers.filter(user => user.userId !== userId);
    setSelectedUsers(updatedUsers);
    setDeletedUsers([...deletedUsers, userId]);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedGroupId([]);
    setSelectedGroupName('');
    setSelectedUsers([]);
    setDeletedUsers([]);
  };

  const handleSave = () => {
    const payload = {
      groupId: selectedGroupId,
      action: 'update',
      users: {
        delete: deletedUsers,
      },
      name: selectedGroupName,
    };

    axios.put('http://localhost:5000/update_group_data', payload)
      .then(response => {
        console.log('Updated group data:', response.data);
        handleCloseModal();
      })
      .catch(error => {
        console.error('Error updating group data:', error);
      });
  };

  const handleDeleteGroup = (groupId: string) => {
    axios.delete(`http://localhost:5000/delete_document?type=group&documentId=${groupId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => {
        console.log('Deleted group successfully:', response.data);
        const updatedGroups = groups.filter(group => group.groupId !== groupId);
        setGroups(updatedGroups);
        handleCloseModal();
      })
      .catch(error => {
        console.error('Error deleting group:', error);
      });
  };

  const handleOpenChatModal = (groupId: string) => {
    openChatModal(groupId);
  };

  const handleDoubleClick = (groupId: string, groupName: string, users: User[]) => {
    handleGroupDoubleClick(groupId, groupName, users);
  };

  return (
    <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent scrollbar-thumb-rounded-full" style={{ height: "100vh" }}>
      {groups.map((group, index) => (
        <div
          key={index}
          className={`h-18 rounded-md bg-black mb-4 p-6 px-10 flex items-center justify-between cursor-pointer ${selectedGroupId.includes(group.groupId) ? 'bg-purple-900' : ''}`}
          style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
          onDoubleClick={() => handleDoubleClick(group.groupId, group.name, group.users)}
        >
          <div className="flex items-center">
            <div className="flex flex-col">
              <p className="text-white text-md text-left">{group.name}</p>
              <p className="text-white text-sm text-left truncate" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {group.users.map(user => user.name).join(', ')}
              </p>
            </div>
          </div>
          <button className="text-white text-sm" onClick={() => handleOpenChatModal(group.groupId)}>Open Chat</button>
        </div>
      ))}
      {modalVisible && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-4 rounded-lg">
            <input
              type="text"
              value={selectedGroupName}
              onChange={(e) => setSelectedGroupName(e.target.value)}
              className="border border-gray-300 p-2 mb-2"
            />
            <h2 className="text-lg font-bold mb-2">Users</h2>
            <ul>
              {selectedUsers.map((user, index) => (
                <li key={index} className="flex items-center">
                  <span>{user.name}</span>
                  <button onClick={() => handleRemoveUser(user.userId)} className="ml-2 text-red-600">&#10006;</button>
                </li>
              ))}
            </ul>
            <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4">Save</button>
            <button onClick={handleCloseModal} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2">Cancel</button>
            <button onClick={() => handleDeleteGroup(selectedGroupId[0])} className="bg-red-500 text-white px-4 py-2 rounded-lg mt-2">Delete</button>
          </div>
        </div>
      )}
      {chatGroupId && (
        <ChatModal groupId={chatGroupId} onClose={() => setChatGroupId(null)} />
      )}
    </div>
  );
};

export default Groups;
