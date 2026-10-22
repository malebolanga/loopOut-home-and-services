import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'light', // 'light' | 'dark'
  currency: 'R', // default currency symbol
  notificationCount: 0,
  wishlistCount: 0,
  hideBottomNav: false,
  hideHeader: false,
};

const frontendSlice = createSlice({
  name: 'frontend',
  initialState,
  reducers: {
    setTheme(state, action) {
      state.theme = action.payload; // expect 'light' or 'dark'
    },
    setCurrency(state, action) {
      state.currency = action.payload; // e.g., 'R' or '$'
    },
    setNotificationCount(state, action) {
      state.notificationCount = action.payload;
    },
    setWishlistCount(state, action) {
      state.wishlistCount = action.payload;
    },
    setHideBottomNav(state, action) {
      state.hideBottomNav = Boolean(action.payload);
    },
    setHideHeader(state, action) {
      state.hideHeader = Boolean(action.payload);
    },
  },
});

export const {
  setTheme,
  setCurrency,
  setNotificationCount,
  setWishlistCount,
  setHideBottomNav,
  setHideHeader,
} = frontendSlice.actions;
export default frontendSlice.reducer;
