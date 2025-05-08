"use client";

import { useConversation } from "@11labs/react";
import { useCallback, useState, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { 
  setConversationId, 
  setCurrentQuestion, 
  setFeedback, 
  setInterviewStage,
  incrementElapsedTime,
  resetElapsedTime,
  setInterviewActive,
  setLoading,
  setError as setConversationError,
  setInterviewData,
  setAnalysis
} from "../store/slices/conversationSlice";

// Import or define the Role type to match the library's type
type Role = "user" | "ai" | "agent";

// Define interface for the message type
interface ConversationMessage {
  message: string;
  source: Role;
}

// Define props interface to accept interview data
interface ConversationProps {
  interviewData?: {
    name: string;
    role: string;
    visaType: string;
    originCountry: string;
    destinationCountry: string;
    employer: string;
    client?: string;
  } | null;
  apiKey?: string; // Added API key option
  onViewFeedback?: () => void; // Callback to view feedback
  userId?: string; // Add userId prop
}

export function Conversation({ interviewData, apiKey, onViewFeedback, userId }: ConversationProps) {
  // Get conversation state from Redux
  const {
    currentQuestion,
    feedback,
    interviewStage,
    elapsedTime,
    isInterviewActive,
    isLoading,
    error,
    conversationId
  } = useAppSelector((state: { conversation: any }) => state.conversation);
  
  const dispatch = useAppDispatch();
  
  // Track if interview has been started in this session
  const [hasStartedOnce, setHasStartedOnce] = useState(false);
  
  // Track if analysis is in progress
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Use a ref to maintain the conversation ID across renders and async operations
  const convIdRef = useRef<string>("");
  
  // Use a ref to track if analysis has been performed
  const analysisPerformedRef = useRef<boolean>(false);
  
  // Initialize hasStartedOnce from localStorage on component mount
  useEffect(() => {
    const hasStarted = localStorage.getItem('hasStartedInterview') === 'true';
    setHasStartedOnce(hasStarted);
  }, []);
  
  // Store interviewData in Redux when it changes
  useEffect(() => {
    if (interviewData) {
      dispatch(setInterviewData(interviewData));
    }
  }, [interviewData, dispatch]);
  
  // Keep the ref in sync with the Redux state
  useEffect(() => {
    convIdRef.current = conversationId;
  }, [conversationId]);

  // Get appropriate greeting based on time of day
  const getTimeBasedGreeting = (): string => {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
      return "Good morning";
    } else if (hour >= 12 && hour < 17) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  // Timer for tracking interview duration
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isInterviewActive) {
      timer = setInterval(() => {
        dispatch(incrementElapsedTime());
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isInterviewActive, dispatch]);

  // Format seconds into MM:SS format
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const conversation = useConversation({
    onConnect: () => {
      console.log("Connected");
      dispatch(setInterviewStage("intro"));
      dispatch(setInterviewActive(true));
      dispatch(resetElapsedTime());
      dispatch(setLoading(false));
    },
    onDisconnect: () => {
      console.log("Disconnected, current conversation ID:", convIdRef.current);
      dispatch(setInterviewStage("complete"));
      dispatch(setInterviewActive(false));
      dispatch(setLoading(false));
      
      // Only call fetchConversationDetails here if it wasn't triggered by stopConversation
      // We can detect this by checking if analysisPerformedRef.current is false
      if (convIdRef.current && !analysisPerformedRef.current) {
        console.log("Conversation ended naturally, fetching details for convId:", convIdRef.current);
        fetchConversationDetails(convIdRef.current);
      } else {
        console.log("Skipping automatic analysis as it was either already performed or this is a manual disconnect");
      }
    },
    onMessage: (message: ConversationMessage) => {
      console.log("Message:", message);
      // Extract the current question from the message
      const messageText = message.message;
      dispatch(setCurrentQuestion(messageText));

      // Simulate interview stages based on messages
      if (messageText.includes("purpose") || messageText.includes("visit")) {
        dispatch(setInterviewStage("purpose"));
      } else if (
        messageText.includes("home") ||
        messageText.includes("country")
      ) {
        dispatch(setInterviewStage("ties"));
      } else if (
        messageText.includes("financial") ||
        messageText.includes("fund")
      ) {
        dispatch(setInterviewStage("financial"));
      } else if (
        messageText.includes("previous") ||
        messageText.includes("traveled")
      ) {
        dispatch(setInterviewStage("travel_history"));
      } else if (
        messageText.includes("thank you") ||
        messageText.includes("conclude")
      ) {
        dispatch(setInterviewStage("complete"));

        // Simulate feedback
        setTimeout(() => {
          dispatch(setFeedback(
            "Your interview responses were clear and concise. You effectively demonstrated your ties to your home country and clearly explained the purpose of your visit. For improvement, you could provide more specific details about your business activities in the US."
          ));
        }, 2000);
      }
    },
    onError: (error) => {
      console.error("Error:", error);
      dispatch(setConversationError("An error occurred during the conversation. Please try again."));
      dispatch(setLoading(false));
    },
  });

  // Function to get signed URL for secure authorization
  const getSignedUrl = async (agentId: string): Promise<string> => {
    try {
      // Create a server API endpoint in Next.js
      const response = await fetch(`/api/getSignedUrl?agentId=${agentId}`);

      if (!response.ok) {
        throw new Error(`Failed to get signed URL: ${response.statusText}`);
      }

      const data = await response.json();
      return data.signedUrl;
    } catch (error) {
      console.error("Error fetching signed URL:", error);
      throw error;
    }
  };

  const fetchConversationDetails = async (conversationId: string) => {
    if (!conversationId) {
      console.error("Cannot fetch conversation details: empty conversation ID provided");
      return null;
    }
    
    setIsAnalyzing(true); // Set analyzing state to true
    
    try {
      console.log("Attempting to fetch conversation details for ID:", conversationId);
      
      // Maximum number of polling attempts
      const maxAttempts = 10;
      // Delay between polling attempts in milliseconds
      const pollingDelay = 2000; // 2 seconds
      
      let attempts = 0;
      let status = "in-progress";
      let data = null;
      
      // Poll until we get a completed or failed status, or reach max attempts
      while (attempts < maxAttempts && (status === "in-progress" || status === "processing")) {
        // If not the first attempt, wait before polling again
        if (attempts > 0) {
          await new Promise(resolve => setTimeout(resolve, pollingDelay));
        }
        
        attempts++;
        console.log(`Fetching conversation details - attempt ${attempts}/${maxAttempts}`);
        
        const response = await fetch(`/api/conversationDetails?conversationId=${conversationId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(apiKey ? { 'x-api-key': apiKey } : {}),
          },
        });
    
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API Error (${response.status}):`, errorText);
          throw new Error(`Failed to fetch conversation details: ${response.statusText}`);
        }
    
        data = await response.json();
        console.log(`Conversation details - Status: ${data.status}, Attempt: ${attempts}/${maxAttempts}`);
        
        status = data.status;
        
        // Break the loop if we have a final status
        if (status === "completed" || status === "failed") {
          break;
        }
      }
      
      // Check if we have transcript data for analysis
      if (data && data.transcript && Array.isArray(data.transcript) && data.transcript.length > 0) {
        // Only perform analysis if it hasn't been done yet
        if (!analysisPerformedRef.current) {
          try {
            console.log("Starting conversation analysis...");
            // Send transcript to our analysis API
            const analysisResponse = await fetch('https://wwewdsmbtooeygsmymek.supabase.co/functions/v1/analyze-conversation', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
              },
              body: JSON.stringify({
                transcript: data.transcript
              }),
            });
            
            if (!analysisResponse.ok) {
              console.error('Analysis API error:', await analysisResponse.text());
              throw new Error('Failed to analyze conversation');
            }
            
            const analysisData = await analysisResponse.json();
            console.log('Conversation analysis completed:', analysisData);
            
            // Store the full analysis text in feedback
            const combinedFeedback = analysisData.analysis.fullAnalysis || 
              "Your interview responses have been analyzed. Review the detailed feedback for insights on your performance and areas for improvement.";
            
            // Store the analyzed feedback in Redux
            dispatch(setFeedback(combinedFeedback));
            
            // Store the structured analysis data
            if (analysisData.analysis) {
              // Check if the analysis data contains the try_saying_it_like_this field
              // and preserve it with the exact structure from the API
              if (analysisData.analysis.try_saying_it_like_this) {
                console.log('Analysis includes try_saying_it_like_this:', analysisData.analysis.try_saying_it_like_this);
              }
              dispatch(setAnalysis(analysisData.analysis));
            }
            
            // Mark that analysis has been performed
            analysisPerformedRef.current = true;
          } catch (analysisError) {
            console.error('Error analyzing conversation:', analysisError);
          }
        } else {
          console.log('Skipping analysis as it has already been performed');
        }
      } else {
        if (attempts >= maxAttempts) {
          console.log(`Max polling attempts (${maxAttempts}) reached without getting transcript data`);
        } else {
          console.log('No transcript data available for analysis');
        }
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching conversation details:', error);
      return null;
    } finally {
      setIsAnalyzing(false); // Set analyzing state to false regardless of outcome
    }
  };
  
  // Function to safely store the conversation ID in both state and ref
  const storeConversationId = useCallback((id: string) => {
    if (!id) {
      console.error("Attempted to store empty conversation ID");
      return false;
    }
    console.log("Storing conversation ID:", id);
    dispatch(setConversationId(id));
    convIdRef.current = id; // Set ref immediately without waiting for state update
    return true;
  }, [dispatch]);

  // Start conversation with secure authorization
  const startConversation = useCallback(async () => {
    // Mark that the interview has been started once
    setHasStartedOnce(true);
    localStorage.setItem('hasStartedInterview', 'true');
    
    dispatch(setLoading(true));
    dispatch(setConversationError(null));

    try {
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      const agentId =
        process.env.NEXT_PUBLIC_ELEVEN_LABS_AGENT_ID || "8xzGLFDx4PMsfYMFGWIb";

      // Prepare dynamic variables
      const dynamicVariables = {
        greeting: getTimeBasedGreeting(),
        name: interviewData?.name || "John Doe",
        role: interviewData?.role || "Software Engineer",
        visaType: interviewData?.visaType || "H-1B",
        originCountry: interviewData?.originCountry || "India",
        destinationCountry:
          interviewData?.destinationCountry || "United States",
        employer: interviewData?.employer || "",
        client: interviewData?.client || "",
        userId: userId || "", // Add userId to dynamic variables
      };
      console.log(apiKey, "apiKey");

      let sessionId: string = "";
      // If API key authentication is enabled, get a signed URL
      if (apiKey) {
        try {
          const signedUrl = await getSignedUrl(agentId);
          console.log("Signed URL:", signedUrl);
          // Start the conversation with the signed URL
         sessionId = await conversation.startSession({
            signedUrl,
            dynamicVariables,
          });
          console.log("Conversation started with signed URL, got sessionId:", sessionId);
        } catch (error) {
          console.error("Failed to get signed URL:", error);
          dispatch(setConversationError("Failed to authenticate. Please try again."));
          dispatch(setLoading(false));
          return; // Exit early to prevent setting empty convId
        }
      } else {
        // Use direct agent ID approach (less secure, for development only)
       sessionId = await conversation.startSession({
          agentId,
          dynamicVariables,
        });
        console.log("Conversation started with agent ID, got sessionId:", sessionId);
      }
      
      if (!sessionId) {
        console.error("Failed to get a valid conversation ID");
        dispatch(setConversationError("Failed to start conversation. Please try again."));
        dispatch(setLoading(false));
        return;
      }
      
      // Store the conversation ID
      const stored = storeConversationId(sessionId);
      if (!stored) {
        dispatch(setConversationError("Failed to store conversation ID. Please try again."));
        dispatch(setLoading(false));
        return;
      }
      
      console.log("Successfully started and stored conversation ID");
    } catch (error) {
      console.error("Failed to start conversation:", error);
      dispatch(setConversationError(
        "Failed to start the interview. Please check your microphone and try again."
      ));
      dispatch(setLoading(false));
    }
  }, [conversation, interviewData, apiKey, storeConversationId, dispatch, userId]);

  const stopConversation = useCallback(async () => {
    try {
      // Store the current conversation ID in a local variable before ending the session
      const currentConvId = convIdRef.current;
      console.log("Stopping conversation with ID:", currentConvId);
      
      if (!currentConvId) {
        console.error("Cannot stop conversation: No conversation ID available");
        return;
      }

      // Set a flag for manual disconnect to prevent duplicate analysis from onDisconnect
      console.log("Setting manual disconnect flag to prevent duplicate analysis");
      analysisPerformedRef.current = true;

      // End the session first
      await conversation.endSession();
      
      // Update the interview stage
      dispatch(setInterviewStage("complete"));
      
      // Wait a short delay to allow the conversation service to finish processing
      console.log("Waiting for conversation processing to complete...");
      await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
      
      // Temporarily set the flag to false to allow analysis in fetchConversationDetails
      console.log("Temporarily resetting analysis flag to allow analysis");
      analysisPerformedRef.current = false;
      
      // Then fetch the conversation details and perform analysis
      console.log("Fetching conversation details after stopping, ID:", currentConvId);
      await fetchConversationDetails(currentConvId);
      
      // Set the flag back to true to prevent any further analysis
      analysisPerformedRef.current = true;
    } catch (error) {
      console.error("Failed to stop conversation:", error);
    }
  }, [conversation, fetchConversationDetails, dispatch]);

  // Speaking animation
  const SpeakingAnimation = () => (
    <div className="flex items-center h-4 space-x-1">
      <div
        className={`w-1 bg-blue-600 rounded-full ${
          conversation.isSpeaking ? "animate-speaking-short" : "h-1"
        }`}
      ></div>
      <div
        className={`w-1 bg-blue-600 rounded-full ${
          conversation.isSpeaking ? "animate-speaking-medium" : "h-1"
        }`}
      ></div>
      <div
        className={`w-1 bg-blue-600 rounded-full ${
          conversation.isSpeaking ? "animate-speaking-tall" : "h-1"
        }`}
      ></div>
      <div
        className={`w-1 bg-blue-600 rounded-full ${
          conversation.isSpeaking ? "animate-speaking-medium" : "h-1"
        }`}
      ></div>
      <div
        className={`w-1 bg-blue-600 rounded-full ${
          conversation.isSpeaking ? "animate-speaking-short" : "h-1"
        }`}
      ></div>
    </div>
  );

  // Reset hasStartedOnce when component unmounts or when returning to dashboard
  useEffect(() => {
    return () => {
      setHasStartedOnce(false);
    };
  }, []);

  // Handle returning to dashboard
  const handleReturnToDashboard = useCallback(() => {
    // Clear the hasStarted flag in localStorage
    localStorage.removeItem('hasStartedInterview');
    // Return to dashboard
    window.location.href = '/dashboard';
  }, []);

  // When viewing feedback, clear the hasStartedInterview flag and get conversation analysis
  const handleViewFeedback = useCallback(async () => {
    // Clear the hasStarted flag to allow starting a new interview from dashboard
    localStorage.removeItem('hasStartedInterview');
    
    // We don't need to re-fetch or re-analyze the conversation since it was already done during disconnect
    if (onViewFeedback) {
      onViewFeedback();
    }
  }, [onViewFeedback]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* Show either the interview interface or the completion feedback */}
      {interviewStage === "complete" ? (
        /* Feedback section - appears after interview is complete */
        <div className="w-full mt-4 sm:mt-6 p-6 bg-green-50 border border-green-100 rounded-xl text-center animate-fadeIn">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            Interview Complete
          </h3>
          <p className="text-gray-600 mb-6">
            Congratulations! You've successfully completed your visa interview practice. Your session lasted {formatTime(elapsedTime)}.
          </p>
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-green-600 mb-4"></div>
              <p className="text-sm text-gray-600">Analyzing your interview performance...</p>
            </div>
          ) : (
            <button
              onClick={handleViewFeedback}
              className="px-6 py-3 rounded-full shadow-md text-sm font-medium text-white bg-gradient-to-r from-green-600 to-teal-500 hover:from-green-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all transform hover:scale-105"
            >
              <div className="flex items-center justify-center">
                <span>View Your Feedback</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </div>
            </button>
          )}
        </div>
      ) : (
        /* Main Interview Interface */
        <>
          {/* Timer only */}
          <div className="w-full mb-3">
            {isInterviewActive && (
              <div className="flex justify-center items-center mt-1">
                <span className="text-xs text-gray-500 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-blue-600 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>
                <div className="ml-2 font-medium text-gray-700">Visa Officer</div>
              </div>

              {conversation.status === "connected" && conversation.isSpeaking && (
                <SpeakingAnimation />
              )}
            </div>

            <div className="pl-10">
              <p className="font-medium text-gray-700 text-sm sm:text-base">
                {conversation.status === "connected" &&
                !conversation.isSpeaking &&
                currentQuestion ? (
                  <span>{currentQuestion}</span>
                ) : conversation.status === "connected" &&
                  conversation.isSpeaking ? (
                  <span className="text-blue-700 flex items-center">
                    Interviewer is speaking...
                  </span>
                ) : (
                  <span className="text-gray-500 italic">
                    The interview will begin shortly...
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* User speaking indicator */}
          {conversation.status === "connected" && !conversation.isSpeaking && (
            <div className="w-full p-3 bg-gray-50 rounded-lg mb-2 min-h-12 flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="ml-2 flex items-center justify-between w-full">
                <span className="font-medium text-gray-600 text-sm sm:text-base">
                  You
                </span>
                <div
                  className={`${
                    !conversation.isSpeaking ? "relative flex h-3 w-3" : "hidden"
                  }`}
                >
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="w-full p-3 bg-red-50 border border-red-100 rounded-lg mb-2">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Control buttons */}
          <div className="flex gap-2 sm:gap-4 w-full">
            {/* Only show Start button if interview hasn't been started or if in disconnected state */}
            {(!hasStartedOnce || conversation.status !== "connected") && (
              <button
                onClick={startConversation}
                disabled={conversation.status === "connected" || isLoading || hasStartedOnce}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg font-medium disabled:bg-gray-300 hover:bg-blue-700 transition cursor-pointer flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Connecting...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                    Start Interview
                  </>
                )}
              </button>
            )}
            
            {/* End Interview button - only show when connected */}
            {conversation.status === "connected" && (
              <button
                onClick={stopConversation}
                disabled={isLoading}
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base bg-red-500 text-white rounded-lg font-medium disabled:bg-gray-300 hover:bg-red-600 transition cursor-pointer"
              >
                End Interview
              </button>
            )}
          </div>

          {/* Message about starting fresh */}
          {hasStartedOnce && conversation.status !== "connected" && !isLoading && (
            <div className="w-full p-3 bg-yellow-50 border border-yellow-100 rounded-lg mt-2">
              <p className="text-yellow-700 text-sm text-center">
                To start a new interview session, please return to the dashboard and try again.
              </p>
            </div>
          )}

          {/* Status indicators */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full mt-2 px-2 text-xs sm:text-sm">
            <div className="flex items-center mb-1 sm:mb-0">
              <div
                className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full mr-2 ${
                  conversation.status === "connected"
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              ></div>
              <p className="text-gray-600">
                Status:{" "}
                {conversation.status === "connected" ? "Connected" : "Disconnected"}
              </p>
            </div>
            <p className="text-gray-600">
              {conversation.status === "connected" &&
                (conversation.isSpeaking
                  ? "Interviewer is speaking"
                  : "Interviewer is listening")}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
