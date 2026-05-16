import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from './redux/user/userSlice';

function App() {
  const dispatch = useDispatch();

  // Validate token on app load
  useEffect(() => {
    const validateSession = async () => {
      dispatch(signInStart());
      try {
        const res = await fetch('/api/auth/validate-token', {
          method: 'POST',
          credentials: 'include'
        });

        const data = await res.json();

        if (data.valid) {
          dispatch(signInSuccess(data.user));
        } else {
          dispatch(signInFailure(null));
        }
      } catch (error) {
        dispatch(signInFailure(null));
      }
    };

    validateSession();
  }, [dispatch]);

  return (
    <div></div>
  );
}

export default App;
