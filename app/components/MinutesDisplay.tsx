'use client';

import { useState, useEffect, Context, useContext, useRef } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { createClient } from '@/app/utils/supabase/client';
import { store } from '@/app/store';
import { loginSuccess } from '@/app/store/slices/authSlice';

interface MinutesDisplayProps {
  type?: 'visa' | 'healthcare';
  variant?: 'default' | 'compact';
  minutesContext?: Context<number | null>;
  agentId?: string;
}

export default function MinutesDisplay({ type = 'visa', variant = 'default', minutesContext, agentId }: MinutesDisplayProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [refreshMinutes, setRefreshMinutes] = useState(0);
  const [supabaseUserId, setSupabaseUserId] = useState<string | null>(null);
  const [showNotHiredPopup, setShowNotHiredPopup] = useState(false);
  const isFetchingRef = useRef(false);
  
  // Get minutes from context if provided, otherwise from Redux
  const contextMinutes = minutesContext ? useContext(minutesContext) : null;
  const reduxMinutes = useSelector((state: RootState) => state.auth.user?.minutes || 0);
  const minutes = contextMinutes !== null ? contextMinutes : reduxMinutes;
  
  // Get user ID from Redux
  const reduxUserId = useSelector((state: RootState) => state.auth.user?.id);
  
  // For debugging
  useEffect(() => {
    console.log(`[DEBUG] MinutesDisplay render:`, { 
      agentId, 
      reduxUserId, 
      minutes, 
      contextMinutes,
      reduxMinutes,
      supabaseUserId,
      isLoading 
    });
  }, [agentId, reduxUserId, minutes, contextMinutes, reduxMinutes, supabaseUserId, isLoading]);
  
  // Check for Supabase user ID on component mount
  useEffect(() => {
    let isMounted = true;
    console.log(`[MOUNT] MinutesDisplay mounted with agentId: ${agentId}`);
    
    async function getSupabaseUser() {
      if (!isMounted) {
        console.log('[FETCH] Component unmounted, skipping fetch');
        return;
      }
      
      // We always require an agentId - if it's undefined, empty string, or null, we don't fetch
      if (!agentId) {
        console.error('[ERROR] No agentId provided, cannot fetch minutes');
        return;
      }
      
      try {
        console.log('[FETCH] Getting Supabase user...');
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('[ERROR] Failed to get Supabase user:', error);
          return;
        }
        
        if (!data?.user) {
          console.error('[ERROR] No user data returned from Supabase');
          return;
        }
        
        if (isMounted) {
          console.log(`[FETCH] Got Supabase user: ${data.user.id}`);
          setSupabaseUserId(data.user.id);
          
          // If the Redux user ID is the default one, update Redux with the real user ID
          if (reduxUserId === '123456') {
            console.log('[FETCH] Updating Redux store with real user ID');
            // Update Redux store with real user info
            store.dispatch(loginSuccess({
              id: data.user.id,
              name: data.user.email || 'User',
              email: data.user.email || '',
              firstName: data.user.user_metadata?.firstName || null,
              minutes: reduxMinutes // Keep existing minutes
            }));
          }
          
          // Immediately fetch minutes without waiting for useState to update
          console.log(`[FETCH] Fetching minutes with user_id: ${data.user.id} and agent_id: ${agentId}`);
          
          // Set a small delay to ensure we don't have race conditions
          setTimeout(() => {
            if (isMounted) {
              fetchUserAgentMinutes(data.user.id, agentId);
            }
          }, 100);
        }
      } catch (err) {
        if (isMounted) {
          console.error('[ERROR] Error fetching Supabase user:', err);
        }
      }
    }
    
    // Start fetch right away and bypass the ref check
    isFetchingRef.current = false; // Reset this to ensure we can fetch
    getSupabaseUser();
    
    // Cleanup function to prevent state updates if component unmounts
    return () => {
      console.log('[UNMOUNT] MinutesDisplay unmounting');
      isMounted = false;
    };
  }, [agentId, reduxUserId, reduxMinutes]);
  
  // Function to fetch minutes for a specific user and agent
  const fetchUserAgentMinutes = async (userId: string, agentId: string) => {
    if (!userId || !agentId) {
      console.error('[ERROR] Cannot fetch minutes: Missing userId or agentId');
      return;
    }
    
    console.log(`[FETCH] Starting fetchUserAgentMinutes for user ${userId} and agent ${agentId}`);
    
    // Only check for concurrent fetches if we're not in the initial load
    if (isFetchingRef.current) {
      console.log('[FETCH] Fetch already in progress, waiting...');
      // Wait for current fetch to complete and try again after a short delay
      setTimeout(() => {
        if (!isFetchingRef.current) {
          fetchUserAgentMinutes(userId, agentId);
        }
      }, 500);
      return;
    }
    
    setIsLoading(true);
    isFetchingRef.current = true;
    
    try {
      // Fetch minutes from the ai_agent_users table - BOTH user_id AND agent_id are required
      const supabase = createClient();
      console.log(`[FETCH] Querying ai_agent_users with user ${userId} and agent ${agentId}`);
      
      const { data, error } = await supabase
        .from('ai_agent_users')
        .select('purchase_units')
        .eq('user_id', userId)
        .eq('agent_id', agentId)
        .single();
      
      if (error) {
        console.error('[ERROR] Error fetching agent-specific minutes:', error);
        // If there's an error and the status is 406 (Not Found) or the agent wasn't found
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          console.log('[FETCH] No agent-user relationship found, showing popup');
          // Show the not hired popup
          setShowNotHiredPopup(true);
          // Set minutes to 0
          store.dispatch({ 
            type: 'auth/updateUserMinutes', 
            payload: 0 
          });
        }
        return;
      }
      
      const agentMinutes = data?.purchase_units || 0;
      console.log(`[FETCH] ✓ Success! Found ${agentMinutes} minutes for user ${userId} and agent ${agentId}`);
      
      // Update Redux store with the agent-specific minutes
      store.dispatch({ 
        type: 'auth/updateUserMinutes', 
        payload: agentMinutes 
      });
    } catch (error) {
      console.error('[ERROR] Exception in fetchUserAgentMinutes:', error);
    } finally {
      console.log('[FETCH] Completed fetchUserAgentMinutes');
      setIsLoading(false);
      isFetchingRef.current = false;
      // Increment refresh counter
      setRefreshMinutes(prev => prev + 1);
    }
  };
  
  // Function to handle refreshing minutes data
  const handleRefreshMinutes = async () => {
    if (isLoading) {
      console.log('[REFRESH] Already loading, skipping refresh');
      return;
    }
    
    if (!supabaseUserId) {
      console.warn('[REFRESH] No supabaseUserId available, attempting to get one');
      // Try to fetch the Supabase user if we don't have one
      const supabase = createClient();
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error('[REFRESH] Failed to get Supabase user:', error);
          return;
        }
        
        if (!data?.user) {
          console.error('[REFRESH] No user data returned from Supabase');
          return;
        }
        
        setSupabaseUserId(data.user.id);
        console.log(`[REFRESH] Found user: ${data.user.id}`);
      } catch (err) {
        console.error('[REFRESH] Error getting Supabase user:', err);
        return;
      }
    }
    
    // Only proceed if we have an agent ID
    if (!agentId) {
      console.warn('[REFRESH] Cannot refresh minutes without an agent ID');
      return;
    }
    
    console.log(`[REFRESH] Initiating refresh for agent: ${agentId}`);
    
    // Force refresh by resetting the fetching flag
    isFetchingRef.current = false;
    
    // Use a short timeout to ensure state is updated
    setTimeout(() => {
      // Use the Supabase user ID if available, otherwise use the one from Redux
      const effectiveUserId = supabaseUserId || reduxUserId;
      
      if (!effectiveUserId) {
        console.error('[REFRESH] No user ID available for refresh');
        return;
      }
      
      console.log(`[REFRESH] Refreshing minutes for user ${effectiveUserId} and agent ${agentId}`);
      fetchUserAgentMinutes(effectiveUserId, agentId);
    }, 100);
  };
  
  // Adjust styling based on variant
  const isCompact = variant === 'compact';
  
  return (
    <div className="relative group">
      {showNotHiredPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-auto shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Agent Not Hired
              </h3>
              <button 
                onClick={() => setShowNotHiredPopup(false)}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="mt-2 text-sm text-gray-600">
              <p>You haven't hired this agent yet. Please purchase minutes to use this feature.</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowNotHiredPopup(false)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={`flex items-center px-3 py-1 ${type === 'healthcare' ? 'bg-indigo-100' : 'bg-indigo-100'} rounded-full`}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${type === 'healthcare' ? 'text-indigo-600' : 'text-indigo-600'} mr-1.5`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className={`text-sm font-medium ${type === 'healthcare' ? 'text-indigo-800' : 'text-indigo-800'}`}>
          {isLoading ? (
            <span className="inline-block w-10 animate-pulse bg-gray-200 h-4 rounded"></span>
          ) : (
            <>{minutes} Mins</>
          )}
        </span>
        {!isCompact && (
          <button 
            onClick={handleRefreshMinutes}
            disabled={isLoading}
            className={`ml-1.5 p-0.5 rounded-full ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-200'} focus:outline-none transition-colors`}
            title="Refresh minutes"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''} ${type === 'healthcare' ? 'text-indigo-600' : 'text-indigo-600'}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
} 