import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth';
import { app } from '../firebase';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInSuccess, signInFailure } from '../redux/user/userSlice';
import { useNavigate } from 'react-router-dom';
import { FcGoogle } from 'react-icons/fc';
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';

export default function OAuth() {
  const { loading } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleGoogleClick = async () => {
    try {
      dispatch(signInStart());
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app);

      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (res.ok) {
        dispatch(signInSuccess(data));
        navigate('/');
      } else {
        dispatch(signInFailure(data.message || 'Server error during Google sign-in'));
      }
    } catch (error) {
      console.error('Google Auth Error:', error);
      let errorMessage = 'Could not sign in with Google';
      if (error.code === 'auth/popup-closed-by-user') {
        errorMessage = 'Sign-in popup was closed before completion.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection.';
      } else if (error.code === 'auth/unauthorized-domain') {
        errorMessage = 'This domain is not authorized for Google Sign-in. Please add it to the Firebase Console.';
      }
      dispatch(signInFailure(errorMessage));
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleGoogleClick}
      disabled={loading}
      type='button'
      className='flex items-center justify-center gap-3 w-full bg-white border border-[#DDDDDD] text-[#222222] font-semibold p-3 rounded-lg hover:bg-[#F7F7F7] hover:border-[#000000] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-sm'
    >
      {loading ? (
        <FaSpinner className="animate-spin text-[#E61E4D]" />
      ) : (
        <FcGoogle className="text-xl" />
      )}
      <span>{loading ? 'Processing...' : 'Continue with Google'}</span>
    </motion.button>
  );
}
