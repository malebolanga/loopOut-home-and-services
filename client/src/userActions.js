// userActions.js
export const fetchUserProfile = (userId) => async (dispatch) => {
  try {
    dispatch({ type: 'FETCH_USER_PROFILE_START' });
    const res = await fetch(`/api/user/${userId}`);
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message || 'Failed to fetch user');
    }
    
    dispatch({ type: 'FETCH_USER_PROFILE_SUCCESS', payload: data });
  } catch (error) {
    dispatch({ type: 'FETCH_USER_PROFILE_FAILURE', payload: error.message });
  }
};

export const toggleFollowUser = (userId) => async (dispatch) => {
  try {
    const res = await fetch(`/api/user/${userId}/follow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    
    if (!res.ok) {
      throw new Error(data.message);
    }
    
    dispatch({ type: 'TOGGLE_FOLLOW_USER', payload: userId });
  } catch (error) {
    console.error('Follow error:', error);
  }
};