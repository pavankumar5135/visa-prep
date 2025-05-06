'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Conversation } from '../components/Conversation';
import { useAppSelector } from '../store/hooks';
import IntakeForm from '../components/IntakeForm';
import Header from '../components/Header';
import { useSelector } from 'react-redux';
import { createClient } from '@/app/utils/supabase/client';
import { RootState } from '@/app/store';
import { fetchUserProfile } from '@/app/utils/api/profileApi';
import { fetchUserMinutes, deductUserMinutes, recordInterviewUsage } from '@/app/utils/api/userApi';
import MinutesDisplay from '../components/MinutesDisplay';
import { ConversationState } from '@/app/store/slices/conversationSlice';

// Constants
const INTERVIEW_REQUIRED_MINUTES = 1;

// Define form data types
interface InterviewData {
  name: string;
  role: string;
  visaType: string;
  originCountry: string;
  destinationCountry: string;
  employer: string;
  client?: string; // Make client optional
}

export default function InterviewPage() {
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Modal states
  const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);
  const [showReturnToDashboardModal, setShowReturnToDashboardModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Set a flag to track if we've already deducted minutes for this session
  const [minutesDeducted, setMinutesDeducted] = useState(false);
  
  const router = useRouter();
  
  // Replace Redux selector with direct hooks
  const interviewStage = useSelector((state: RootState) => (state.conversation as any).interviewStage);
  const feedback = useSelector((state: RootState) => (state.conversation as any).feedback);
  const elapsedTime = useSelector((state: RootState) => (state.conversation as any).elapsedTime);
  
  // Get first name from Redux store
  const userFirstName = useSelector((state: RootState) => state.auth.user?.firstName);
  // Get minutes from Redux store - ensure this hook is called on every render
  const userMinutes = useSelector((state: RootState) => state.auth.user?.minutes || 0);
  
  // State for the edit form
  const [editFormData, setEditFormData] = useState<InterviewData | null>(null);
  
  // Reference to Redux state
  const analysis = useSelector((state: RootState) => (state.conversation as any).analysis);
  
  // Check Supabase Authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();
        
        if (error || !data?.user) {
          console.log('User not authenticated, redirecting to dashboard');
          // User is not authenticated, redirect to dashboard
          // Add a message to show on dashboard
          localStorage.setItem('authError', 'You must be logged in to access the interview page');
          router.push('/dashboard');
          return;
        } else {
          setSupabaseUser(data.user);
          console.log('Authenticated user on interview page:', data.user);
          
          // Fetch user profile using the API
          await Promise.all([
            fetchUserProfile(),
            fetchUserMinutes()
          ]);
          
          setAuthChecked(true);
        }
      } catch (err) {
        console.error('Authentication check error:', err);
        // On error, redirect to dashboard
        localStorage.setItem('authError', 'Authentication error. Please try again.');
        router.push('/dashboard');
        return;
      }
    }
    
    checkAuth();
  }, [router]);
  
  // A new effect to deduct minutes when the interview starts
  useEffect(() => {
    async function handleInterviewStart() {
      // Only proceed if authentication is checked and we haven't deducted minutes yet
      if (!authChecked || minutesDeducted) return;
      
      // Check if this is a new interview session by looking at localStorage
      const hasStarted = localStorage.getItem('hasStartedInterview');
      
      if (!hasStarted && interviewData) {
        console.log('New interview session detected, deducting minutes');
        
        // Deduct minutes from the user's account
        const success = await deductUserMinutes(INTERVIEW_REQUIRED_MINUTES);
        
        if (success) {
          // Mark that we've deducted minutes for this session
          setMinutesDeducted(true);
          localStorage.setItem('hasStartedInterview', 'true');
          
          // Record this usage
          await recordInterviewUsage(INTERVIEW_REQUIRED_MINUTES);
          
          // Refresh the minutes display
          await fetchUserMinutes();
          
          console.log('Successfully deducted minutes for this interview session');
        } else {
          // Handle failure case - maybe user ran out of minutes
          console.error('Failed to deduct minutes for this interview');
          
          // Show error message and redirect to dashboard
          localStorage.setItem('authError', 'You need at least 1 minute to start an interview. Please purchase more minutes.');
          router.push('/dashboard');
        }
      } else {
        console.log('Interview already started or resuming a session, not deducting minutes');
      }
    }
    
    handleInterviewStart();
  }, [authChecked, interviewData, minutesDeducted, router]);
  
  useEffect(() => {
    // Only retrieve interview data if authenticated
    if (!authChecked) return;
    
    // Retrieve interview data from localStorage
    const storedData = localStorage.getItem('interviewData');
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        // Ensure client is set even if undefined
        if (!parsedData.client) {
          parsedData.client = "";
        }
        setInterviewData(parsedData);
      } catch (error) {
        console.error('Failed to parse interview data:', error);
      }
    } else {
      // If no interview data, redirect back to dashboard
      console.log('No interview data found, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }
    
    setIsLoading(false);
  }, [authChecked, router]);
  
  const handleBack = () => {
    // Show modal instead of alert
    setShowBackConfirmModal(true);
  };
  
  // New function to handle dashboard navigation after confirmation
  const confirmBackToDashboard = () => {
    // Close the modal
    setShowBackConfirmModal(false);
    
    // Set loading indicator
    setIsLoading(true);
    
    // Set a flag to disable auto-redirect when landing on dashboard
    localStorage.setItem('disableAutoRedirect', 'true');
    
    // If interview is complete, clear the interview data when going back to dashboard
    if (isInterviewComplete) {
      // Clear the interview data to prevent auto-redirect
      localStorage.removeItem('interviewData');
      localStorage.removeItem('interviewCompleted');
      localStorage.removeItem('hasStartedInterview');
      
      // Set a flag to indicate we're returning after completion
      localStorage.setItem('completedInterview', 'true');
    } else {
      // If the interview is not complete, still clear the hasStartedInterview flag
      // to allow starting a new session
      localStorage.removeItem('hasStartedInterview');
    }
    
    // Use direct navigation instead of router to ensure clean navigation
    window.location.href = '/dashboard';
  };
  
  const handleEditDetails = () => {
    // Show the edit form modal
    setShowEditForm(true);
  };
  
  // Function to handle form submission from IntakeForm
  const handleEditFormSubmit = (formData: {
    name: string;
    role: string;
    visaType: string;
    originCountry: string;
    destinationCountry: string;
    employer: string;
    client?: string;
  }) => {
    // Update the interview data in state and localStorage
    setInterviewData(formData as InterviewData);
    localStorage.setItem('interviewData', JSON.stringify(formData));
    
    // Close the modal
    setShowEditForm(false);
  };
  
  // Function to handle form cancellation
  const handleEditFormCancel = () => {
    setShowEditForm(false);
  };
  
  const toggleDetails = () => {
    setIsDetailsVisible(!isDetailsVisible);
  };
  
  const handleViewFeedback = () => {
    setShowFeedback(true);
  };
  
  const apikey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  
  // Format time for display (MM:SS)
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };
  
  // Check if interview is complete
  const isInterviewComplete = interviewStage === 'complete' && feedback;
  
  // Set a flag when interview is complete
  useEffect(() => {
    if (isInterviewComplete) {
      // Mark this interview as completed so we don't auto-redirect back to it
      localStorage.setItem('interviewCompleted', 'true');
    }
  }, [isInterviewComplete]);
  
  // Auto-show feedback when interview completes after a short delay
  useEffect(() => {
    if (isInterviewComplete && !showFeedback) {
      // Give time for the "Interview Complete" screen to be visible before showing feedback
      const timer = setTimeout(() => {
        setShowFeedback(true);
        
        // Record the actual interview usage time
        // This will help with analytics and potentially refunding unused minutes
        const actualMinutesUsed = Math.ceil(elapsedTime / 60); // Convert seconds to minutes and round up
        recordInterviewUsage(actualMinutesUsed);
        
        console.log(`Interview completed. Actual minutes used: ${actualMinutesUsed}`);
      }, 5000); // 5 seconds delay
      
      return () => clearTimeout(timer);
    }
  }, [isInterviewComplete, showFeedback, elapsedTime]);
  
  // Handler for returning to dashboard from feedback section
  const handleReturnToDashboard = () => {
    // Show modal instead of immediately navigating
    setShowReturnToDashboardModal(true);
  };
  
  // Confirm return to dashboard
  const confirmReturnToDashboard = () => {
    // Close the modal
    setShowReturnToDashboardModal(false);
    
    // Set loading indicator
    setIsLoading(true);
    
    // Set a flag to disable auto-redirect when landing on dashboard
    localStorage.setItem('disableAutoRedirect', 'true');
    
    // If the interview was started but not completed, let's record the partial usage
    if (!isInterviewComplete && localStorage.getItem('hasStartedInterview')) {
      const actualMinutesUsed = Math.ceil(elapsedTime / 60); // Convert seconds to minutes and round up
      if (actualMinutesUsed > 0) {
        recordInterviewUsage(actualMinutesUsed);
        console.log(`Interview abandoned. Partial minutes used: ${actualMinutesUsed}`);
      }
    }
    
    // Clear the interview data to prevent auto-redirect
    localStorage.removeItem('interviewData');
    localStorage.removeItem('interviewCompleted');
    localStorage.removeItem('hasStartedInterview');
    
    // Set a flag to indicate we're returning after completion
    localStorage.setItem('completedInterview', 'true');
    
    // Use direct navigation instead of router
    window.location.href = '/dashboard';
  };
  
  // Sample countries for dropdowns
  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'India',
    'China',
    'Japan',
    'Germany',
    'France',
    'Brazil',
    'Mexico',
    'South Africa',
    'Nigeria',
    'Russia',
    'South Korea',
    'Philippines',
    'Pakistan',
    'Bangladesh',
    'Italy',
    'Spain',
  ];

  // Sample roles for dropdown
  const roles = [
    'Doctor',
    'Nurse',
    'Pharmacist',
    'Engineer',
    'Software Developer',
    'Business Analyst',
    'Project Manager',
    'Consultant',
    'Researcher',
    'Teacher',
    'Professor',
    'Student',
    'Sales Representative',
    'Marketing Specialist',
    'Executive',
    'Other'
  ];

  // Visa types
  const visaTypes = ['B1', 'B2', 'F1', 'H-1B', 'J1', 'B1/B2'];
  
  // Handle closing the auth popup
  const handleCloseAuthPopup = () => {
    setShowAuthPopup(false);
  };
  
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 z-50 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-800 mb-2">Returning to Dashboard</p>
          <p className="text-gray-600">Please wait...</p>
        </div>
      </div>
    );
  }
  
  if (!interviewData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gradient-to-br from-indigo-50 via-blue-50 to-white">
        <div className="text-center mb-8 bg-white p-10 rounded-2xl shadow-xl max-w-md">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Interview Data Not Found</h1>
          <p className="text-gray-600 mb-8">No interview information was found. Please return to the dashboard and try again.</p>
          <button 
            onClick={handleBack}
            className="inline-flex items-center px-6 py-3 border border-transparent rounded-full shadow-md text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col min-h-screen">
      {/* Use Header component */}
      <Header onAuthClick={() => setShowAuthPopup(true)} />
      
      <div className="flex-grow bg-gradient-to-br from-indigo-50 via-blue-50 to-white">
        {/* Return to Dashboard Modal (for completed interview) */}
        {showReturnToDashboardModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity animate-fadeIn">
            <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 max-w-md w-full mx-2 text-center animate-slideIn shadow-2xl">
              <div className="mb-4 sm:mb-6 inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Return to Dashboard?</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Your interview session is complete. Return to the dashboard to view other options or start a new practice session?
              </p>
              <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-4 justify-center">
                <button
                  onClick={() => setShowReturnToDashboardModal(false)}
                  className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-full text-xs sm:text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmReturnToDashboard}
                  className="px-4 sm:px-6 py-2 sm:py-3 border border-transparent rounded-full shadow-sm text-xs sm:text-sm text-white bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium"
                >
                  Go to Dashboard
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Back to Dashboard Confirmation Modal */}
        {showBackConfirmModal && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity animate-fadeIn">
            <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 max-w-md w-full mx-2 text-center animate-slideIn shadow-2xl">
              <div className="mb-4 sm:mb-6 inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-indigo-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Return to Dashboard?</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                Are you sure you want to leave this interview and return to the dashboard? Your progress will be saved.
              </p>
              <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-4 justify-center">
                <button
                  onClick={() => setShowBackConfirmModal(false)}
                  className="px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 rounded-full text-xs sm:text-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBackToDashboard}
                  className="px-4 sm:px-6 py-2 sm:py-3 border border-transparent rounded-full shadow-sm text-xs sm:text-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 font-medium"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Edit Form Modal */}
        {showEditForm && interviewData && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity animate-fadeIn p-2 sm:p-4 overflow-y-auto">
            <IntakeForm
              onSubmit={handleEditFormSubmit}
              onCancel={handleEditFormCancel}
              initialData={interviewData}
              title="Edit Interview Details"
              submitButtonText="Save Changes"
            />
          </div>
        )}
        
        {/* Auth Popup Modal */}
        {showAuthPopup && (
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto transition-opacity">
            <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-full p-2 mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Authentication Required</h3>
                </div>
                <button
                  onClick={handleCloseAuthPopup}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mb-6">
                {authError ? (
                  <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                    <p>{authError}</p>
                  </div>
                ) : null}
                <p className="text-gray-600 mb-4">
                  <strong>Authentication Required</strong> - This application only supports token-based authentication.
                </p>
                <p className="text-gray-600 mb-4">
                  To use this application, you must access it through the main application that will provide the authentication token automatically.
                </p>
                <p className="text-gray-600 mb-4">
                  Direct login with email and password is not available.
                </p>
                <p className="text-sm text-gray-500">
                  If you were redirected here from the main application but are seeing this message, please ensure you have an active session in the main application.
                </p>
              </div>
                          
              <div className="flex justify-end">
                <button
                  onClick={handleCloseAuthPopup}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6">
          {/* Header with navigation and info toggle */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 transition-colors mr-4 group"
              >
                <div className="mr-2 bg-indigo-100 rounded-full p-1.5 sm:p-2 transform transition-transform group-hover:-translate-x-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </div>
                <span>Back to Dashboard</span>
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleEditDetails}
                className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm text-xs sm:text-sm font-medium transition-all duration-200 transform hover:scale-105 bg-white text-indigo-600 border border-indigo-200 hover:border-indigo-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Details
              </button>
              
              <button 
                onClick={toggleDetails}
                className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full shadow-sm text-xs sm:text-sm font-medium transition-all duration-200 transform hover:scale-105"
                style={{
                  background: isDetailsVisible ? 'white' : 'linear-gradient(to right, #4f46e5, #3b82f6)',
                  color: isDetailsVisible ? '#4f46e5' : 'white',
                  border: isDetailsVisible ? '1px solid #e5e7eb' : 'none'
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isDetailsVisible ? 'Hide Details' : 'Show Details'}
              </button>
            </div>
          </div>
          
          {/* Compact participant info bar */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center justify-between backdrop-blur-sm bg-opacity-90 border border-gray-100">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mr-4 shadow-md">
                <span className="text-lg font-bold text-white">{interviewData.name.charAt(0)}</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 text-lg">{interviewData.name}</h4>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mr-2">{interviewData.visaType}</span>
                  <span>{interviewData.role}</span>
                  <span className="mx-2 text-gray-300">•</span>
                  <div className="flex items-center">
                    <span className="mr-1">{interviewData.originCountry}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-gray-400 mx-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <span className="ml-1">{interviewData.destinationCountry}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex space-x-2">
              <div className="group relative px-3 py-1.5 bg-teal-100 text-teal-800 rounded-md text-xs font-semibold flex items-center cursor-help">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="mr-1">Available:</span>
                <span className="font-bold">{userMinutes.toLocaleString()}</span>
                <span className="ml-1">mins</span>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-0 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  <div className="relative">
                    <p className="font-normal">These are your available minutes to practice with the AI interview agent.</p>
                    <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 left-4 -bottom-1"></div>
                  </div>
                </div>
              </div>
              <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {interviewData.employer}
              </div>
            </div>
          </div>
          
          {/* Collapsible interview details */}
          {isDetailsVisible && (
            <div className="relative mb-6 animate-fadeIn">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-indigo-400/10 backdrop-blur-sm rounded-xl"></div>
              <div className="backdrop-blur-sm bg-white/60 rounded-xl overflow-hidden border border-blue-100/80 shadow-lg">
                <div className="p-6 relative z-10">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl p-4 shadow-sm backdrop-blur-md bg-opacity-90 transform transition-transform hover:scale-[1.02]">
                      <h5 className="text-sm font-medium text-indigo-900 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Professional Details
                      </h5>
                      <div className="space-y-3 text-sm">
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <span className="text-xs text-indigo-500 font-medium">Role</span>
                          <p className="font-medium text-gray-800 mt-1">{interviewData.role}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <span className="text-xs text-indigo-500 font-medium">Employer/College</span>
                          <p className="font-medium text-gray-800 mt-1">{interviewData.employer || "—"}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <span className="text-xs text-indigo-500 font-medium">Client</span>
                          <p className="font-medium text-gray-800 mt-1">{interviewData.client || "—"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 shadow-sm backdrop-blur-md bg-opacity-90 transform transition-transform hover:scale-[1.02]">
                      <h5 className="text-sm font-medium text-indigo-900 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                        </svg>
                        Origin Details
                      </h5>
                      <div className="space-y-3 text-sm">
                        <div className="bg-gray-50 p-3 rounded-lg flex items-center">
                          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shadow-sm">
                            <span className="text-sm font-medium text-white">{interviewData.originCountry.charAt(0)}</span>
                          </div>
                          <div>
                            <span className="text-xs text-indigo-500 font-medium">Country</span>
                            <p className="font-medium text-gray-800 mt-1">{interviewData.originCountry}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 shadow-sm backdrop-blur-md bg-opacity-90 transform transition-transform hover:scale-[1.02]">
                      <h5 className="text-sm font-medium text-indigo-900 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Destination Details
                      </h5>
                      <div className="space-y-3 text-sm">
                        <div className="bg-gray-50 p-3 rounded-lg flex items-center">
                          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mr-3 shadow-sm">
                            <span className="text-sm font-medium text-white">{interviewData.destinationCountry.charAt(0)}</span>
                          </div>
                          <div>
                            <span className="text-xs text-indigo-500 font-medium">Country</span>
                            <p className="font-medium text-gray-800 mt-1">{interviewData.destinationCountry}</p>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <span className="text-xs text-indigo-500 font-medium">Visa Type</span>
                          <p className="font-medium text-gray-800 mt-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {interviewData.visaType}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Main conversation component - larger and more prominent */}
          {!showFeedback && (
            <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100">
              <div className="p-5 bg-gradient-to-r from-indigo-600 to-blue-500 flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-white">Visa Interview</h3>
                    <p className="text-blue-100">Speak naturally as if you're in an actual interview</p>
                  </div>
                </div>
                <div className="flex items-center bg-white/20 px-3 py-1.5 rounded-full text-white text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Available: <strong>{userMinutes.toLocaleString()}</strong> minutes</span>
                </div>
              </div>
              <div className="p-8">
                <Conversation interviewData={interviewData} apiKey={apikey} onViewFeedback={handleViewFeedback} />
              </div>
            </div>
          )}
          
          {/* Feedback Section - shown after interview completion */}
          {showFeedback && (
            <div className="animate-fadeIn">
              <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 mb-6">
                <div className="p-5 bg-gradient-to-r from-green-600 to-teal-500 flex items-center">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-xl font-semibold text-white">Interview Complete</h3>
                    <p className="text-green-100">Your interview lasted {formatTime(elapsedTime)}</p>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="mb-6 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Congratulations!</h2>
                    <p className="text-gray-600 max-w-xl mx-auto">
                      You've successfully completed your visa interview practice. Here's your feedback:
                    </p>
                  </div>
                  
                  {analysis && analysis.score && (
                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Interview Score</h3>
                        <div className="flex items-center">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            analysis.score >= 8 ? 'bg-green-100 text-green-800' : 
                            analysis.score >= 6 ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                          }`}>
                            <span className="text-lg font-bold">{analysis.score}/10</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {analysis.comment || 'Your interview responses have been analyzed. Review the feedback below for insights on your performance.'}
                      </p>
                    </div>
                  )}
                  
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <h4 className="text-md font-medium text-gray-900 flex items-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        What You Did Well
                      </h4>
                      <ul className="space-y-2">
                        {analysis && analysis.strengths && analysis.strengths.length > 0 ? (
                          analysis.strengths.map((strength: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              <span className="text-gray-700">{strength}</span>
                            </li>
                          ))
                        ) : (
                          <>
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              <span className="text-gray-700">Clear communication and articulation</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              <span className="text-gray-700">Good evidence of ties to home country</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              <span className="text-gray-700">Well-explained purpose of travel</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                    
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                      <h4 className="text-md font-medium text-gray-900 flex items-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        Areas to Improve
                      </h4>
                      <ul className="space-y-2">
                        {analysis && analysis.improvements && analysis.improvements.length > 0 ? (
                          analysis.improvements.map((improvement: string, index: number) => (
                            <li key={index} className="flex items-start">
                              <span className="text-yellow-500 mr-2">•</span>
                              <span className="text-gray-700">{improvement}</span>
                            </li>
                          ))
                        ) : (
                          <>
                            <li className="flex items-start">
                              <span className="text-yellow-500 mr-2">•</span>
                              <span className="text-gray-700">More specific details about business activities</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-yellow-500 mr-2">•</span>
                              <span className="text-gray-700">Better preparation for questions about previous travel</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-yellow-500 mr-2">•</span>
                              <span className="text-gray-700">More clarity on financial arrangements</span>
                            </li>
                          </>
                        )}
                      </ul>
                    </div>
                  </div>
                  
                  {analysis && analysis.specificFeedback && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm mb-8">
                      <h4 className="text-md font-medium text-gray-900 flex items-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        Try Saying It Like This
                      </h4>
                      <div className="space-y-4">
                        {analysis.try_saying_it_like_this ? (
                          <>
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="font-medium text-gray-800 mb-2 text-sm">Question:</p>
                              <p className="text-gray-600">{analysis.try_saying_it_like_this.question}</p>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-500">
                              <p className="font-medium text-gray-800 mb-2 text-sm">Suggested Response:</p>
                              <p className="text-gray-700">{analysis.try_saying_it_like_this.suggested_answer}</p>
                            </div>
                          </>
                        ) : (
                          <p className="text-gray-600">{analysis.specificFeedback || "Try to provide more specific and detailed responses to visa officer questions. Include relevant information about your travel plans, ties to your home country, and the purpose of your visit."}</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={handleReturnToDashboard}
                      className="px-6 py-3 rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:scale-105"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Add animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        
        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.4s ease-out forwards;
        }
      `}</style>
      
      {/* Add this to support small screens */}
      <style jsx global>{`
        @layer utilities {
          @variants responsive {
            .xs\\:flex-row {
              flex-direction: row;
            }
            .xs\\:space-y-0 {
              margin-top: 0;
            }
            .xs\\:space-x-4 > * + * {
              margin-left: 1rem;
            }
            .xs\\:w-auto {
              width: auto;
            }
          }
        }
        
        @media (min-width: 480px) {
          .xs\\:flex-row {
            flex-direction: row;
          }
          .xs\\:space-y-0 {
            margin-top: 0 !important;
          }
          .xs\\:space-x-4 > * + * {
            margin-left: 1rem;
          }
          .xs\\:w-auto {
            width: auto;
          }
        }
      `}</style>
    </div>
  );
} 