import React, { lazy, Suspense, useState, useEffect } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { useAppSelector } from '../../store/hooks';
import ChatModal from '../../components/Cards/ChatModal'; // Import the ChatModal component
import Groups from '../../components/Cards/Groups';

const Users = lazy(() => import('../../components/Cards/Users').then(module => ({ default: module.Users })));

const Admin: React.FC = () => {
  const selectedState = useAppSelector((state) => state.selectedState.selectedState);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      setDataLoading(false);
    }, 2000);
  }, []);

  const openChatModal = (groupId: string) => {
    setSelectedGroupId(groupId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGroupId(null);
  };

  const renderComponent = () => {
    switch (selectedState) {
      case 'Users':
        return <Users />;
      case 'Groups':
        // Pass openChatModal and onClose props to Groups component correctly
        return <Groups openChatModal={openChatModal} onClose={closeModal} />;
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

export default Admin;
