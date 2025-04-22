'use client';

import { useEffect, useState } from 'react';

interface PreloaderProps {
  minimumLoadTimeMs?: number;
}

export function Preloader({ minimumLoadTimeMs = 1000 }: PreloaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const interval = setInterval(() => {
      setProgress(prev => {
        const newValue = prev + (100 - prev) * 0.1;
        return Math.min(newValue, 99); // Never quite reach 100 until actually loaded
      });
    }, 100);

    // Ensure the preloader shows for at least the minimum time
    const timer = setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      
      // Add a small delay after reaching 100% before hiding
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }, minimumLoadTimeMs);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [minimumLoadTimeMs]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center p-6 max-w-sm w-full">
        <div className="relative h-24 w-24 mb-8">
          {/* Main spinner */}
          <div className="absolute inset-0 rounded-full border-4 border-t-blue-600 border-r-blue-300 border-b-blue-100 border-l-blue-300 animate-spin"></div>
          
          {/* Inner circle */}
          <div className="absolute top-3 left-3 right-3 bottom-3 rounded-full border-2 border-blue-200"></div>
          
          {/* Center logo/icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">B1</span>
          </div>
        </div>
        
        <div className="w-full mb-8">
          {/* Progress bar */}
          <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-600 transition-all duration-300 ease-out rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <p className="mt-2 text-xs text-right text-gray-400">{Math.round(progress)}%</p>
        </div>
        
        <div className="text-center">
          <h2 className="text-xl font-semibold text-blue-600">B1Prep AI</h2>
          <p className="mt-2 text-sm text-gray-500">
            Preparing your visa interview coach...
          </p>
        </div>
      </div>
    </div>
  );
} 