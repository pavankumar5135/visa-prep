'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Conversation } from '../../components/Conversation';
import { useAppSelector } from '../../store/hooks';
import HealthcareIntakeForm from '../../components/HealthcareIntakeForm';
import Header from '../../components/Header';
import { useSelector } from 'react-redux';
import { createClient } from '@/app/utils/supabase/client';
import { RootState } from '@/app/store';
import MinutesDisplay from '../../components/MinutesDisplay';
import { ConversationState } from '@/app/store/slices/conversationSlice';
import { fetchUserMinutes } from '@/app/utils/api/userApi';
import { store } from '@/app/store';
import React from 'react';

// Define a MinutesProvider component that ensures minutes are loaded
function MinutesProvider({ children, userId, agentId }: { children: React.ReactNode; userId: string; agentId: string }) {
  const [minutesLoaded, setMinutesLoaded] = useState(false);
  const [directMinutes, setDirectMinutes] = useState<number | null>(null);
  
  // Load minutes on mount
  useEffect(() => {
    const loadMinutes = async () => {
      if (!userId || !agentId) {
        console.error('MinutesProvider: Missing userId or agentId');
        setMinutesLoaded(true);
        return;
      }

      try {
        console.log(`MinutesProvider: Loading minutes for user ${userId} and agent ${agentId}`);
        const supabase = createClient();
        
        // Direct fetch from database - ALWAYS query with both user_id AND agent_id
        const { data, error } = await supabase
          .from('ai_agent_users')
          .select('purchase_units')
          .eq('user_id', userId)
          .eq('agent_id', agentId)
          .single();
        
        if (error) {
          console.error('MinutesProvider: Error fetching minutes:', error);
          setMinutesLoaded(true); // Still mark as loaded to avoid infinite loading
          return;
        }
        
        const minutes = data?.purchase_units || 0;
        console.log(`MinutesProvider: Found ${minutes} minutes for user ${userId} and agent ${agentId}`);
        
        // Set local state
        setDirectMinutes(minutes);
        
        // Also update Redux store
        store.dispatch({ 
          type: 'auth/updateUserMinutes', 
          payload: minutes 
        });
        
        // Mark as loaded
        setMinutesLoaded(true);
      } catch (err) {
        console.error('MinutesProvider: Exception while loading minutes:', err);
        setMinutesLoaded(true); // Still mark as loaded to avoid infinite loading
      }
    };
    
    if (userId && agentId) {
      loadMinutes();
    } else {
      console.warn('MinutesProvider: Missing userId or agentId, skipping minutes fetch');
      setMinutesLoaded(true);
    }
  }, [userId, agentId]);
  
  // If minutes aren't loaded yet, show a mini-loader just for minutes
  if (!minutesLoaded) {
    return (
      <div className="flex items-center justify-center h-6">
        <div className="animate-pulse bg-gray-200 h-4 w-16 rounded"></div>
      </div>
    );
  }
  
  // Replace Redux value with our direct value in the children
  return (
    <MinutesContext.Provider value={directMinutes}>
      {children}
    </MinutesContext.Provider>
  );
}

// Create a context for minutes
const MinutesContext = React.createContext<number | null>(null);

// Hook to use minutes
function useMinutes() {
  const context = React.useContext(MinutesContext);
  // Fall back to Redux if context is not available
  const reduxMinutes = useSelector((state: RootState) => state.auth.user?.minutes || 0);
  return context !== null ? context : reduxMinutes;
}

// Component to display minutes from the context
function MinutesValue({ agentId }: { agentId: string }) {
  const minutes = useMinutes();
  return (
    <strong>{minutes.toLocaleString()}</strong>
  );
}

// Define form data types for healthcare
interface HealthcareInterviewData {
  name: string;
  jobDescription: string;
  role: string;
  businessUnit: string;
  careSpeciality: string;
  yearsExperience: string;
  interviewType: string;
  employer: string;
  location: string;
}

// Add animation styles for the component
export const dynamic = 'force-dynamic';
export const dynamicParams = true;

export default function InterviewPage() {
  const [interviewData, setInterviewData] = useState<HealthcareInterviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsVisible, setIsDetailsVisible] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);
  
  // Add state for forcing minutes refresh
  const [forceRefreshMinutes, setForceRefreshMinutes] = useState<number>(0);
  
  // Modal states
  const [showBackConfirmModal, setShowBackConfirmModal] = useState(false);
  const [showReturnToDashboardModal, setShowReturnToDashboardModal] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
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
  const [editFormData, setEditFormData] = useState<HealthcareInterviewData | null>(null);
  
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
          router.push('/healthcare-interviews/dashboard');
          return;
        } else {
          setSupabaseUser(data.user);
          console.log('Authenticated user on interview page:', data.user);
          
          // Set authentication as checked - we'll fetch minutes in the MinutesProvider
          setAuthChecked(true);
        }
      } catch (err) {
        console.error('Authentication check error:', err);
        // On error, redirect to dashboard
        localStorage.setItem('authError', 'Authentication error. Please try again.');
        router.push('/healthcare-interviews/dashboard');
        return;
      }
    }
    
    checkAuth();
  }, [router]);
  
  // Load interview data
  useEffect(() => {
    // Only retrieve interview data if authenticated
    if (!authChecked) return;
    
    // Retrieve interview data from localStorage
    const storedData = localStorage.getItem('interviewData');
    
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setInterviewData(parsedData);
      } catch (error) {
        console.error('Failed to parse interview data:', error);
      }
    } else {
      // If no interview data, redirect back to dashboard
      console.log('No interview data found, redirecting to dashboard');
      router.push('/healthcare-interviews/dashboard');
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
    window.location.href = '/healthcare-interviews/dashboard';
  };
  
  const handleEditDetails = () => {
    // Show the edit form modal
    setShowEditForm(true);
  };
  
  // Function to handle form submission from HealthcareIntakeForm
  const handleEditFormSubmit = (formData: {
    name: string;
    jobDescription: string;
    role: string;
    businessUnit: string;
    careSpeciality: string;
    yearsExperience: string;
    employer: string;
    location: string;
  }) => {
    // Add the interviewType field
    const updatedFormData = {
      ...formData,
      interviewType: interviewData?.interviewType || "healthcare"
    };
    
    // Update the interview data in state and localStorage
    setInterviewData(updatedFormData as HealthcareInterviewData);
    localStorage.setItem('interviewData', JSON.stringify(updatedFormData));
    
    // Close the modal
    setShowEditForm(false);
  };
  
  // Function to handle form cancellation
  const handleEditFormCancel = () => {
    setShowEditForm(false);
  };
  
  const toggleDetails = () => {
    setIsDetailsVisible(!isDetailsVisible);
    
    // Force a reload of the minutes display
    // This works because we set a key with the current timestamp on the MinutesProvider
    setForceRefreshMinutes(Date.now());
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
  
  // Handle return to dashboard button click
  const handleReturnToDashboard = () => {
    setShowReturnToDashboardModal(true);
  };
  
  // Confirm return to dashboard
  const confirmReturnToDashboard = () => {
    setShowReturnToDashboardModal(false);
    setIsLoading(true);
    
    // Set a flag to disable auto-redirect when landing on dashboard
    localStorage.setItem('disableAutoRedirect', 'true');
    
    // Clear interview data
    localStorage.removeItem('interviewData');
    localStorage.removeItem('interviewCompleted');
    localStorage.removeItem('hasStartedInterview');
    
    // Navigate to dashboard
    window.location.href = '/healthcare-interviews/dashboard';
  };
  
  // Handle closing the auth popup
  const handleCloseAuthPopup = () => {
    setShowAuthPopup(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <Header 
        onAuthClick={() => setShowAuthPopup(true)} 
        title="Healthcare Interview Preparation"
        subtitle="Practice your healthcare interview skills with AI"
        type="healthcare"
      />
      
      {/* Main content */}
      <main className="flex-grow bg-gray-50">
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
          {interviewData && supabaseUser && (
            <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex items-center justify-between backdrop-blur-sm bg-opacity-90 border border-gray-100">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center mr-4 shadow-md">
                  <span className="text-lg font-bold text-white">{interviewData.name.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-lg">{interviewData.name}</h4>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mr-2">{interviewData.interviewType}</span>
                    <span>{interviewData.role}</span>
                    <span className="mx-2 text-gray-300">•</span>
                    <span>{interviewData.employer}</span>
                  </div>
                </div>
              </div>
              
              <div className="hidden md:flex space-x-2">
                {supabaseUser && (
                  <MinutesProvider 
                    userId={supabaseUser.id} 
                    agentId={process.env.NEXT_PUBLIC_SUPA_HEALTHCARE_INTERVIEW_AGENT_UUID || "healthcare_interview_agent_id"}
                    key={`compact-minutes-${forceRefreshMinutes}`}
                  >
                    <MinutesDisplay 
                      variant="compact" 
                      minutesContext={MinutesContext} 
                      agentId={process.env.NEXT_PUBLIC_SUPA_HEALTHCARE_INTERVIEW_AGENT_UUID || "healthcare_interview_agent_id"}
                      type="healthcare"
                    />
                  </MinutesProvider>
                )}
                <div className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {interviewData.location}
                </div>
              </div>
            </div>
          )}
          
          {/* Collapsible interview details */}
          {isDetailsVisible && interviewData && (
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
                          <span className="text-xs text-indigo-500 font-medium">Years Experience</span>
                          <p className="font-medium text-gray-800 mt-1">{interviewData.yearsExperience}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <span className="text-xs text-indigo-500 font-medium">Interview Type</span>
                          <p className="font-medium text-gray-800 mt-1">{interviewData.interviewType}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 shadow-sm backdrop-blur-md bg-opacity-90 transform transition-transform hover:scale-[1.02]">
                      <h5 className="text-sm font-medium text-indigo-900 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        Workplace Details
                      </h5>
                      <div className="space-y-3 text-sm">
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <span className="text-xs text-indigo-500 font-medium">Employer</span>
                          <p className="font-medium text-gray-800 mt-1">{interviewData.employer || "—"}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <span className="text-xs text-indigo-500 font-medium">Business Unit</span>
                          <p className="font-medium text-gray-800 mt-1">{interviewData.businessUnit || "—"}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <span className="text-xs text-indigo-500 font-medium">Location</span>
                          <p className="font-medium text-gray-800 mt-1">{interviewData.location || "—"}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-xl p-4 shadow-sm backdrop-blur-md bg-opacity-90 transform transition-transform hover:scale-[1.02]">
                      <h5 className="text-sm font-medium text-indigo-900 mb-3 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Healthcare Details
                      </h5>
                      <div className="space-y-3 text-sm">
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <span className="text-xs text-indigo-500 font-medium">Job Description</span>
                          <p className="font-medium text-gray-800 mt-1">{interviewData.jobDescription || "—"}</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded-lg">
                          <span className="text-xs text-indigo-500 font-medium">Care Speciality</span>
                          <p className="font-medium text-gray-800 mt-1">{interviewData.careSpeciality || "—"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
              <p className="text-gray-600">Loading interview...</p>
            </div>
          ) : (
            <>
              {/* Conversation component */}
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
                        <h3 className="text-xl font-semibold text-white">Healthcare Interview</h3>
                        <p className="text-blue-100">Speak naturally as if you're in an actual interview</p>
                      </div>
                    </div>
                    <div className="flex items-center bg-white/20 px-3 py-1.5 rounded-full text-white text-sm">
                      {supabaseUser ? (
                        <MinutesProvider 
                          userId={supabaseUser.id}
                          agentId={process.env.NEXT_PUBLIC_SUPA_HEALTHCARE_INTERVIEW_AGENT_UUID || "healthcare_interview_agent_id"}
                          key={`header-minutes-${forceRefreshMinutes}`}
                        >
                          <div className="flex items-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>Available: <MinutesValue agentId={process.env.NEXT_PUBLIC_SUPA_HEALTHCARE_INTERVIEW_AGENT_UUID || "healthcare_interview_agent_id"} /> minutes</span>
                          </div>
                        </MinutesProvider>
                      ) : (
                        <div className="animate-pulse bg-white/30 h-4 w-28 rounded"></div>
                      )}
                    </div>
                  </div>
                  <div className="p-8">
                    {interviewData && (
                      <Conversation
                        interviewData={interviewData}
                        apiKey={apikey}
                        onViewFeedback={handleViewFeedback}
                        userId={supabaseUser?.id}
                        type="healthcare"
                        supabaseAgentId={process.env.NEXT_PUBLIC_SUPA_HEALTHCARE_INTERVIEW_AGENT_UUID || "healthcare_interview_agent_id"}
                        elevenlabsAgentId={process.env.NEXT_PUBLIC_ELEVENLABS_HEALTHCARE_AGENT_UUID || "healthcare_elevenlabs_agent"}
                      />
                    )}
                  </div>
                </div>
              )}
            </>
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
                      You've successfully completed your healthcare interview practice. Here's your feedback:
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
                              <span className="text-gray-700">Clear communication and professionalism</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              <span className="text-gray-700">Strong knowledge of healthcare practices</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-green-500 mr-2">•</span>
                              <span className="text-gray-700">Well-explained experience and qualifications</span>
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
                              <span className="text-gray-700">More specific examples from past experience</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-yellow-500 mr-2">•</span>
                              <span className="text-gray-700">Better preparation for situational questions</span>
                            </li>
                            <li className="flex items-start">
                              <span className="text-yellow-500 mr-2">•</span>
                              <span className="text-gray-700">More focus on patient-centered care approaches</span>
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
                          <p className="text-gray-600">{analysis.specificFeedback || "Try to provide more specific examples from your healthcare experience, focusing on patient outcomes and your contribution to the healthcare team. Include specific metrics or quantifiable achievements when possible."}</p>
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
      </main>
      
      {/* Return to Dashboard Modal */}
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
          <HealthcareIntakeForm
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
    </div>
  );
} 