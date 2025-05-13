'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/client';
import HealthcareIntakeForm from '../../components/HealthcareIntakeForm';
import Header from '../../components/Header';
import { useAppDispatch } from '../../store/hooks';
import { setInterviewData } from '../../store/slices/conversationSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import MinutesDisplay from '../../components/MinutesDisplay';

// Define form data types
interface HealthcareIntakeFormData {
  name: string;
  jobDescription: string;
  role: string;
  businessUnit: string;
  careSpeciality: string;
  yearsExperience: string;
  employer: string;
  location: string;
}

// Create a content component that uses searchParams
function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<HealthcareIntakeFormData | null>(null);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();
  
  // Get first name from Redux store
  const userFirstName = useSelector((state: RootState) => state.auth.user?.firstName);
  const user = useSelector((state: RootState) => state.auth.user);
  const supabase = createClient();

  // Check for auth error messages in localStorage and URL params
  useEffect(() => {
    // Check localStorage first
    const errorMessage = localStorage.getItem('authError');
    if (errorMessage) {
      setAuthError(errorMessage);
      setShowAuthPopup(true);
      localStorage.removeItem('authError');
      return;
    }
    
    // Then check URL params (from middleware)
    const urlError = searchParams.get('auth_error');
    if (urlError) {
      setAuthError(urlError);
      setShowAuthPopup(true);
      
      // Remove the query parameter from the URL for cleaner UX
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('auth_error');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [searchParams]);

  // Check Supabase Authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        // Minimum loading time to prevent UI flashing
        const minLoadingPromise = new Promise(resolve => setTimeout(resolve, 800));
        
        const supabase = createClient();
        const authPromise = supabase.auth.getUser();
        
        // Wait for both the minimum loading time and the auth check
        const [_, { data, error }] = await Promise.all([minLoadingPromise, authPromise]);
        
        if (error || !data?.user) {
          console.log('User not authenticated, showing auth popup on page load');
          // No longer redirecting to login
          // Instead just set the user state to null and continue
        } else {
          setSupabaseUser(data.user);
          console.log('Authenticated user:', data.user);
        }
      } catch (err) {
        console.error('Authentication check error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);

  // Get display name (first name or fallback to email)
  const getDisplayName = () => {
    if (userFirstName) return userFirstName;
    if (supabaseUser?.email) return supabaseUser.email.split('@')[0];
    return 'User';
  };

  // Handle the "Start New Practice" button click
  const handleStartPractice = () => {
    // First check if user is authenticated
    if (!supabaseUser) {
      // User is not authenticated, show popup instead of redirecting
      console.log('User not authenticated, showing auth popup');
      // Show the auth popup
      setShowAuthPopup(true);
      return;
    }
    
    // User is authenticated, show the intake form
    setShowIntakeForm(true);
  };
  
  // Handle form submission
  const handleFormSubmit = (formData: HealthcareIntakeFormData) => {
    console.log('Form submitted:', formData);
    
    // Show loading state
    setIsSubmitting(true);
    
    // Store the form data in localStorage for the interview page to access
    localStorage.setItem('interviewData', JSON.stringify(formData));
    
    // Store data in Redux with correct type
    dispatch(setInterviewData({
      type: 'healthcare',
      data: {
        ...formData,
        interviewType: 'healthcare'
      }
    }));
    
    // Hide the form
    setShowIntakeForm(false);
    
    // Redirect to interview page
    setTimeout(() => {
      window.location.href = '/healthcare-interviews/interview';
    }, 100);
  };
  
  // Handle form cancellation
  const handleFormCancel = () => {
    setShowIntakeForm(false);
  };
  
  // Handle closing the auth popup
  const handleCloseAuthPopup = () => {
    setShowAuthPopup(false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Use the Header component */}
      <Header 
        onAuthClick={() => setShowAuthPopup(true)}
        title="Healthcare Interview Preparation" 
        subtitle="Practice your healthcare interview skills with AI"
        type="visa" 
      />

      {/* Main content */}
      <main className="flex-grow bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Healthcare Interview Dashboard</h2>
              <p className="mt-1 text-gray-600">
                Practice your healthcare interview skills with our AI assistant
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {supabaseUser && <MinutesDisplay type="healthcare" agentId={process.env.NEXT_PUBLIC_SUPA_HEALTHCARE_INTERVIEW_AGENT_UUID || "healthcare_interview_agent_id"} />}
              
              {supabaseUser && (
                <button
                  type="button"
                  onClick={handleStartPractice}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Start New Practice
                </button>
              )}
            </div>
          </div>
          
          {/* Welcome Card */}
          {supabaseUser && !showIntakeForm && !isSubmitting && (
            <div className="mt-8 bg-white shadow-lg rounded-xl p-8 text-center">
              <div className="mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-indigo-600 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Welcome, {getDisplayName()}!</h2>
              <p className="text-gray-600 mb-6">You're logged in. Click the button below to start a new healthcare interview practice.</p>
              
              <button
                onClick={handleStartPractice}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start Healthcare Interview Practice
              </button>
            </div>
          )}
          
          {/* Non-authenticated user section */}
          {!supabaseUser && !isLoading && (
            <div className="mt-8 bg-white shadow-lg rounded-xl p-8 text-center">
              <div className="mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m0 0v2m0-2h2m-2 0H9m3-3V7m0 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
              <p className="text-gray-600 mb-6">This application requires token-based authentication from the main application.</p>
              
              <button
                onClick={() => setShowAuthPopup(true)}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Token Authentication Info
              </button>
            </div>
          )}
        </div>
      </main>
      
      {/* Loading Overlay during submission */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity">
          <div className="bg-white rounded-xl p-8 max-w-md w-full text-center shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Preparing Interview...</h3>
            <p className="text-gray-600 mb-6">
              Setting up your practice session. You'll be redirected automatically in a moment.
            </p>
          </div>
        </div>
      )}

      {/* Intake Form Modal */}
      {showIntakeForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto transition-opacity">
          <div className="w-full max-w-4xl">
            <HealthcareIntakeForm 
              onSubmit={handleFormSubmit} 
              onCancel={handleFormCancel}
              initialData={formData || undefined}
              showNavLink={true}
              submitButtonText="Start AI Interview"
            />
          </div>
        </div>
      )}

      {/* Auth Popup Modal */}
      {showAuthPopup && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto transition-opacity">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-start mb-6">
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
            
            {authError ? (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
                <p>{authError}</p>
              </div>
            ) : null}
            
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                <strong>Authentication Required</strong> - This application only supports token-based authentication.
              </p>
              <p className="text-gray-600 mb-4">
                To use this application, you must access it through the main application that will provide the authentication token automatically.
              </p>
              <p className="text-sm text-gray-500">
                If you were redirected here from the main application but are seeing this message, please ensure you have an active session in the main application.
              </p>
            </div>
            
            <div className="flex justify-end">
              <button
                onClick={handleCloseAuthPopup}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Main component with Suspense boundary
export default function Dashboard() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-gray-600">Loading dashboard...</p>
      </div>
    }>
      <DashboardContent />
    </Suspense>
  );
} 