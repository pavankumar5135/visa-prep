import { createClient } from '@/app/utils/supabase/client';
import { updateUserMinutes } from '@/app/store/slices/authSlice';
import { store } from '@/app/store';

/**
 * Fetches the user's available minutes from Supabase and updates Redux
 * @param agentId Required agent ID to query minutes for
 * @returns Promise<number | null> - Returns available minutes or null if not found
 */
export async function fetchUserMinutes(agentId: string) {
  if (!agentId) {
    console.error('Cannot fetch minutes: agentId is required');
    return null;
  }

  try {
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      console.log('User not authenticated, cannot fetch minutes');
      return null;
    }
    
    console.log(`Fetching minutes for user ${userData.user.id} and agent ${agentId}`);
    
    // Fetch minutes from ai_agent_users table - BOTH user_id AND agent_id are required
    const { data: minutesData, error: minutesError } = await supabase
      .from('ai_agent_users')
      .select('purchase_units')
      .eq('user_id', userData.user.id)
      .eq('agent_id', agentId)
      .single();
      
    if (!minutesError && minutesData) {
      const minutes = minutesData.purchase_units || 0;
      console.log(`Found ${minutes} minutes for user ${userData.user.id} and agent ${agentId}`);
      // Update Redux store with the available minutes
      store.dispatch(updateUserMinutes(minutes));
      return minutes;
    } else {
      console.log('User-agent relationship not found or error fetching data:', minutesError);
      return null;
    }
  } catch (err) {
    console.error('Error fetching user minutes:', err);
    return null;
  }
} 