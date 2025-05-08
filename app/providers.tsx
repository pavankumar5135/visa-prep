'use client';

import { Provider } from 'react-redux';
import { store } from './store';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { fetchUserProfile } from './utils/api/profileApi';
import { fetchUserMinutes } from './utils/api/userApi';

function UserDataInitializer() {
  const dispatch = useDispatch();

  useEffect(() => {
    fetchUserProfile();
    fetchUserMinutes();
  }, [dispatch]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <UserDataInitializer />
      {children}
    </Provider>
  );
} 