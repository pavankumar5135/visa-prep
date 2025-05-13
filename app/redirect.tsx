'use client';

import { useEffect, useState } from 'react';

export default function AutoRedirect() {
  const [redirecting, setRedirecting] = useState(false);
  const [checkCount, setCheckCount] = useState(0);

  // Effect to handle the counter for multiple redirect checks
  useEffect(() => {
    // Only try up to 3 times, with increasing delays
    if (checkCount < 3 && !redirecting) {
      const timer = setTimeout(() => {
        setCheckCount(prev => prev + 1);
      }, checkCount * 500 + 500); // 500ms, 1000ms, 1500ms
      
      return () => clearTimeout(timer);
    }
  }, [checkCount, redirecting]);

  // Effect to check if we should redirect
  useEffect(() => {
    // Skip if already redirecting
    if (redirecting) return;
    
    // Check if we have interview data in localStorage
    const storedData = localStorage.getItem('interviewData');
    const editFlag = localStorage.getItem('editInterviewData');
    const disableRedirect = localStorage.getItem('disableAutoRedirect');
    const completedFlag = localStorage.getItem('completedInterview');
    const interviewCompleted = localStorage.getItem('interviewCompleted');
    const currentPath = window.location.pathname;
    
    console.log('Redirect check #' + checkCount, {
      hasData: !!storedData,
      path: currentPath,
      editFlag,
      disableRedirect,
      completedFlag,
      interviewCompleted
    });
    
    // If disable redirect flag is set, immediately clear all interview data to prevent future redirects
    if (disableRedirect === 'true') {
      console.log('disableAutoRedirect flag is set, clearing all interview data');
      localStorage.removeItem('interviewData');
      localStorage.removeItem('hasStartedInterview');
      localStorage.removeItem('interviewCompleted');
      return;
    }
    
    // If returning from a completed interview, clear the flag and don't redirect
    if (completedFlag === 'true') {
      console.log('Interview was completed, not redirecting');
      localStorage.removeItem('completedInterview');
      localStorage.removeItem('interviewData'); // Also clear interview data for safety
      return;
    }
    
    // If interview is marked as completed, don't redirect
    if (interviewCompleted === 'true') {
      console.log('Interview is marked as completed, not redirecting');
      localStorage.removeItem('interviewData'); // Also clear interview data for safety
      return;
    }
    
    // Check if we're on a dashboard page
    const isDashboardPage = currentPath === '/dashboard' || currentPath === '/visa-prep/dashboard';
    
    // Only redirect if we have interview data, we're on a dashboard page, 
    // no flags are set to prevent redirection, and interview is not completed
    if (storedData && 
        isDashboardPage && 
        editFlag !== 'true' && 
        disableRedirect !== 'true' &&
        interviewCompleted !== 'true' &&
        completedFlag !== 'true') {
      setRedirecting(true);
      
      // Determine the correct interview page based on current path
      const interviewPath = currentPath.startsWith('/visa-prep') 
        ? '/visa-prep/interview' 
        : '/interview';
      
      // Redirect to the appropriate interview page
      console.log(`Auto-redirect: Found interview data, redirecting to ${interviewPath}`);
      
      // Use setTimeout to ensure this runs after any competing navigation
      const redirectTimer = setTimeout(() => {
        window.location.href = interviewPath;
      }, 500);
      
      return () => clearTimeout(redirectTimer);
    }
  }, [checkCount, redirecting]);

  if (!redirecting) return null;

  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mx-auto mb-4"></div>
        <p className="text-lg font-medium text-gray-800 mb-2">Interview Data Found</p>
        <p className="text-gray-600">Redirecting to your interview...</p>
      </div>
    </div>
  );
} 