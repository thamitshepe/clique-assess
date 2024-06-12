import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Loader from './common/Loader';
import PageTitle from './components/PageTitle';
import SignIn from './pages/Authentication/SignIn';
import SignUp from './pages/Authentication/SignUp';
import Admin from './pages/Dashboard/Admin';
import { Provider } from 'react-redux'; // Import Provider
import store from './store/store'; // Import your Redux store

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

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
          <Route
            path="/auth/signin"
            element={
              <>
                <PageTitle title="Signin | Cliqueof10" />
                <SignIn />
              </>
            }
          />
          <Route
            path="/auth/signup"
            element={
              <>
                <PageTitle title="Signup | Cliqueof10" />
                <SignUp />
              </>
            }
          />
        </Routes>
      </>
    </Provider>
  );
}

export default App;