'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { setInterviewData } from '../store/slices/conversationSlice';
import IntakeForm from '../components/IntakeForm';
import AutoRedirect from '../redirect';

// Define types for API responses
interface InterviewFeedback {
  strengths: string[];
  improvements: string[];
  detailedFeedback: string;
}

interface InterviewHistoryItem {
  id: string;
  date: string;
  duration: string;
  status: string;
  score: number;
  feedback: InterviewFeedback;
}

// Define form data types - ensure it matches the type in conversationSlice
interface IntakeFormData {
  name: string;
  role: string;
  visaType: string;
  originCountry: string;
  destinationCountry: string;
  employer: string;
  client?: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('practice');
  const [interviewHistory, setInterviewHistory] = useState<InterviewHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedInterviewId, setExpandedInterviewId] = useState<string | null>(null);
  const [showIntakeForm, setShowIntakeForm] = useState(false);
  const [interviewData, setInterviewData] = useState<IntakeFormData | null>(null);
  const [showConversation, setShowConversation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showManualNavigation, setShowManualNavigation] = useState(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState(false);
  
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: { auth: any }) => state.auth);

  const apikey = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
  console.log(apikey,"apikey dashboard")
  
  // Effect to check URL parameters for edit mode
  useEffect(() => {
    // Check if we have edit=true in the URL
    const urlParams = new URLSearchParams(window.location.search);
    const editParam = urlParams.get('edit');
    
    if (editParam === 'true') {
      console.log('Edit param detected in URL, showing intake form');
      
      // Get the current interview data
      const storedData = localStorage.getItem('interviewData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setInterviewData(parsedData);
          
          // Force show the form
          setShowIntakeForm(true);
          
          // Make sure we're on the practice tab
          setActiveTab('practice');
          
          // Clear the loading state
          setIsSubmitting(false);
        } catch (error) {
          console.error('Failed to parse interview data from URL params:', error);
        }
      }
    }
  }, []);
  
  // Separate effect for the editInterviewData flag (keep this as a fallback)
  useEffect(() => {
    const editFlag = localStorage.getItem('editInterviewData');
    if (editFlag === 'true') {
      console.log('Edit flag detected in localStorage, showing intake form for editing');
      
      // Clear the edit flag
      localStorage.removeItem('editInterviewData');
      
      // Set a flag to temporarily disable auto-redirect
      localStorage.setItem('disableAutoRedirect', 'true');
      
      // Update the URL to include the edit=true parameter (no page reload)
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('edit', 'true');
      newUrl.searchParams.set('t', Date.now().toString());
      window.history.replaceState({}, '', newUrl.toString());
      
      // Get the current interview data
      const storedData = localStorage.getItem('interviewData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          setInterviewData(parsedData);
          
          // Make sure the form is shown (this is the key part for direct editing)
          setShowIntakeForm(true);
          
          // Also ensure we're on the practice tab
          setActiveTab('practice');
        } catch (error) {
          console.error('Failed to parse interview data for editing:', error);
        }
      }
    }
  }, []);
  
  // Effect to determine if user is returning from a completed interview
  useEffect(() => {
    const completedFlag = localStorage.getItem('completedInterview');
    if (completedFlag === 'true') {
      setShowWelcomeBack(true);
      // Clear the flag after 5 seconds
      setTimeout(() => {
        setShowWelcomeBack(false);
        localStorage.removeItem('completedInterview');
      }, 5000);
    }
  }, []);
  
  // Effect to ensure loading state doesn't persist too long
  useEffect(() => {
    // If the submitting state is active, set a failsafe timeout
    if (isSubmitting) {
      const timeoutId = setTimeout(() => {
        console.log('Failsafe: Clearing submitting state after timeout');
        setIsSubmitting(false);
      }, 5000); // 5 seconds maximum loading time
      
      return () => clearTimeout(timeoutId);
    }
  }, [isSubmitting]);
  
  // Effect to clear flags and prevent redirect loops
  useEffect(() => {
    // Check URL parameters first
    const urlParams = new URLSearchParams(window.location.search);
    const isEditMode = urlParams.get('edit') === 'true';
    
    // If we're in edit mode from URL, don't clear interview data
    if (isEditMode) {
      console.log('Edit mode detected in URL, preserving interview data');
      
      // Just clear the disableAutoRedirect flag after a delay
      const timer = setTimeout(() => {
        localStorage.removeItem('disableAutoRedirect');
      }, 3000);
      
      return () => clearTimeout(timer);
    }
    
    // Check if we're coming from the interview page with disableAutoRedirect flag
    // but aren't in edit mode
    if (localStorage.getItem('disableAutoRedirect') === 'true' && !isEditMode) {
      console.log('Clearing interview data on dashboard load (not in edit mode)');
      
      // Clear all interview related data to prevent redirect loop
      localStorage.removeItem('interviewData');
      localStorage.removeItem('hasStartedInterview');
      localStorage.removeItem('interviewCompleted');

      // Also remove the disableAutoRedirect flag
      localStorage.removeItem('disableAutoRedirect');
      
      // Ensure any loading overlay is hidden
      setIsSubmitting(false);
    } else {
      // If not coming from interview page, just clear the flag after a delay
      const timer = setTimeout(() => {
        localStorage.removeItem('disableAutoRedirect');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Handle starting a completely new practice (clearing any existing data)
  const handleStartNewPractice = () => {
    // Clear all interview related data
    localStorage.removeItem('interviewData');
    localStorage.removeItem('editInterviewData');
    localStorage.removeItem('disableAutoRedirect');
    localStorage.removeItem('interviewCompleted');
    localStorage.removeItem('completedInterview');
    localStorage.removeItem('hasStartedInterview');
    
    // Reset state
    setInterviewData(null);
    
    // Show the form
    setShowIntakeForm(true);
  };
  
  // Handle the "Start New Practice" button click
  const handleStartPractice = () => {
    // If we have completed an interview previously, start fresh
    if (localStorage.getItem('completedInterview') === 'true' || 
        localStorage.getItem('interviewCompleted') === 'true') {
      handleStartNewPractice();
    } else {
      // Otherwise just show the form with any existing data
      setShowIntakeForm(true);
    }
  };

  // Determine if we're in edit mode
  const isEditMode = () => {
    return interviewData !== null;
  };

  // Handle intake form submission
  const handleFormSubmit = (formData: IntakeFormData) => {
    console.log('Form submitted:', formData);
    
    // Show submitting state
    setIsSubmitting(true);
    
    // Store the form data in localStorage for the interview page to access
    localStorage.setItem('interviewData', JSON.stringify(formData));
    
    // Clear any flags that might prevent redirection
    localStorage.removeItem('disableAutoRedirect');
    localStorage.removeItem('editInterviewData');
    
    // Hide the form
    setShowIntakeForm(false);
    
    // Determine what navigation approach to use based on edit mode
    if (isEditMode()) {
      console.log('Returning to interview after editing');
      // When in edit mode, use a simpler, more direct approach
      window.location.href = '/interview';
    } else {
      // For new form submissions, use the more robust approach
      console.log('Dashboard direct navigation to interview page');
      
      // Small delay to ensure localStorage is set
      setTimeout(() => {
        // The most direct and reliable navigation method
        window.location.href = '/interview';
      }, 100);
      
      // Show manual navigation button if we're still here after 3 seconds
      setTimeout(() => {
        if (window.location.pathname !== '/interview') {
          setShowManualNavigation(true);
        }
      }, 3000);
    }
  };

  // Direct navigation handler for manual button
  const handleManualNavigation = () => {
    window.location.href = '/interview';
  };

  // Handle intake form cancellation
  const handleFormCancel = () => {
    setShowIntakeForm(false);
  };

  // Fetch interview history from Eleven Labs API
  const fetchInterviewHistory = async () => {
    if (activeTab === 'history') {
      setIsLoading(true);
      setError(null);
      
      try {
        // Replace with your actual API endpoint for Eleven Labs
        const response = await fetch('https://api.elevenlabs.io/v1/history/interviews', {
          headers: {
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVEN_LABS_API_KEY || '',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Error fetching interview history: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Transform the API response to match our interface
        // This transformation will depend on the actual API response structure
        const formattedHistory: InterviewHistoryItem[] = data.map((item: any) => ({
          id: item.id,
          date: item.created_at || new Date().toISOString(),
          duration: `${Math.round(item.duration / 60)} minutes`,
          status: item.status || 'Completed',
          score: item.score || calculateRandomScore(),
          feedback: {
            strengths: item.feedback?.strengths || generateDefaultStrengths(),
            improvements: item.feedback?.improvements || generateDefaultImprovements(),
            detailedFeedback: item.feedback?.detailed || generateDefaultFeedback(),
          }
        }));
        
        setInterviewHistory(formattedHistory);
      } catch (err) {
        console.error('Failed to fetch interview history:', err);
        setError('Failed to load interview history. Please try again later.');
        
        // Fallback to demo data if API fails
        setInterviewHistory(generateDemoHistory());
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Use effect to fetch interview history when tab changes
  useEffect(() => {
    fetchInterviewHistory();
  }, [activeTab]);
  
  // Toggle detailed view of an interview
  const toggleInterviewDetails = (id: string) => {
    if (expandedInterviewId === id) {
      setExpandedInterviewId(null);
    } else {
      setExpandedInterviewId(id);
    }
  };
  
  // Helper functions for fallback/demo data
  const calculateRandomScore = () => Math.floor(65 + Math.random() * 30);
  
  const generateDefaultStrengths = () => {
    const strengths = [
      'Clear explanation of business purpose',
      'Strong evidence of ties to home country',
      'Consistent responses throughout the interview',
      'Good knowledge of visa regulations',
      'Professional communication style'
    ];
    
    // Return 2-3 random strengths
    return strengths
      .sort(() => 0.5 - Math.random())
      .slice(0, 2 + Math.floor(Math.random() * 2));
  };
  
  const generateDefaultImprovements = () => {
    const improvements = [
      'Provide more specific details about planned meetings',
      'Better articulation of return plans after the visit',
      'Need stronger evidence of ties to home country',
      'More clarity on financial arrangements for the trip',
      'Better preparation for questions about previous travel'
    ];
    
    // Return 2-3 random improvement areas
    return improvements
      .sort(() => 0.5 - Math.random())
      .slice(0, 2 + Math.floor(Math.random() * 2));
  };
  
  const generateDefaultFeedback = () => {
    return "This is automated feedback based on your interview performance. To receive detailed personalized feedback, please upgrade to our premium plan.";
  };
  
  const generateDemoHistory = (): InterviewHistoryItem[] => {
    return [
      {
        id: '1',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        duration: '12 minutes',
        status: 'Completed',
        score: 85,
        feedback: {
          strengths: [
            'Clear explanation of business purpose',
            'Strong evidence of ties to home country',
            'Consistent responses throughout the interview'
          ],
          improvements: [
            'Provide more specific details about planned meetings',
            'Better articulation of return plans after the visit'
          ],
          detailedFeedback: "You demonstrated confidence and clarity when explaining your business purpose for visiting the US. Your responses about your company and role were detailed and convincing. Your explanation of ties to your home country was well-articulated, mentioning family, property, and ongoing projects. Areas to improve include providing more specific details about your planned business activities and being more precise about your return plans. Overall, your interview performance was strong and indicates good preparation."
        }
      },
      {
        id: '2',
        date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
        duration: '15 minutes',
        status: 'Completed',
        score: 72,
        feedback: {
          strengths: [
            'Good knowledge of visa regulations',
            'Clear communication style'
          ],
          improvements: [
            'Need stronger evidence of ties to home country',
            'More clarity on financial arrangements for the trip',
            'Better preparation for questions about previous travel'
          ],
          detailedFeedback: "You showed good understanding of B1 visa regulations and requirements. Your communication was generally clear, though at times hesitant. The interviewer noted concerns about your ties to your home country - consider emphasizing family commitments, property ownership, or career responsibilities more strongly. Your responses about financing the trip lacked specific details, which raised questions. Your explanation of previous travel history seemed unprepared, with inconsistencies that could raise red flags. Work on providing more concrete evidence of your intention to return to your home country after your temporary visit."
        }
      }
    ];
  };

  // Check if we're in edit mode from URL parameters
  const isUrlEditMode = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get('edit') === 'true';
    }
    return false;
  };
  
  // Combined check for any type of edit mode
  const shouldShowIntakeForm = showIntakeForm || isUrlEditMode();

  return (
    <div className="space-y-6 sm:space-y-8 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
      {/* Auto-redirect if interview data is found */}
      <AutoRedirect />
      
      {/* Welcome back message after completing interview */}
      {showWelcomeBack && (
        <div className="bg-green-50 border-l-4 border-green-400 p-3 sm:p-4 mt-4 rounded-md animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center">
            <div className="flex-shrink-0 mb-2 sm:mb-0">
              <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="sm:ml-3">
              <p className="text-sm text-green-700">
                <strong>Great job!</strong> You've completed your practice interview. 
                <button 
                  onClick={handleStartNewPractice}
                  className="ml-2 font-medium text-green-700 underline"
                >
                  Start another practice?
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div className="py-3 sm:py-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Visa Interview Practice</h1>
          <p className="mt-1 text-sm sm:text-base text-gray-600 max-w-2xl">
            Practice your interview skills with our AI assistant and get real-time feedback.
          </p>
        </div>
        <button
          type="button"
          onClick={handleStartPractice}
          className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-transparent rounded-md shadow-sm text-xs sm:text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Start New Practice
        </button>
      </div>

      {/* Loading Overlay during submission */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity animate-fadeIn">
          <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 max-w-md w-full mx-2 text-center animate-slideIn shadow-2xl">
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-blue-600"></div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Preparing Interview...</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Setting up your practice session. You'll be redirected automatically in a moment.
            </p>
            
            {showManualNavigation && (
              <div className="mt-4 animate-fadeIn">
                <p className="text-yellow-600 mb-3 text-sm sm:text-base">
                  Automatic redirection seems slow. Try the button below:
                </p>
                <button
                  onClick={handleManualNavigation}
                  className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-transparent rounded-md shadow-sm text-xs sm:text-base font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Go to Interview Page
                </button>
                
                <div className="mt-4 text-xs sm:text-sm text-gray-500">
                  <a href="/interview" className="underline hover:text-blue-600">
                    Direct link to interview page
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Intake Form Modal */}
      {shouldShowIntakeForm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto transition-opacity animate-fadeIn">
          <div className="w-full max-w-4xl animate-slideIn">
            <IntakeForm 
              onSubmit={handleFormSubmit} 
              onCancel={handleFormCancel}
              initialData={interviewData}
              showNavLink={true}
              submitButtonText={isEditMode() ? "Save Changes" : "Start AI Interview"}
            />
          </div>
        </div>
      )}

      {/* Tabs */}
      <div>
        <div className="sm:hidden">
          <label htmlFor="tabs" className="sr-only">Select a tab</label>
          <select
            id="tabs"
            name="tabs"
            className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            value={activeTab}
            onChange={(e) => setActiveTab(e.target.value)}
          >
            <option value="practice">Practice</option>
            <option value="history">History</option>
            <option value="resources">Resources</option>
          </select>
        </div>
        <div className="hidden sm:block">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('practice')}
                className={`${
                  activeTab === 'practice'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${activeTab === 'practice' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                Practice
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${activeTab === 'history' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`${
                  activeTab === 'resources'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center transition-all`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${activeTab === 'resources' ? 'text-blue-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Resources
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Tab content container with shadow */}
      <div className="mt-8 overflow-hidden">
        {activeTab === 'practice' && (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden"> 
            <div className="flex flex-col items-center py-16 px-6 text-center">
              <div className="rounded-full bg-blue-100 p-5 mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Ready to practice your interview?</h3>
              <p className="text-gray-600 max-w-md mb-8">
                Our AI-powered visa officer will guide you through a realistic interview experience and provide personalized feedback to help you improve.
              </p>
              <button
                onClick={handleStartPractice}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Start New Interview
              </button>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Interview History</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Track your progress and review feedback from past sessions.</p>
              </div>
            </div>
              {isLoading ? (
                <div className="px-4 py-12 text-center">
                <svg className="animate-spin h-10 w-10 text-blue-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-gray-500">Loading interview history...</p>
              </div>
            ) : error ? (
              <div className="px-4 py-8 text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-sm text-red-500 mb-4">{error}</p>
                  <button
                    onClick={fetchInterviewHistory}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                  Try Again
                  </button>
                </div>
              ) : interviewHistory.length === 0 ? (
                <div className="px-4 py-12 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-4">No interview history found.</p>
                  <button
                    onClick={() => setActiveTab('practice')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                  Complete Your First Interview
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                {interviewHistory.map(interview => (
                  <div key={interview.id} className="hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => toggleInterviewDetails(interview.id)}>
                    <div className="p-6">
                      <div className="md:flex md:justify-between md:items-center">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center mr-4 ${
                            interview.score >= 80 ? 'bg-green-100' : 
                            interview.score >= 70 ? 'bg-yellow-100' : 
                            'bg-red-100'
                          }`}>
                            <span className={`text-sm font-medium ${
                              interview.score >= 80 ? 'text-green-800' : 
                              interview.score >= 70 ? 'text-yellow-800' : 
                              'text-red-800'
                            }`}>{interview.score}%</span>
                    </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {new Date(interview.date).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric', 
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                            <p className="flex items-center text-sm text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {interview.duration}
                            </p>
            </div>
          </div>
                        
                        <div className="mt-4 md:mt-0 flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            interview.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {interview.status}
                          </span>
                          <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ml-2 text-gray-400 transform transition-transform ${expandedInterviewId === interview.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
              
                    {expandedInterviewId === interview.id && (
                      <div className="bg-blue-50 p-6 space-y-6 animate-fadeIn">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="text-sm font-medium text-gray-900 flex items-center mb-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Strengths
                            </h4>
                  <ul className="space-y-2">
                              {interview.feedback.strengths.map((strength, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="inline-block h-5 w-5 flex-shrink-0 text-green-500">•</span>
                                  <span className="ml-2 text-sm text-gray-600">{strength}</span>
                    </li>
                              ))}
                  </ul>
                </div>
                
                          <div className="bg-white p-4 rounded-lg shadow-sm">
                            <h4 className="text-sm font-medium text-gray-900 flex items-center mb-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                              </svg>
                              Areas for Improvement
                            </h4>
                            <ul className="space-y-2">
                              {interview.feedback.improvements.map((improvement, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="inline-block h-5 w-5 flex-shrink-0 text-yellow-500">•</span>
                                  <span className="ml-2 text-sm text-gray-600">{improvement}</span>
                                </li>
                              ))}
                            </ul>
                </div>
              </div>
              
                        <div className="bg-white p-4 rounded-lg shadow-sm">
                          <h4 className="text-sm font-medium text-gray-900 flex items-center mb-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            Detailed Feedback
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {interview.feedback.detailedFeedback}
                          </p>
                  </div>
                  </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="bg-white shadow-lg rounded-xl overflow-hidden">
            <div className="px-6 py-6 border-b border-gray-200 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">B1 Visa Resources</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Helpful information for your visa preparation.</p>
                      </div>
                    </div>
            <div className="p-6">
              <div className="grid gap-6 md:grid-cols-2">
                {[
                  {
                    title: "Common Interview Questions",
                    description: "Prepare with a list of frequently asked questions in B1 visa interviews.",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )
                  },
                  {
                    title: "Documentation Checklist",
                    description: "Ensure you have all required documents for your visa application and interview.",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    )
                  },
                  {
                    title: "Visa Approval Tips",
                    description: "Expert advice on increasing your chances of visa approval.",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )
                  },
                  {
                    title: "Travel Regulations",
                    description: "Current regulations and restrictions for business travel to the US.",
                    icon: (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )
                  }
                ].map((resource, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 bg-blue-50 rounded-full p-3">
                          {resource.icon}
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">{resource.title}</h4>
                          <p className="mt-1 text-sm text-gray-500">{resource.description}</p>
                    </div>
                  </div>
                      <div className="mt-4 flex justify-end">
                        <a href="#" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                          View resource
                          <svg xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 