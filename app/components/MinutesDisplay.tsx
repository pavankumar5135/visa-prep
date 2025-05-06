'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { fetchUserMinutes } from '@/app/utils/api/userApi';

interface MinutesDisplayProps {
  className?: string;
  showLabel?: boolean;
  variant?: 'full' | 'compact';
}

export default function MinutesDisplay({ 
  className = '', 
  showLabel = true,
  variant = 'full'
}: MinutesDisplayProps) {
  // Get minutes from Redux store
  const minutes = useSelector((state: RootState) => state.auth.user?.minutes || 0);
  
  // Fetch minutes on component mount
  useEffect(() => {
    const loadMinutes = async () => {
      await fetchUserMinutes();
    };
    
    loadMinutes();
  }, []);
  
  // Format minutes for display
  const formattedMinutes = minutes.toLocaleString();
  
  if (variant === 'compact') {
    return (
      <div className={`flex items-center ${className}`}>
        <div className="px-2 py-1 bg-teal-100 text-teal-800 rounded-md text-xs font-semibold flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {formattedMinutes}m
        </div>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="bg-white rounded-lg shadow-sm p-3 flex items-center">
        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          {showLabel && <p className="text-xs text-gray-500 font-medium">MINUTES AVAILABLE</p>}
          <p className="text-lg font-bold text-gray-900">{formattedMinutes}</p>
        </div>
      </div>
    </div>
  );
} 