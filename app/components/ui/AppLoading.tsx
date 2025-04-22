'use client';

import { useEffect, useState } from 'react';
import { Preloader } from './Preloader';

export function AppLoading() {
  const [isFirstLoad, setIsFirstLoad] = useState(false);
  
  useEffect(() => {
    // Check if this is the first load based on sessionStorage
    const hasLoaded = sessionStorage.getItem('app_loaded');
    
    if (!hasLoaded) {
      setIsFirstLoad(true);
      // Set the flag to avoid showing the preloader on subsequent navigations
      sessionStorage.setItem('app_loaded', 'true');
    }
  }, []);
  
  // Only show the preloader on the first load
  if (!isFirstLoad) {
    return null;
  }
  
  return <Preloader minimumLoadTimeMs={1500} />;
} 