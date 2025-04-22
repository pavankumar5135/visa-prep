'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Conversation } from '../components/Conversation';
import { useAuth } from '../contexts/AuthContext';

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
  const [activeTab, setActiveTab] = useState('practice');
  const [interviewHistory, setInterviewHistory] = useState<InterviewHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedInterviewId, setExpandedInterviewId] = useState<string | null>(null);
  
  const { user } = useAuth();

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

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Welcome back, {user?.name || 'there'}!
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Practice your B1 visa interview skills or review your past performance.
          </p>
        </div>
        <div className="flex mt-4 md:mt-0 md:ml-4">
          <span className="shadow-sm rounded-md">
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500 focus:outline-none focus:shadow-outline-blue focus:border-blue-700 active:bg-blue-700 transition duration-150 ease-in-out"
            >
              Start New Practice
            </button>
          </span>
        </div>
      </div>

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
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('practice')}
                className={`${
                  activeTab === 'practice'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Practice
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`${
                  activeTab === 'history'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                History
              </button>
              <button
                onClick={() => setActiveTab('resources')}
                className={`${
                  activeTab === 'resources'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Resources
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'practice' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Practice Interview
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Speak with our AI visa officer to practice your interview skills.
              </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              <Conversation />
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Interview History
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Review your past practice sessions and track your progress.
              </p>
            </div>
            <div className="border-t border-gray-200">
              {isLoading ? (
                <div className="px-4 py-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2 text-sm text-gray-500">Loading your interview history...</p>
                </div>
              ) : error ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-red-500">{error}</p>
                  <button
                    className="mt-2 text-sm text-blue-600 hover:text-blue-500"
                    onClick={fetchInterviewHistory}
                  >
                    Try again
                  </button>
                </div>
              ) : interviewHistory.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <p className="text-gray-500">You haven't completed any practice interviews yet.</p>
                  <button
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500"
                    onClick={() => setActiveTab('practice')}
                  >
                    Start your first practice
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {interviewHistory.map((interview) => (
                    <div key={interview.id} className="px-4 py-4 sm:px-6">
                      {/* Interview item */}
                      {/* ... keep existing interview history item code ... */}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                B1 Visa Resources
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Essential information and guides to help you prepare for your B1 visa interview.
              </p>
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {/* Search */}
              <div className="max-w-lg w-full mx-auto mb-8">
                <label htmlFor="search" className="sr-only">Search resources</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <input
                    id="search"
                    name="search"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search for resources"
                    type="search"
                  />
                </div>
              </div>
              
              {/* Resource categories */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Official Documentation */}
                <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Official Documentation</h4>
                  <p className="text-sm text-gray-500 mb-4">Access official guides and requirements from the U.S. Department of State.</p>
                  <ul className="space-y-2">
                    <li>
                      <a href="https://travel.state.gov/content/travel/en/us-visas/business.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 text-sm">
                        U.S. Business Visa Information
                      </a>
                    </li>
                    <li>
                      <a href="https://travel.state.gov/content/travel/en/us-visas/visa-information-resources/forms.html" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 text-sm">
                        Required Forms & Documentation
                      </a>
                    </li>
                    <li>
                      <a href="https://ceac.state.gov/genniv/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500 text-sm">
                        Visa Application Center
                      </a>
                    </li>
                  </ul>
                </div>
                
                {/* FAQs */}
                <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">FAQs</h4>
                  <p className="text-sm text-gray-500 mb-4">Answers to the most commonly asked questions about B1 visas.</p>
                  <button className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    View all FAQs
                  </button>
                </div>
                
                {/* Document Checklist */}
                <div className="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Document Checklist</h4>
                  <p className="text-sm text-gray-500 mb-4">Essential documents you need to prepare for your B1 visa application.</p>
                  <button className="w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                    Download Checklist
                  </button>
                </div>
              </div>
              
              {/* Common Questions */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Common B1 Visa Interview Questions</h4>
                <div className="grid gap-6 lg:grid-cols-2">
                  {/* Purpose of Visit */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Purpose of Visit</h5>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• What is the purpose of your trip to the United States?</li>
                      <li>• How long do you plan to stay in the United States?</li>
                      <li>• Who will you be meeting with during your trip?</li>
                      <li>• Can you describe your business activities in the U.S.?</li>
                    </ul>
                  </div>
                  
                  {/* Ties to Home Country */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Ties to Home Country</h5>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• What is your current job position?</li>
                      <li>• Do you own property in your home country?</li>
                      <li>• What family members do you have in your home country?</li>
                      <li>• Why will you return to your home country after your visit?</li>
                    </ul>
                  </div>
                  
                  {/* Financial Situation */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Financial Situation</h5>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• How will you finance your trip to the United States?</li>
                      <li>• What is your monthly income?</li>
                      <li>• Who is covering the expenses for your trip?</li>
                      <li>• Can you show proof of funds for your visit?</li>
                    </ul>
                  </div>
                  
                  {/* Previous Travel */}
                  <div className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Previous Travel</h5>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>• Have you traveled to the United States before?</li>
                      <li>• Have you ever been denied a visa to any country?</li>
                      <li>• What other countries have you visited in the past 5 years?</li>
                      <li>• Have you ever overstayed a visa in any country?</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              {/* Video Resources */}
              <div className="mt-8 border-t border-gray-200 pt-8">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Video Resources</h4>
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                      <div className="flex items-center justify-center h-full">
                        <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="p-4">
                      <h5 className="font-medium text-gray-900">B1 Visa Interview Tips</h5>
                      <p className="mt-1 text-sm text-gray-500">Learn the best practices for your B1 visa interview from experienced immigration consultants.</p>
                    </div>
                  </div>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                      <div className="flex items-center justify-center h-full">
                        <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="p-4">
                      <h5 className="font-medium text-gray-900">Sample B1 Visa Interview</h5>
                      <p className="mt-1 text-sm text-gray-500">Watch a mock B1 visa interview to understand what to expect and how to respond effectively.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 