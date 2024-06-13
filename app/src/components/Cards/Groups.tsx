import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

interface Group {
  groupId: string;
  name: string;
  users: string[];  // Will be replaced with string[] of names
  selected: boolean;
}

interface User {
  userId: string;
  name: string;
}

interface GroupsProps {
  openChatModal: (groupId: string) => void;
  onClose: () => void;
}

const Groups: React.FC<GroupsProps> = ({ openChatModal }) => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string[]>([]);
  const [selectedGroupName, setSelectedGroupName] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [deletedUsers, setDeletedUsers] = useState<string[]>([]);
  const [addedUsers, setAddedUsers] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both groups and users data concurrently
        const [groupsResponse, usersResponse] = await Promise.all([
          axios.get('http://localhost:5000/groups'),
          axios.get('http://localhost:5000/users')
        ]);

        // Process groups data
        const fetchedGroups: Group[] = groupsResponse.data;

        // Map userIds to names
        const usersMap: { [key: string]: string } = {};
        usersResponse.data.forEach((user: User) => {
          usersMap[user.userId] = user.name;
        });

        // Update groups with user names
        const updatedGroups = fetchedGroups.map(group => ({
          ...group,
          users: group.users.map(userId => usersMap[userId] || userId) // Replace userId with name if available
        }));

        setGroups(updatedGroups);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const handleGroupDoubleClick = (groupId: string, groupName: string, users: string[]) => {
    setSelectedGroupId([groupId]);
    setSelectedGroupName(groupName);
    setSelectedUsers(users);
    setModalVisible(true);
  };

  const handleRemoveUser = (index: number) => {
    const updatedUsers = [...selectedUsers];
    const removedUser = updatedUsers.splice(index, 1)[0];
    setSelectedUsers(updatedUsers);
    setDeletedUsers([...deletedUsers, removedUser]);
  };

  const handleAddUser = (user: string) => {
    setSelectedUsers([...selectedUsers, user]);
    setAddedUsers([...addedUsers, user]);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedGroupId([]);
    setSelectedGroupName('');
    setSelectedUsers([]);
    setDeletedUsers([]);
    setAddedUsers([]);
  };

  const handleSave = () => {
    const payload = {
      groupId: selectedGroupId,
      action: 'update',
      users: {
        add: [...addedUsers],
        delete: [...deletedUsers],
      },
      name: selectedGroupName,
    };

    // Make a call to update group data
    axios.put('http://localhost:5000/update_group_data', payload)
      .then(response => {
        console.log('Updated group data:', response.data);
        handleCloseModal();
      })
      .catch(error => {
        console.error('Error updating group data:', error);
      });
  };

  return (
    <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent scrollbar-thumb-rounded-full" style={{ height: "100vh" }}>
      {groups.map((group, index) => (
        <div
          key={index}
          className={`h-18 rounded-md bg-black mb-4 p-6 px-10 flex items-center justify-between cursor-pointer ${selectedGroupId.includes(group.groupId) ? 'bg-purple-900' : ''}`}
          style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
          onDoubleClick={() => handleGroupDoubleClick(group.groupId, group.name, group.users)}
        >
          <div className="flex items-center">
            <img
              className="w-8 h-8 mr-6"
              src="path_to_avatar"
              alt="Group Avatar"
            />
            <div className="flex flex-col">
              <p className="text-white text-md text-left">{group.name}</p>
              <p className="text-white text-sm text-left truncate" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {group.users.join(', ')}
              </p>
            </div>
          </div>
          <button className="text-white text-sm" onClick={() => openChatModal(group.groupId)}>Open Chat</button>
        </div>
      ))}
      {modalVisible && (
        <div ref={modalRef} className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
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
                  <span>{user}</span>
                  <button onClick={() => handleRemoveUser(index)} className="ml-2 text-red-600">&#10006;</button>
                </li>
              ))}
            </ul>
            <input type="text" onKeyDown={(e) => { if (e.key === 'Enter') handleAddUser(e.currentTarget.value); }} placeholder="Add user" />
            <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-4">Save</button>
            <button onClick={handleCloseModal} className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2">Cancel</button>
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg mt-2">Delete</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;
