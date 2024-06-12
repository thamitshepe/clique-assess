import React, { useState } from 'react';

export const Groups: React.FC = () => {
  // Sample group data
  const initialGroups = [
    { groupNumber: 1, users: ['John Doe', 'Jane Smith', 'Michael Johnson'], selected: false },
    { groupNumber: 2, users: ['Emily Davis', 'Chris Wilson'], selected: false },
    { groupNumber: 3, users: ['Sam Green', 'Lucy Brown'], selected: false },
    { groupNumber: 4, users: ['Peter White', 'Nina Black'], selected: false },
    { groupNumber: 5, users: ['Kevin Yellow', 'Laura Pink'], selected: false },
    { groupNumber: 6, users: ['Tom Orange', 'Sara Red'], selected: false },
    { groupNumber: 7, users: ['Will Blue', 'Dana Purple'], selected: false },
    { groupNumber: 8, users: ['Greg Grey', 'Hannah Cyan'], selected: false },
    { groupNumber: 9, users: ['Jack Brown', 'Ivy Gold'], selected: false },
    { groupNumber: 10, users: ['Chris Green', 'Amy Silver'], selected: false },
    { groupNumber: 11, users: ['Bob Bronze', 'Anna Platinum'], selected: false }
    // Add more groups here if needed
  ];

  const [groups, setGroups] = useState(initialGroups);
  const [startIndex, setStartIndex] = useState(0); // Index of the first displayed group

  // Function to handle group card click
  const handleGroupClick = (index: number) => {
    const updatedGroups = [...groups];
    updatedGroups[index].selected = !updatedGroups[index].selected;
    setGroups(updatedGroups);
  };

  // Function to handle next button click
  const handleNextClick = () => {
    setStartIndex(prevIndex => Math.min(prevIndex + 10, groups.length - 1));
  };

  // Function to handle previous button click
  const handlePreviousClick = () => {
    setStartIndex(prevIndex => Math.max(prevIndex - 10, 0));
  };

  return (
    <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent scrollbar-thumb-rounded-full" style={{ height: '90vh' }}>
      {/* Render group cards */}
      {groups.slice(startIndex, startIndex + 10).map((group, index) => (
        <div
          key={index}
          className={`h-18 rounded-md bg-black mb-4 p-6 px-10 flex items-center justify-between cursor-pointer ${group.selected ? 'bg-purple-900' : ''}`}
          style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}
          onClick={() => handleGroupClick(index + startIndex)}
        >
          {/* Render group details */}
          <div className="flex items-center">
            <div className="flex flex-col">
              <p className="text-white text-md">Group {group.groupNumber}</p>
              <p className="text-white text-sm truncate" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Users: {group.users.join(', ')}
              </p>
            </div>
          </div>
        </div>
      ))}
      {/* Previous and next buttons */}
      <div className="flex justify-between mt-4">
        <button
          onClick={handlePreviousClick}
          disabled={startIndex === 0}
          className="text-white bg-black p-2 rounded disabled:opacity-50"
        >
          {'< Previous'}
        </button>
        <button
          onClick={handleNextClick}
          disabled={startIndex + 10 >= groups.length}
          className="text-white bg-black p-2 rounded disabled:opacity-50"
        >
          {'Next >'}
        </button>
      </div>
    </div>
  );
};
