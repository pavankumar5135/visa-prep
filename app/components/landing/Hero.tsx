'use client';

import Link from 'next/link';
import { Button } from '../ui/Button';

export function Hero() {
  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background accent */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -top-24 -right-20 w-96 h-96 rounded-full bg-blue-50"></div>
        <div className="absolute top-1/2 -left-20 w-64 h-64 rounded-full bg-blue-50"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-6 xl:col-span-5">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block xl:inline">Ace your B1 Visa</span>{' '}
              <span className="block text-blue-600 xl:inline">Interview with AI</span>
            </h1>
            <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg lg:text-xl">
              Practice with our realistic AI-powered mock interview simulator and get real-time feedback. Increase your chances of success with personalized coaching.
            </p>
            
            <div className="mt-8 sm:mt-10 sm:flex sm:justify-start">
              <div className="rounded-md shadow">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Free Practice
                  </Button>
                </Link>
              </div>
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Link href="/#how-it-works">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    How It Works
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="mt-6 sm:mt-8">
              <div className="flex items-center">
                <div className="flex -space-x-1 overflow-hidden">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <img
                      key={i}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
                      src={`https://randomuser.me/api/portraits/men/${i + 10}.jpg`}
                      alt=""
                    />
                  ))}
                </div>
                <div className="ml-3 text-sm font-medium text-gray-500">
                  Joined by <span className="font-semibold text-blue-600">5,000+</span> applicants
                </div>
              </div>
              
              <div className="mt-3 flex items-center text-sm text-gray-500">
                <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>93% approval rate after practicing with our AI</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12 relative lg:mt-0 lg:col-span-6 xl:col-span-7">
            <div className="relative mx-auto w-full rounded-lg shadow-lg lg:max-w-md">
              <div className="relative block w-full bg-white sm:rounded-lg overflow-hidden">
                <img
                  className="w-full"
                  src="/visa-interview.png"
                  alt="B1 Visa Interview Practice"
                />
                <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                  <Link href="/#video">
                    <button className="flex items-center justify-center h-16 w-16 rounded-full bg-white/90 shadow-md hover:bg-white transition-colors">
                      <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 