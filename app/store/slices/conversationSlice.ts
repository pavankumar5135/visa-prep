import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define the conversation state interface
export interface ConversationState {
  conversationId: string;
  interviewStage: string;
  currentQuestion: string;
  feedback: string;
  elapsedTime: number;
  isInterviewActive: boolean;
  isLoading: boolean;
  error: string | null;
  // Add any interview data we want to store
  interviewData: {
    name: string;
    role: string;
    visaType: string;
    originCountry: string;
    destinationCountry: string;
    employer: string;
    client: string;
  } | null;
}

// Initial state
const initialState: ConversationState = {
  conversationId: '',
  interviewStage: 'intro',
  currentQuestion: '',
  feedback: '',
  elapsedTime: 0,
  isInterviewActive: false,
  isLoading: false,
  error: null,
  interviewData: null
};

// Create the conversation slice
export const conversationSlice = createSlice({
  name: 'conversation',
  initialState,
  reducers: {
    setConversationId: (state, action: PayloadAction<string>) => {
      state.conversationId = action.payload;
    },
    setInterviewStage: (state, action: PayloadAction<string>) => {
      state.interviewStage = action.payload;
    },
    setCurrentQuestion: (state, action: PayloadAction<string>) => {
      state.currentQuestion = action.payload;
    },
    setFeedback: (state, action: PayloadAction<string>) => {
      state.feedback = action.payload;
    },
    incrementElapsedTime: (state) => {
      state.elapsedTime += 1;
    },
    resetElapsedTime: (state) => {
      state.elapsedTime = 0;
    },
    setInterviewActive: (state, action: PayloadAction<boolean>) => {
      state.isInterviewActive = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setInterviewData: (state, action: PayloadAction<ConversationState['interviewData']>) => {
      state.interviewData = action.payload;
    },
    resetConversation: (state) => {
      return { 
        ...initialState,
        interviewData: state.interviewData // Keep interview data
      };
    }
  },
});

// Export actions
export const {
  setConversationId,
  setInterviewStage,
  setCurrentQuestion,
  setFeedback,
  incrementElapsedTime,
  resetElapsedTime,
  setInterviewActive,
  setLoading,
  setError,
  setInterviewData,
  resetConversation
} = conversationSlice.actions;

// Export reducer
export default conversationSlice.reducer; 