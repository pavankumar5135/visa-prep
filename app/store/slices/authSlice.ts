import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the user interface
export interface User {
  id: string;
  name: string;
  email: string;
  firstName: string | null;
  minutes: number;
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
  firstName: null,
  minutes: 0,
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
    updateUserFirstName: (state, action: PayloadAction<string>) => {
      if (state.user) {
        state.user.firstName = action.payload;
      }
    },
    updateUserMinutes: (state, action: PayloadAction<number>) => {
      if (state.user) {
        state.user.minutes = action.payload;
      }
    },
  },
});

// Export actions
export const { 
  loginStart, 
  loginSuccess, 
  loginFailure, 
  logout, 
  updateUserFirstName,
  updateUserMinutes
} = authSlice.actions;

// Export reducer
export default authSlice.reducer; 