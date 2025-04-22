'use client';

import { useConversation } from '@11labs/react';
import { useCallback, useState, useEffect } from 'react';

// Import or define the Role type to match the library's type
type Role = 'user' | 'ai' | 'agent';

// Define interface for the message type
interface ConversationMessage {
  message: string;
  source: Role;
}

export function Conversation() {
  const [currentQuestion, setCurrentQuestion] = useState<string>('');
  const [feedback, setFeedback] = useState<string>('');
  const [interviewStage, setInterviewStage] = useState<string>('intro');
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isInterviewActive, setIsInterviewActive] = useState<boolean>(false);

  // Timer for tracking interview duration
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isInterviewActive) {
      timer = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isInterviewActive]);

  // Format seconds into MM:SS format
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected');
      setInterviewStage('intro');
      setIsInterviewActive(true);
      setElapsedTime(0);
    },
    onDisconnect: () => {
      console.log('Disconnected');
      setInterviewStage('complete');
      setIsInterviewActive(false);
    },
    onMessage: (message: ConversationMessage) => {
      console.log('Message:', message);
      // Extract the current question from the message
      const messageText = message.message;
      setCurrentQuestion(messageText);
      
      // Simulate interview stages based on messages
      if (messageText.includes('purpose') || messageText.includes('visit')) {
        setInterviewStage('purpose');
      } else if (messageText.includes('home') || messageText.includes('country')) {
        setInterviewStage('ties');
      } else if (messageText.includes('financial') || messageText.includes('fund')) {
        setInterviewStage('financial');
      } else if (messageText.includes('previous') || messageText.includes('traveled')) {
        setInterviewStage('travel_history');
      } else if (messageText.includes('thank you') || messageText.includes('conclude')) {
        setInterviewStage('complete');
        
        // Simulate feedback
        setTimeout(() => {
          setFeedback('Your interview responses were clear and concise. You effectively demonstrated your ties to your home country and clearly explained the purpose of your visit. For improvement, you could provide more specific details about your business activities in the US.');
        }, 2000);
      }
    },
    onError: (error) => console.error('Error:', error),
  });


  const startConversation = useCallback(async () => {
    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Start the conversation with your agent
      await conversation.startSession({
        agentId: process.env.NEXT_PUBLIC_ELEVEN_LABS_AGENT_ID || '8xzGLFDx4PMsfYMFGWIb', // Explicit fallback to the original agent ID
      });

    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [conversation]);

  const stopConversation = useCallback(async () => {
    await conversation.endSession();
  }, [conversation]);

  // Progress indicator
  const getProgressPercentage = () => {
    const stages = ['intro', 'purpose', 'ties', 'financial', 'travel_history', 'complete'];
    const currentStageIndex = stages.indexOf(interviewStage);
    return Math.min(100, (currentStageIndex / (stages.length - 1)) * 100);
  };

  // Stage definitions for visual display
  const stageLabels = [
    { id: 'intro', label: 'Introduction' },
    { id: 'purpose', label: 'Purpose' },
    { id: 'ties', label: 'Ties' },
    { id: 'financial', label: 'Financial' },
    { id: 'travel_history', label: 'Travel' },
    { id: 'complete', label: 'Conclusion' }
  ];

  // Speaking animation
  const SpeakingAnimation = () => (
    <div className="flex items-center h-4 space-x-1">
      <div className={`w-1 bg-blue-600 rounded-full ${conversation.isSpeaking ? 'animate-speaking-short' : 'h-1'}`}></div>
      <div className={`w-1 bg-blue-600 rounded-full ${conversation.isSpeaking ? 'animate-speaking-medium' : 'h-1'}`}></div>
      <div className={`w-1 bg-blue-600 rounded-full ${conversation.isSpeaking ? 'animate-speaking-tall' : 'h-1'}`}></div>
      <div className={`w-1 bg-blue-600 rounded-full ${conversation.isSpeaking ? 'animate-speaking-medium' : 'h-1'}`}></div>
      <div className={`w-1 bg-blue-600 rounded-full ${conversation.isSpeaking ? 'animate-speaking-short' : 'h-1'}`}></div>
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Progress indicator */}
      <div className="w-full mb-3">
        <div className="relative pt-5 pb-8">
          {/* Progress track - background track */}
          <div className="absolute top-[10px] w-full h-1.5 bg-gray-200 rounded-full">
            <div 
              className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-in-out"
              style={{ width: `${getProgressPercentage()}%` }}
            />
          </div>
          
          {/* Stage indicator dots & labels */}
          <div className="relative flex justify-between">
            {stageLabels.map((stage, index) => {
              const isCurrentStage = interviewStage === stage.id;
              const isPastStage = stageLabels.findIndex(s => s.id === interviewStage) >= index;
              
              return (
                <div key={stage.id} className="flex flex-col items-center relative">
                  {/* Dot with optional ring for current stage */}
                  <div 
                    className={`w-3 h-3 rounded-full ${
                      isCurrentStage
                        ? 'bg-blue-600 ring-2 ring-blue-100'
                        : isPastStage
                          ? 'bg-blue-600'
                          : 'bg-gray-300'
                    }`}
                  />
                  {/* Label below dot */}
                  <span 
                    className={`absolute top-5 text-[9px] md:text-xs whitespace-nowrap transform -translate-x-1/2 left-1/2 ${
                      isCurrentStage ? 'text-blue-600 font-medium' : 'text-gray-500 text-opacity-90'
                    }`}
                    style={{ 
                      maxWidth: window.innerWidth < 640 ? '40px' : '60px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {stage.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Elapsed time indicator */}
        {isInterviewActive && (
          <div className="flex justify-center items-center mt-1">
            <span className="text-xs text-gray-500 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">{formatTime(elapsedTime)}</span>
            </span>
          </div>
        )}
      </div>
      
      {/* Current question display with animation */}
      <div className="w-full p-3 sm:p-4 bg-blue-50 rounded-lg mb-2 min-h-16">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <div className="ml-2 font-medium text-gray-700">Visa Officer</div>
          </div>
          
          {conversation.status === 'connected' && conversation.isSpeaking && (
            <SpeakingAnimation />
          )}
        </div>
        
        <div className="pl-10">
          <p className="font-medium text-gray-700 text-sm sm:text-base">
            {conversation.status === 'connected' && !conversation.isSpeaking && currentQuestion 
              ? <span>{currentQuestion}</span>
              : conversation.status === 'connected' && conversation.isSpeaking
                ? <span className="text-blue-700 flex items-center">
                    Interviewer is speaking...
                  </span>
                : <span className="text-gray-500 italic">The interview will begin shortly...</span>
            }
          </p>
        </div>
      </div>
      
      {/* User speaking indicator */}
      {conversation.status === 'connected' && !conversation.isSpeaking && (
        <div className="w-full p-3 bg-gray-50 rounded-lg mb-2 min-h-12 flex items-center">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="ml-2 flex items-center justify-between w-full">
            <span className="font-medium text-gray-600 text-sm sm:text-base">You</span>
            <div className={`${!conversation.isSpeaking ? 'relative flex h-3 w-3' : 'hidden'}`}>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </div>
          </div>
        </div>
      )}
      
      {/* Control buttons */}
      <div className="flex gap-2 sm:gap-4 w-full">
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected'}
          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg font-medium disabled:bg-gray-300 hover:bg-blue-700 transition cursor-pointer"
        >
          Start Interview
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== 'connected'}
          className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-red-500 text-white rounded-lg font-medium disabled:bg-gray-300 hover:bg-red-600 transition cursor-pointer"
        >
          End Interview
        </button>
      </div>

      {/* Status indicators */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full mt-2 px-2 text-xs sm:text-sm">
        <div className="flex items-center mb-1 sm:mb-0">
          <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-2 ${conversation.status === 'connected' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <p className="text-gray-600">Status: {conversation.status === 'connected' ? 'Connected' : 'Disconnected'}</p>
        </div>
        <p className="text-gray-600">
          {conversation.status === 'connected' && 
            (conversation.isSpeaking ? 'Interviewer is speaking' : 'Interviewer is listening')}
        </p>
      </div>
      
      {/* Feedback section - appears after interview is complete */}
      {interviewStage === 'complete' && feedback && (
        <div className="w-full mt-4 sm:mt-6 p-3 sm:p-4 bg-green-50 border border-green-100 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Interview Feedback</h3>
          <p className="text-gray-700 text-sm sm:text-base">{feedback}</p>
        </div>
      )}
    </div>
  );
} 