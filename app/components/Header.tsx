'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/app/utils/supabase/client';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import MinutesDisplay from './MinutesDisplay';

interface HeaderProps {
  onAuthClick?: () => void;
  title?: string;
  subtitle?: string;
  type?: 'visa' | 'healthcare';
}

export default function Header({ 
  onAuthClick,
  title = "Visa Interview Preparation",
  subtitle = "Practice your visa interview skills with AI",
  type = "visa"
}: HeaderProps) {
  const [supabaseUser, setSupabaseUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Get first name from Redux store
  const userFirstName = useSelector((state: RootState) => state.auth.user?.firstName);
  
  // Check Supabase Authentication and fetch user profile
  useEffect(() => {
    async function checkAuth() {
      try {
        const supabase = createClient();
        const { data, error } = await supabase.auth.getUser();
        
        if (!error && data?.user) {
          setSupabaseUser(data.user);
        }
      } catch (err) {
        console.error('Header authentication check error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    
    checkAuth();
  }, []);

  // Get display name - always use email in header
  const getDisplayName = () => {
    if (supabaseUser?.email) return supabaseUser.email;
    return 'User';
  };

  // Get initials for avatar - always use email initial in header
  const getInitials = () => {
    if (supabaseUser?.email) return supabaseUser.email.charAt(0).toUpperCase();
    return 'U';
  };
  
  // Determine color theme based on type
  const primaryColor = 'blue';

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">
                <span className={`text-${primaryColor}-600`}>CaresLink</span>
                <span className={`ml-1 p-1 bg-${primaryColor}-100 text-${primaryColor}-800 text-xs font-medium rounded`}>AI</span>
              </h1>
            </div>
            {(title || subtitle) && (
              <div className="hidden md:block ml-6 pl-6 border-l border-gray-200">
                {title && <h2 className="text-sm font-medium text-gray-900">{title}</h2>}
                {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
              </div>
            )}
          </div>
          
          {!isLoading && (
            <div className="flex items-center">
              {supabaseUser ? (
                <div className="flex items-center">
                  <div className="hidden sm:flex text-right mr-4">
                    <div>
                      <p className="text-xs text-gray-500">LOGGED IN AS</p>
                      <p className="text-sm font-medium text-gray-900">{getDisplayName()}</p>
                    </div>
                  </div>
                  <div className={`h-8 w-8 rounded-full bg-${primaryColor}-100 flex items-center justify-center`}>
                    <span className={`text-${primaryColor}-800 font-medium`}>
                      {getInitials()}
                    </span>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onAuthClick}
                  className={`inline-flex items-center px-3 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${primaryColor}-600 hover:bg-${primaryColor}-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${primaryColor}-500`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Auth Info
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 