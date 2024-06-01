import React from 'react';
import CustomUserButton from '../Header/CustomUserButton';  // Adjust the import path as needed

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const SidebarRight: React.FC<SidebarProps> = ({ sidebarOpen }) => {

  React.useEffect(() => {
    localStorage.setItem('sidebar-expanded', sidebarOpen.toString());
    if (sidebarOpen) {
      document.querySelector('body')?.classList.add('sidebar-expanded');
    } else {
      document.querySelector('body')?.classList.remove('sidebar-expanded');
    }
  }, [sidebarOpen]);

  return (
    <aside className="static right-0 top-0 z-9999 flex h-screen flex-col overflow-y-hidden bg-black duration-150 ease-linear lg:static lg:translate-x-0 w-90">
      {/* <!-- SIDEBAR HEADER --> */}
      <div className="flex justify-between items-center p-6">
        <div></div> {/* Add an empty div to push the CustomUserButton to the right */}
        <CustomUserButton />
      </div>
      {/* <!-- END SIDEBAR HEADER --> */}

      <div className="no-scrollbar flex flex-col duration-300 ease-linear">
        {/* <!-- Sidebar Menu --> */}
        <nav className="mt-5 py-4 px-6 lg:mt-2 lg:px-6">
          {/* <!-- Menu Group --> */}
          <div>
            <ul className="mb-2 flex flex-col gap-2">
              {/* Sidebar Content Here */}
              {/* Your added card component */}
              <div className="w-full md:w-full lg:w-full xl:w-full flex-col items-center">
                <div className="flex gap-2">
                  <h2 className="text-white text-md mb-4 cursor-pointer">Over/Under</h2>
                </div>
                <div className="flex-1 rounded-md">
                  <div className="py-1 h-[73.3vh] overflow-y-scroll scrollbar-thin scrollbar-thumb-body scrollbar-track-transparent scrollbar-thumb-rounded-full">
                    <div className="flex flex-col gap-4">
                      {/* Mini Cards within the row */}
                      <div className="h-11 w-full rounded-md bg-body"></div>
                    </div>
                  </div>
                </div>
              </div>
              {/* End of added card component */}              



            </ul>
          </div>
        </nav>
        {/* <!-- Sidebar Menu --> */}
      </div>
    </aside>
  );
};

export default SidebarRight;