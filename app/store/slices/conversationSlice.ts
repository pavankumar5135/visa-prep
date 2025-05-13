import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Define visa interview data type
interface VisaInterviewData {
  name: string;
  role: string;
  visaType: string;
  originCountry: string;
  destinationCountry: string;
  employer: string;
  client?: string;
}

// Define healthcare interview data type
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
  // Add structured analysis data
  analysis: {
    overallImpression?: string;
    strengths: string[];
    improvements: string[];
    specificFeedback?: string;
    recommendations?: string;
    fullAnalysis?: string;
    detailedFeedback?: string;
    score?: number;
    comment?: string;
    try_saying_it_like_this?: {
      question: string;
      suggested_answer: string;
    };
  } | null;
  // Interview data with type
  type: 'visa' | 'healthcare' | null;
  data: VisaInterviewData | HealthcareInterviewData | null;
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
  analysis: null,
  type: null,
  data: null
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
    setAnalysis: (state, action: PayloadAction<ConversationState['analysis']>) => {
      state.analysis = action.payload;
    },
    // Updated to handle both types of interview data
    setInterviewData: (state, action: PayloadAction<{
      type: 'visa' | 'healthcare';
      data: VisaInterviewData | HealthcareInterviewData;
    }>) => {
      state.type = action.payload.type;
      state.data = action.payload.data;
    },
    resetConversation: (state) => {
      return { 
        ...initialState,
        analysis: state.analysis,
        type: state.type,
        data: state.data // Keep interview data
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
  setAnalysis,
  setInterviewData,
  resetConversation
} = conversationSlice.actions;

// Export reducer
export default conversationSlice.reducer; 