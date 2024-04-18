import React, { useState, ReactNode } from 'react';
import Header from '../components/Header/index';
import Sidebar from '../components/Sidebar/index';
import SidebarRight from '../components/Sidebar-Right/index';

const DefaultLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="no-scrollbar dark:bg-boxdark-2 dark:text-bodydark"  style = {{ height: '100%'}}>
      {/* <!-- ===== Page Wrapper Start ===== --> */}
      <div className="flex flex-col h-screen bg-black overflow-hidden" style = {{ height: '100%'}}>
        {/* Adjust here: Make the main layout a flex row to include both sidebars and the content area including the header */}
        <div className="flex flex-1 min-h-0">
          {/* <!-- ===== Sidebar Start ===== --> */}
          {/* Render the Sidebar component and pass handleSportSelection and selectedSport as props */}
          <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* <!-- ===== Sidebar End ===== --> */}

          {/* Wrap Header and Main Content in a flex column */}
          <div className="flex flex-col flex-1 bg-body" style={{ borderTopLeftRadius: '2.6rem', borderBottomLeftRadius: '2.6rem' }}>
            {/* <!-- ===== Header Start ===== --> */}
            <Header />
            {/* <!-- ===== Header End ===== --> */}

            {/* Adjust here: Make the main content a flex container */}
            <div className="flex flex-1 overflow-y-scroll scrollbar-thin scrollbar-thumb-black scrollbar-track-transparent scrollbar-thumb-rounded-full">
              {/* <!-- Main Content Start --> */}
              <main className="flex-1 relative">
                <div className="mx-auto mt-24 max-w-screen-3xl p-4 md:p-6 2xl:p-10">
                  {children}
                </div>
              </main>
              {/* <!-- Main Content End --> */}
            </div>
          </div>

          {/* <!-- ===== Sidebar Right Start ===== --> */}
          <SidebarRight sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* <!-- ===== Sidebar Right End ===== --> */}
        </div>
        {/* <!-- ===== Page Wrapper End ===== --> */}
      </div>
    </div>
  );
};

export default DefaultLayout;
