import { createClient } from '@/app/utils/supabase/client';
import { updateUserMinutes } from '@/app/store/slices/authSlice';
import { store } from '@/app/store';

/**
 * Fetches the user's available minutes from Supabase and updates Redux
 * @returns Promise<number | null> - Returns available minutes or null if not found
 */
export async function fetchUserMinutes() {
  try {
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      console.log('User not authenticated, cannot fetch minutes');
      return null;
    }
    
    // Fetch minutes from ai_agent_users table
    const { data: minutesData, error: minutesError } = await supabase
      .from('ai_agent_users')
      .select('purchase_units')
      .eq('user_id', userData.user.id)
      .single();
      
    if (!minutesError && minutesData) {
      const minutes = minutesData.purchase_units || 0;
      // Update Redux store with the available minutes
      store.dispatch(updateUserMinutes(minutes));
      return minutes;
    } else {
      console.log('User minutes not found or error fetching data:', minutesError);
      return null;
    }
  } catch (err) {
    console.error('Error fetching user minutes:', err);
    return null;
  }
}

/**
 * Checks if the user has enough minutes to start an interview
 * @param requiredMinutes - Number of minutes required to start an interview
 * @returns Promise<boolean> - Returns true if user has enough minutes, false otherwise
 */
export async function hasEnoughMinutes(requiredMinutes: number = 1): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      console.log('User not authenticated, cannot check minutes');
      return false;
    }
    
    // Fetch current minutes from ai_agent_users table
    const { data: minutesData, error: minutesError } = await supabase
      .from('ai_agent_users')
      .select('purchase_units')
      .eq('user_id', userData.user.id)
      .single();
      
    if (minutesError || !minutesData) {
      console.log('User minutes not found or error fetching data:', minutesError);
      return false;
    }
    
    const availableMinutes = minutesData.purchase_units || 0;
    
    // Update Redux store with the available minutes
    store.dispatch(updateUserMinutes(availableMinutes));
    
    // Check if user has enough minutes
    return availableMinutes >= requiredMinutes;
  } catch (err) {
    console.error('Error checking user minutes:', err);
    return false;
  }
}

/**
 * Deducts minutes from the user's account when starting an interview
 * @param minutesToDeduct - Number of minutes to deduct
 * @returns Promise<boolean> - Returns true if deduction was successful, false otherwise
 */
export async function deductUserMinutes(minutesToDeduct: number = 1): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      console.log('User not authenticated, cannot deduct minutes');
      return false;
    }
    
    // First, check if user has enough minutes
    const hasMinutes = await hasEnoughMinutes(minutesToDeduct);
    
    if (!hasMinutes) {
      console.log('User does not have enough minutes for this interview');
      return false;
    }
    
    // Fetch current minutes before update
    const { data: currentData } = await supabase
      .from('ai_agent_users')
      .select('purchase_units')
      .eq('user_id', userData.user.id)
      .single();
      
    const currentMinutes = currentData?.purchase_units || 0;
    
    // Update minutes in the database (deducting the required amount)
    const newMinutes = Math.max(0, currentMinutes - minutesToDeduct);
    
    const { error: updateError } = await supabase
      .from('ai_agent_users')
      .update({ purchase_units: newMinutes })
      .eq('user_id', userData.user.id);
      
    if (updateError) {
      console.error('Error updating user minutes:', updateError);
      return false;
    }
    
    // Update Redux store with the new minutes value
    store.dispatch(updateUserMinutes(newMinutes));
    
    console.log(`Successfully deducted ${minutesToDeduct} minutes. Remaining: ${newMinutes}`);
    return true;
  } catch (err) {
    console.error('Error deducting user minutes:', err);
    return false;
  }
}

/**
 * Records interview usage in the database
 * @param minutesUsed - Number of minutes used in the interview
 * @returns Promise<boolean> - Returns true if recording was successful, false otherwise
 */
export async function recordInterviewUsage(minutesUsed: number = 1): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      console.log('User not authenticated, cannot record usage');
      return false;
    }
    
    // Insert a record in the usage_tracking table
    const { error: usageError } = await supabase
      .from('usage_tracking')
      .insert({
        user_id: userData.user.id,
        minutes_used: minutesUsed,
        usage_type: 'interview',
        timestamp: new Date().toISOString()
      });
      
    if (usageError) {
      console.error('Error recording usage:', usageError);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('Error recording interview usage:', err);
    return false;
  }
} 