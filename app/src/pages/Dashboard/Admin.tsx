import React, { lazy, Suspense, useState, useEffect } from 'react';
import DefaultLayout from '../../layout/DefaultLayout';
import { useAppSelector } from '../../store/hooks'; // Import the useAppSelector hook

// Lazy-loaded components for Users and Groups
const Users = lazy(() => import('../../components/Cards/Users').then(module => ({ default: module.Users })));
const Groups = lazy(() => import('../../components/Cards/Groups').then(module => ({ default: module.Groups })));

const Admin: React.FC = () => {
  const selectedState = useAppSelector((state) => state.selectedState.selectedState);
  const [dataLoading, setDataLoading] = useState<boolean>(true);

  useEffect(() => {
    // Mock data loading simulation
    setTimeout(() => {
      setDataLoading(false);
    }, 2000);
  }, []);

  // Render the appropriate component based on selectedState
  const renderComponent = () => {
    switch (selectedState) {
      case 'Users':
        return <Users />;
      case 'Groups':
        return <Groups />;
      default:
        return <Users />;
    }
  };

  const SkeletonLoader: React.FC = () => (
    <div className="p-2">
      {/* Placeholder for match items */}
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
      </div>
    </DefaultLayout>
  );
};

export default Admin;
