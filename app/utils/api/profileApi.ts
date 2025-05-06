import { createClient } from '@/app/utils/supabase/client';
import { updateUserFirstName } from '@/app/store/slices/authSlice';
import { store } from '@/app/store';

/**
 * Fetches the user's profile data from Supabase and updates the Redux store
 * @returns Promise<string | null> - Returns the first name or null if not found
 */
export async function fetchUserProfile() {
  try {
    const supabase = createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError || !userData?.user) {
      console.log('User not authenticated, cannot fetch profile');
      return null;
    }
    
    // Fetch user profile to get first name
    const { data: profileData, error: profileError } = await supabase
      .from('profile')
      .select('first_name')
      .eq('id', userData.user.id)
      .single();
      
    if (!profileError && profileData && profileData.first_name) {
      // Update Redux store with the first name
      store.dispatch(updateUserFirstName(profileData.first_name));
      return profileData.first_name;
    } else {
      console.log('Profile not found or error fetching profile:', profileError);
      return null;
    }
  } catch (err) {
    console.error('Error fetching user profile:', err);
    return null;
  }
} 