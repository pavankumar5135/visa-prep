'use client';

import { useConversation } from '@11labs/react';
import { useCallback, useState } from 'react';

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

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected');
      setInterviewStage('intro');
    },
    onDisconnect: () => {
      console.log('Disconnected');
      setInterviewStage('complete');
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
        agentId: process.env.NEXT_PUBLIC_ELEVEN_LABS_AGENT_ID || '', // Explicit fallback to the original agent ID
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

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Progress indicator */}
      <div className="w-full mb-4">
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-in-out" 
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-1 text-xs text-gray-500">
          <span>Introduction</span>
          <span>Purpose</span>
          <span>Ties</span>
          <span>Financial</span>
          <span>Travel</span>
          <span>Conclusion</span>
        </div>
      </div>
      
      {/* Current question display */}
      <div className="w-full p-4 bg-blue-50 rounded-lg mb-2 min-h-16">
        <p className="font-medium text-gray-700">
          {conversation.status === 'connected' && !conversation.isSpeaking && currentQuestion 
            ? <span>Question: {currentQuestion}</span>
            : conversation.status === 'connected' && conversation.isSpeaking
              ? <span className="text-blue-700">Interviewer is speaking...</span>
              : <span className="text-gray-500 italic">The interview will begin shortly...</span>
          }
        </p>
      </div>
      
      {/* Control buttons */}
      <div className="flex gap-4 w-full">
        <button
          onClick={startConversation}
          disabled={conversation.status === 'connected'}
          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium disabled:bg-gray-300 hover:bg-blue-700 transition cursor-pointer"
        >
          Start Interview
        </button>
        <button
          onClick={stopConversation}
          disabled={conversation.status !== 'connected'}
          className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-medium disabled:bg-gray-300 hover:bg-red-600 transition cursor-pointer"
        >
          End Interview
        </button>
      </div>

      {/* Status indicators */}
      <div className="flex items-center justify-between w-full mt-2 px-2">
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded-full mr-2 ${conversation.status === 'connected' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
          <p className="text-sm text-gray-600">Status: {conversation.status === 'connected' ? 'Connected' : 'Disconnected'}</p>
        </div>
        <p className="text-sm text-gray-600">
          {conversation.status === 'connected' && 
            (conversation.isSpeaking ? 'Interviewer is speaking' : 'Interviewer is listening')}
        </p>
      </div>
      
      {/* Feedback section - appears after interview is complete */}
      {interviewStage === 'complete' && feedback && (
        <div className="w-full mt-6 p-4 bg-green-50 border border-green-100 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Interview Feedback</h3>
          <p className="text-gray-700">{feedback}</p>
        </div>
      )}
    </div>
  );
} 