import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import Admin from './pages/Dashboard/Admin';
import { Provider } from 'react-redux';
import store from './store/store';
import { setupNotifications } from './firebase';
import { toastNotification, sendNativeNotification } from './hooks/notificationHelpers';
import useVisibilityChange from './hooks/useVisibilityChange';

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();
  const isForeground = useVisibilityChange();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  useEffect(() => {
    setupNotifications((message) => {
      if (message && message.notification) {
        const { title, body } = message.notification;

        if (isForeground) {
          toastNotification({
            title,
            description: body,
            status: "info",
          });
        } else {
          sendNativeNotification({
            title,
            body,
          });
        }
      }
    });
  }, [isForeground]);

  return loading ? (
    <Loader />
  ) : (
    <Provider store={store}>
      <>
        <Routes>
          <Route
            index
            element={
              <>
                <PageTitle title="Cliqueof10" />
                <Admin />
              </>
            }
          />
        </Routes>
      </>
    </Provider>
  );
}

export default App;
