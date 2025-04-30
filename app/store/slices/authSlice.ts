import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the user interface
export interface User {
  id: string;
  name: string;
  email: string;
}

// Define the auth state interface
export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// Default user for demo
const defaultUser: User = {
  id: '123456',
  name: 'Demo User',
  email: 'user@example.com',
};

// Initial state
const initialState: AuthState = {
  user: defaultUser, // Using default user for demo
  loading: false,
  error: null,
};

// Create the auth slice
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    logout: (state) => {
      state.user = null;
    },
  },
});

// Export actions
export const { loginStart, loginSuccess, loginFailure, logout } = authSlice.actions;

// Export reducer
export default authSlice.reducer; 