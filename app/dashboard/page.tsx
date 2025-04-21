'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Conversation } from '../components/Conversation';

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

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('prepare');
  const [showInterview, setShowInterview] = useState(false);
  const [interviewHistory, setInterviewHistory] = useState<InterviewHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedInterview, setExpandedInterview] = useState<string | null>(null);
  
  // Fetch interview history from Eleven Labs API
  useEffect(() => {
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
    
    fetchInterviewHistory();
  }, [activeTab]);
  
  // Toggle detailed view of an interview
  const toggleInterviewDetails = (id: string) => {
    if (expandedInterview === id) {
      setExpandedInterview(null);
    } else {
      setExpandedInterview(id);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Updated with improved design */}
      <header className="bg-white shadow-sm py-4 sticky top-0 z-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="text-xl font-bold text-gray-800">B1 Visa Prep</span>
            </Link>
            
            <div className="flex items-center space-x-2 md:space-x-6">
              <div className="relative group">
                <button className="flex items-center text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg py-1 z-20 hidden group-hover:block">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-800">Notifications</p>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    <div className="px-4 py-2 hover:bg-gray-50">
                      <p className="text-sm text-gray-700">Your last interview was 2 days ago. Ready for another practice session?</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-800">John Doe</p>
                  <p className="text-xs text-gray-500">Premium Plan</p>
                </div>
                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white flex items-center justify-center font-medium cursor-pointer">
                  JD
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Updated with improved layout */}
      <main className="container mx-auto px-4 md:px-6 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Left Sidebar - New component */}
          <aside className="md:w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <h2 className="font-medium">B1 Visa Interview Prep</h2>
                <p className="text-sm text-blue-100 mt-1">Practice makes perfect</p>
              </div>
              
              <nav className="p-2">
                <button 
                  onClick={() => setActiveTab('prepare')} 
                  className={`w-full flex items-center p-3 rounded-md text-left ${activeTab === 'prepare' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span>Practice</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('history')} 
                  className={`w-full flex items-center p-3 rounded-md text-left ${activeTab === 'history' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>History</span>
                </button>
                
                <button 
                  onClick={() => setActiveTab('resources')} 
                  className={`w-full flex items-center p-3 rounded-md text-left ${activeTab === 'resources' ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span>Resources</span>
                </button>
                
                <button 
                  className="w-full flex items-center p-3 rounded-md text-left text-gray-700 hover:bg-gray-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Settings</span>
                </button>
                
                <div className="mt-6 border-t border-gray-100 pt-4">
                  <div className="px-3">
                    <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Subscription</h3>
                    <div className="mt-2 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Premium Plan</p>
                        <p className="text-xs text-gray-500">Renews on May 21, 2025</p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">Active</span>
                    </div>
                  </div>
                </div>
              </nav>
            </div>
          </aside>

          {/* Right Content Area - improved structure */}
          <div className="flex-1">
            {/* Breadcrumbs - New component */}
            <div className="mb-6">
              <nav className="flex" aria-label="Breadcrumb">
                <ol className="inline-flex items-center space-x-1 md:space-x-3">
                  <li className="inline-flex items-center">
                    <button 
                      onClick={() => setActiveTab('prepare')} 
                      className="text-gray-500 text-sm hover:text-gray-700 cursor-pointer"
                    >
                      Dashboard
                    </button>
                  </li>
                  <li>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                      </svg>
                      <button 
                        onClick={() => setActiveTab(activeTab)} 
                        className="ml-1 text-sm font-medium text-blue-600 cursor-pointer"
                      >
                        {activeTab === 'prepare' ? 'Practice' : activeTab === 'history' ? 'History' : 'Resources'}
                      </button>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>

            {/* Practice Tab - Improved UI */}
            {activeTab === 'prepare' && (
              <div className="space-y-6">
                {showInterview ? (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                      <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                        <span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>
                        Live Interview Session
                      </h2>
                      <button 
                        onClick={() => setShowInterview(false)}
                        className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="p-6 bg-blue-50 border-b border-blue-100">
                      <div className="flex items-start mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center text-white">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                        <div className="ml-4">
                          <h3 className="font-medium text-gray-800">Consular Officer</h3>
                          <p className="text-gray-600 text-sm mt-1">
                            I'll be asking you questions about your B1 visa application. Speak clearly and provide complete answers. 
                            Remember to demonstrate your ties to your home country and be specific about your purpose of travel.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="bg-gray-50 p-4 rounded-lg mb-6">
                        <div className="flex items-center text-blue-600 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <h3 className="font-medium">Instructions</h3>
                        </div>
                        <ul className="text-sm text-gray-600 space-y-1 ml-7">
                          <li className="list-disc">Speak clearly into your microphone</li>
                          <li className="list-disc">Answer questions thoroughly but concisely</li>
                          <li className="list-disc">Be prepared to address topics like: purpose of visit, ties to home country, financial situation, and duration of stay</li>
                          <li className="list-disc">You can end the interview at any time by clicking the "End Interview" button</li>
                        </ul>
                      </div>
                      
                      <div className="rounded-lg border border-blue-100">
                        <Conversation />
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Dashboard overview - New section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Total Practice Sessions</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">12</p>
                          </div>
                          <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="inline-flex items-center text-sm text-green-600">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                            <span>25% more than average</span>
                          </span>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Average Score</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">82%</p>
                          </div>
                          <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                        <div className="flex justify-between">
                          <div>
                            <p className="text-sm text-gray-500">Last Practice</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">2 days ago</p>
                          </div>
                          <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className="inline-flex items-center text-sm text-blue-600 cursor-pointer">
                            <span>View details</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">Practice Interviews</h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-start">
                            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <h2 className="text-xl font-semibold text-gray-800 mb-2">Standard B1 Interview</h2>
                              <p className="text-gray-600 mb-4">Practice with a standard B1 visa interview scenario. This includes common questions about your travel purpose, duration, and ties to home country.</p>
                              <button 
                                onClick={() => setShowInterview(true)}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Start Interview
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-2 border-t border-gray-100">
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Duration: ~15 minutes</span>
                            <span>Recommended</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-6">
                          <div className="flex items-start">
                            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            </div>
                            <div className="ml-4">
                              <h2 className="text-xl font-semibold text-gray-800 mb-2">Challenging Interview</h2>
                              <p className="text-gray-600 mb-4">A more difficult scenario where the consular officer has concerns about your application. Practice handling tough questions and overcoming objections.</p>
                              <button 
                                onClick={() => setShowInterview(true)}
                                className="inline-flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors cursor-pointer"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Start Interview
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-6 py-2 border-t border-gray-100">
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>Duration: ~20 minutes</span>
                            <span>Advanced</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <h2 className="text-xl font-bold text-gray-800 mb-4">Improve Your Skills</h2>
                      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                        <h3 className="font-medium text-gray-800 mb-3">Top Interview Tips</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-600">Speak clearly and confidently, maintaining good eye contact</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-600">Be specific about your travel plans and purpose of visit</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-600">Demonstrate strong ties to your home country (family, job, property)</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-600">Prepare documentation that supports your statements</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-gray-600">Answer questions directly and honestly without volunteering unnecessary information</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* History Tab - Improved UI */}
            {activeTab === 'history' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">Interview History</h1>
                  <div className="flex space-x-2">
                    <button className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                      </svg>
                      Filter
                    </button>
                    <button className="inline-flex items-center px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export
                    </button>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="bg-white rounded-lg shadow-sm p-8 flex justify-center items-center">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p className="text-gray-600">Loading your interview history...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="bg-white rounded-lg shadow-sm p-8">
                    <div className="flex items-center text-red-500 mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h2 className="font-semibold">Error</h2>
                    </div>
                    <p className="text-gray-700 mb-4">{error}</p>
                    <button 
                      onClick={() => setActiveTab('history')} 
                      className="text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                    >
                      Try Again
                    </button>
                  </div>
                ) : interviewHistory.length > 0 ? (
                  <>
                    {/* Analytics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-500">Total Interviews</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">{interviewHistory.length}</p>
                          </div>
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-500">Average Score</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                              {Math.round(interviewHistory.reduce((sum, interview) => sum + interview.score, 0) / interviewHistory.length)}%
                            </p>
                          </div>
                          <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-gray-500">Last Interview</p>
                            <p className="text-2xl font-bold text-gray-800 mt-1">
                              {new Date(interviewHistory[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                          <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Progress Chart */}
                    <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 mb-8">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Score Progression</h2>
                      <div className="relative h-36">
                        <div className="absolute inset-0 flex items-end">
                          {interviewHistory.map((interview, index) => (
                            <div 
                              key={interview.id} 
                              className="w-1/5 h-full flex flex-col justify-end items-center px-1"
                            >
                              <div 
                                className={`w-full rounded-t ${interview.score >= 80 ? 'bg-green-500' : interview.score >= 65 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                style={{ height: `${interview.score}%` }}
                              ></div>
                              <div className="text-xs text-gray-500 mt-1 text-center">
                                {new Date(interview.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  
                    {/* Interview List */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-800">Recent Mock Interviews</h2>
                        <span className="text-sm text-gray-500">Results saved for 30 days</span>
                      </div>
                      
                      <div className="divide-y divide-gray-100">
                        {interviewHistory.map((interview) => (
                          <div key={interview.id} className="group">
                            <div 
                              className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => toggleInterviewDetails(interview.id)}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center">
                                  <div className={`w-1.5 h-12 rounded-r ${interview.score >= 80 ? 'bg-green-500' : interview.score >= 65 ? 'bg-yellow-500' : 'bg-red-500'} mr-4`}></div>
                                  <div>
                                    <div className="flex items-center">
                                      <h3 className="font-medium text-gray-800">Interview on {new Date(interview.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h3>
                                      <span className={`ml-3 px-2 py-0.5 rounded text-xs font-medium ${interview.score >= 80 ? 'bg-green-100 text-green-800' : interview.score >= 65 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                        {interview.score >= 80 ? 'Excellent' : interview.score >= 65 ? 'Good' : 'Needs Improvement'}
                                      </span>
                                    </div>
                                    <div className="flex items-center mt-1 text-sm text-gray-500">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Duration: {interview.duration}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <div className="mr-6">
                                    <div className="text-sm font-medium text-gray-800">Score</div>
                                    <div className={`text-xl font-bold ${interview.score >= 80 ? 'text-green-600' : interview.score >= 65 ? 'text-yellow-600' : 'text-red-600'}`}>
                                      {interview.score}
                                    </div>
                                  </div>
                                  <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    className={`h-5 w-5 text-gray-400 transform transition-transform duration-200 ${expandedInterview === interview.id ? 'rotate-180' : ''} group-hover:text-gray-600`} 
                                    viewBox="0 0 20 20" 
                                    fill="currentColor"
                                  >
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                            </div>
                            
                            {/* Expanded Interview Details - Enhanced UI */}
                            {expandedInterview === interview.id && (
                              <div className="p-5 bg-gray-50 border-t border-gray-100">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                      </svg>
                                      Strengths
                                    </h4>
                                    <ul className="space-y-2">
                                      {interview.feedback.strengths.map((strength, index) => (
                                        <li key={index} className="flex items-start">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                          </svg>
                                          <span className="text-gray-700">{strength}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                  
                                  <div>
                                    <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                      </svg>
                                      Areas for Improvement
                                    </h4>
                                    <ul className="space-y-2">
                                      {interview.feedback.improvements.map((improvement, index) => (
                                        <li key={index} className="flex items-start">
                                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                          </svg>
                                          <span className="text-gray-700">{improvement}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>
                                
                                <div className="mt-6">
                                  <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    Detailed Feedback
                                  </h4>
                                  <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <p className="text-gray-700 whitespace-pre-line">{interview.feedback.detailedFeedback}</p>
                                  </div>
                                </div>
                                
                                <div className="mt-6 flex justify-end">
                                  <button 
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                                    onClick={() => {setActiveTab('prepare'); setShowInterview(true);}}
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                    </svg>
                                    Practice Again
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                    <div className="p-4 border-b border-gray-100">
                      <h2 className="font-semibold text-gray-800">Recent Mock Interviews</h2>
                    </div>
                    <div className="p-8">
                      <div className="text-center py-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                        </svg>
                        <p className="text-gray-500 mb-4">You haven't taken any mock interviews yet.</p>
                        <button 
                          onClick={() => {setActiveTab('prepare'); setShowInterview(true);}}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                          Start Your First Interview
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Resources Tab - Improved UI */}
            {activeTab === 'resources' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">B1 Visa Resources</h1>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search resources"
                      className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                
                {/* Resource Categories */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                  <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Official Documentation</h2>
                    <p className="text-gray-600 mb-4">Access official U.S. government resources about B1 business visitor visas.</p>
                    <a 
                      href="https://travel.state.gov/content/travel/en/us-visas/tourism-visit/visitor.html" 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center cursor-pointer"
                    >
                      View Resources
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">FAQs</h2>
                    <p className="text-gray-600 mb-4">Common questions and answers about the B1 visa application and interview process.</p>
                    <button 
                      className="text-purple-600 hover:text-purple-800 font-medium inline-flex items-center cursor-pointer"
                    >
                      View FAQs
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-5 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-2">Document Checklist</h2>
                    <p className="text-gray-600 mb-4">Ensure you have all required documents for your B1 visa interview.</p>
                    <button 
                      className="text-green-600 hover:text-green-800 font-medium inline-flex items-center cursor-pointer"
                    >
                      View Checklist
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Common Interview Questions */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden mb-8">
                  <div className="p-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-800">Common B1 Visa Interview Questions</h2>
                  </div>
                  
                  <div className="divide-y divide-gray-100">
                    {/* Question Category 1 */}
                    <div className="p-5">
                      <div className="mb-4">
                        <h3 className="font-medium text-gray-800 flex items-center">
                          <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center mr-2 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          Purpose of Visit
                        </h3>
                      </div>
                      
                      <div className="space-y-4 ml-8">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-800 mb-2">What is the purpose of your visit to the United States?</p>
                          <div className="text-gray-600 text-sm">
                            <p className="mb-2">This is one of the most crucial questions. Be specific and clear about your business purpose. For example:</p>
                            <div className="bg-white p-2 rounded border border-gray-200 italic">
                              "I'm visiting to attend the annual tech conference in San Francisco where my company is presenting our new software product. I'll be meeting with potential clients and partners during this three-day event."
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-800 mb-2">How long do you plan to stay in the United States?</p>
                          <div className="text-gray-600 text-sm">
                            <p className="mb-2">Be specific with dates and make sure it aligns with your stated purpose.</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-800 mb-2">What specific business activities will you engage in during your visit?</p>
                          <div className="text-gray-600 text-sm">
                            <p className="mb-2">Provide specific details about meetings, conferences, or activities.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Question Category 2 */}
                    <div className="p-5">
                      <div className="mb-4">
                        <h3 className="font-medium text-gray-800 flex items-center">
                          <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center mr-2 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                          </div>
                          Ties to Home Country
                        </h3>
                      </div>
                      
                      <div className="space-y-4 ml-8">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-800 mb-2">What ties do you have to your home country?</p>
                          <div className="text-gray-600 text-sm">
                            <p className="mb-2">This question assesses your intent to return. Mention family, property, employment, and ongoing commitments.</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-800 mb-2">Do you own property in your home country?</p>
                          <div className="text-gray-600 text-sm">
                            <p className="mb-2">Property ownership is a strong tie to your home country.</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-800 mb-2">What is your job position in your home country?</p>
                          <div className="text-gray-600 text-sm">
                            <p className="mb-2">Stable employment indicates you have a reason to return.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Question Category 3 */}
                    <div className="p-5">
                      <div className="mb-4">
                        <h3 className="font-medium text-gray-800 flex items-center">
                          <div className="h-6 w-6 rounded-full bg-yellow-100 flex items-center justify-center mr-2 flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          Financial Situation
                        </h3>
                      </div>
                      
                      <div className="space-y-4 ml-8">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-800 mb-2">How will you finance your trip to the United States?</p>
                          <div className="text-gray-600 text-sm">
                            <p className="mb-2">Be prepared to explain your funding source (personal savings, company sponsorship, etc.).</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-800 mb-2">What is your annual income?</p>
                          <div className="text-gray-600 text-sm">
                            <p className="mb-2">Be honest and specific about your income.</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium text-gray-800 mb-2">Who will be covering your expenses during your stay?</p>
                          <div className="text-gray-600 text-sm">
                            <p className="mb-2">Clearly explain who will pay for accommodations, food, and transportation.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Video Resources */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-800">Video Resources</h2>
                  </div>
                  
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <div className="aspect-w-16 aspect-h-9 relative h-48 bg-gray-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-800 mb-1">B1 Visa Interview Tips and Tricks</h3>
                          <p className="text-sm text-gray-500">Learn essential strategies for your B1 visa interview</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 rounded-lg overflow-hidden">
                        <div className="aspect-w-16 aspect-h-9 relative h-48 bg-gray-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="p-4">
                          <h3 className="font-medium text-gray-800 mb-1">Sample B1 Visa Interview</h3>
                          <p className="text-sm text-gray-500">Watch a mock interview with expert commentary</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab - Improved UI */}
            {activeTab === 'settings' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center cursor-pointer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Changes
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Profile Settings */}
                  <div className="col-span-2">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Profile Information</h2>
                      
                      <div className="flex flex-col space-y-4">
                        <div className="flex items-center space-x-4 mb-6">
                          <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                              Change Avatar
                            </button>
                            <button className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-sm text-gray-600 hover:bg-gray-50 cursor-pointer">
                              Remove
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input 
                              type="text" 
                              defaultValue="John Smith"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input 
                              type="email" 
                              defaultValue="john.smith@example.com"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country of Residence</label>
                            <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                              <option>United States</option>
                              <option>Canada</option>
                              <option>United Kingdom</option>
                              <option>Australia</option>
                              <option>India</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input 
                              type="tel" 
                              defaultValue="+1 (555) 123-4567"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" 
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mt-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Interview Preferences</h2>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Interview Difficulty</label>
                          <div className="relative mt-1">
                            <input 
                              type="range" 
                              min="1" 
                              max="5" 
                              defaultValue="3" 
                              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                              <span>Easy</span>
                              <span>Challenging</span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Feedback Detail Level</label>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center">
                              <input 
                                type="radio" 
                                id="detail-basic" 
                                name="detail-level" 
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                              />
                              <label htmlFor="detail-basic" className="ml-2 block text-sm text-gray-700">Basic</label>
                            </div>
                            <div className="flex items-center">
                              <input 
                                type="radio" 
                                id="detail-standard" 
                                name="detail-level" 
                                defaultChecked 
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                              />
                              <label htmlFor="detail-standard" className="ml-2 block text-sm text-gray-700">Standard</label>
                            </div>
                            <div className="flex items-center">
                              <input 
                                type="radio" 
                                id="detail-detailed" 
                                name="detail-level" 
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" 
                              />
                              <label htmlFor="detail-detailed" className="ml-2 block text-sm text-gray-700">Detailed</label>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" defaultChecked />
                            <span className="ml-2 text-sm text-gray-700">Enable interview recording</span>
                          </label>
                          <p className="mt-1 text-xs text-gray-500 ml-6">
                            Store interview recordings for your review. All data is securely stored.
                          </p>
                        </div>
                        
                        <div>
                          <label className="flex items-center">
                            <input type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" defaultChecked />
                            <span className="ml-2 text-sm text-gray-700">Receive feedback via email</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subscription Info */}
                  <div className="col-span-1">
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Subscription</h2>
                      
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                        <div className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mt-0.5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-blue-800">Pro Plan</p>
                            <p className="text-xs text-blue-700 mt-1">Renews on Oct 12, 2023</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4 mb-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-2">Your Benefits</h3>
                        <ul className="space-y-2">
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-gray-600">Unlimited practice interviews</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-gray-600">AI-powered detailed feedback</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-gray-600">Performance analytics</span>
                          </li>
                          <li className="flex items-start">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm text-gray-600">Downloadable resources</span>
                          </li>
                        </ul>
                      </div>
                      
                      <div className="flex flex-col space-y-2">
                        <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                          Upgrade Plan
                        </button>
                        <button className="w-full px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          Manage Subscription
                        </button>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100 mt-6">
                      <h2 className="text-lg font-semibold text-gray-800 mb-4">Account Security</h2>
                      
                      <div className="space-y-4">
                        <button className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <span className="font-medium">Change Password</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                        
                        <button className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <span className="font-medium">Two-Factor Authentication</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">Enabled</span>
                        </button>
                        
                        <button className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                          <span className="font-medium">Privacy Settings</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
} 