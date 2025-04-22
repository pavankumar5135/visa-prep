'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-100 py-4 px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold text-blue-600">B1Prep</span>
          <span className="ml-1 p-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">AI</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:justify-center flex-1 max-w-2xl mx-auto">
          <div className="flex justify-center space-x-8">
            <Link 
              href="/#features" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors whitespace-nowrap"
            >
              Features
            </Link>
            <Link 
              href="/#how-it-works" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors whitespace-nowrap"
            >
              How It Works
            </Link>
            <Link 
              href="/#pricing" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors whitespace-nowrap"
            >
              Pricing
            </Link>
            <Link 
              href="/#faq" 
              className="text-gray-700 hover:text-blue-600 font-medium transition-colors whitespace-nowrap"
            >
              FAQ
            </Link>
          </div>
        </div>

        {/* Auth Buttons - Desktop */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <Link href="/dashboard">
              <Button size="sm" className="whitespace-nowrap">Go to Dashboard</Button>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" size="sm" className="whitespace-nowrap">Log In</Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="whitespace-nowrap">Sign Up Free</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden pt-4 pb-3 border-t border-gray-100 mt-3">
          <div className="flex flex-col gap-3 px-2">
            <Link 
              href="/#features" 
              className="px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/#how-it-works" 
              className="px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <Link 
              href="/#pricing" 
              className="px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link 
              href="/#faq" 
              className="px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100 hover:text-blue-600"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>

            <div className="border-t border-gray-100 my-2"></div>

            {user ? (
              <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                <Button fullWidth>Go to Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" fullWidth>Log In</Button>
                </Link>
                <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                  <Button fullWidth>Sign Up Free</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
} 