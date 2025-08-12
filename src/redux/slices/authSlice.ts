import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isLoggedIn: boolean | false;
  token: string | null;
  user: any | null;
}

const initialState: AuthState = {
  isLoggedIn: false,
  token: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<any>) => {
      state.user = action.payload?.user || null;
      if ('token' in action.payload) {
        state.token = action.payload.token;
      }
    },
     setIsLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    },
    logout: state => {
      state.user = null;
      state.isLoggedIn = false;
      state.token = null;
    }
  },
});

export const { setUser, logout,setIsLoggedIn } = authSlice.actions;
export default authSlice.reducer;
