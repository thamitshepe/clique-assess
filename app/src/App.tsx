import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import ECommerce from './pages/Dashboard/ECommerce';
import { Provider } from 'react-redux';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import store from './store/store';
import { useCheckSubscription } from './hooks/useCheckSubscription';
import useMobileOrientation from './hooks/useMobileOrientation';
import LandscapeWarning from './components/LandscapeWarning';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();
  const { isMobile, isLandscape } = useMobileOrientation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useCheckSubscription();

  if (isMobile && !isLandscape) {
    return <LandscapeWarning />;
  }

  return loading ? (
    <Loader />
  ) : (
    <Provider store={store}>
      <Routes>
        <Route
          index
          element={
            <>
              <PageTitle title="BetVision AI" />
              <SignedIn>
                <ECommerce />
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />
      </Routes>
    </Provider>
  );
}

export default App;
