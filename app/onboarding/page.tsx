'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

export default function Onboarding() {
  const router = useRouter();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [purpose, setPurpose] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [interviewDate, setInterviewDate] = useState('');
  const [userName, setUserName] = useState('');
  const [nationality, setNationality] = useState('');
  const [concerns, setConcerns] = useState<string[]>([]);
  const [previousAttempts, setPreviousAttempts] = useState('0');
  
  const steps = [
    {
      id: 1,
      title: 'Welcome to B1 Visa Prep!',
      description: 'Let\'s get you set up with your personalized B1 visa interview preparation plan.',
    },
    {
      id: 2,
      title: 'Tell us about yourself',
      description: 'This helps us personalize your practice experience.',
    },
    {
      id: 3,
      title: 'What\'s your purpose for visiting the US?',
      description: 'This helps us tailor practice scenarios to your specific situation.',
    },
    {
      id: 4,
      title: 'What\'s your interview preparation level?',
      description: 'We\'ll adjust the difficulty of practice questions based on your experience.',
    },
    {
      id: 5,
      title: 'What concerns you most?',
      description: 'We\'ll focus on addressing your specific worries during practice sessions.',
    },
    {
      id: 6,
      title: 'When is your interview?',
      description: 'We\'ll help you create a preparation schedule that fits your timeline.',
    },
    {
      id: 7,
      title: 'All set!',
      description: 'Your personalized interview preparation experience is ready.',
    },
  ];

  const handleNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save user data before redirecting
      const userData = {
        purpose,
        experienceLevel,
        interviewDate,
        userName,
        nationality,
        concerns,
        previousAttempts
      };
      
      // Could save to localStorage or context here
      localStorage.setItem('userPreferences', JSON.stringify(userData));
      
      router.push('/dashboard');
    }
  };

  const handleBackStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const purposeOptions = [
    { id: 'business_meeting', label: 'Business Meetings/Negotiations', icon: '💼' },
    { id: 'conference', label: 'Conference or Convention', icon: '🎤' },
    { id: 'consultation', label: 'Professional Consultation', icon: '👥' },
    { id: 'training', label: 'Training Program', icon: '🎓' },
    { id: 'visiting_clients', label: 'Visiting Clients/Partners', icon: '🤝' },
    { id: 'other', label: 'Other Business Activities', icon: '📋' },
  ];

  const experienceLevelOptions = [
    { id: 'beginner', label: 'Beginner - First time applying', icon: '🔰' },
    { id: 'intermediate', label: 'Intermediate - Some knowledge about the process', icon: '📚' },
    { id: 'advanced', label: 'Advanced - Previous visa application experience', icon: '🎯' },
  ];
  
  const concernOptions = [
    'Answering difficult questions',
    'Providing sufficient documentation',
    'Demonstrating ties to home country',
    'Explaining purpose of visit clearly',
    'Speaking confidently in English',
    'Handling unexpected questions',
    'Proving financial stability',
    'Discussing previous travel history'
  ];
  
  const popularNationalities = [
    'India', 'China', 'Philippines', 'Mexico', 'Brazil', 
    'Colombia', 'Vietnam', 'Nigeria', 'Pakistan', 'Other'
  ];

  const toggleConcern = (concern: string) => {
    if (concerns.includes(concern)) {
      setConcerns(concerns.filter(c => c !== concern));
    } else {
      setConcerns([...concerns, concern]);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center">
                <div 
                  className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                    step.id < currentStep 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : step.id === currentStep 
                        ? 'border-blue-600 text-blue-600' 
                        : 'border-gray-300 text-gray-300'
                  }`}
                >
                  {step.id < currentStep ? (
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <span>{step.id}</span>
                  )}
                </div>
                {step.id < steps.length && (
                  <div className={`hidden sm:block w-full h-0.5 ${step.id < currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
        
        {/* Step Content */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              {steps[currentStep - 1].title}
            </h1>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              {steps[currentStep - 1].description}
            </p>
            
            {/* Step 1: Welcome */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 sm:p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm sm:text-base font-medium text-blue-800">Hello, {user?.name || 'there'}!</h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p>We're going to help you prepare for your B1 visa interview by creating custom practice scenarios based on your specific situation.</p>
                        <p className="mt-2">This short onboarding will help us personalize your experience perfectly.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg p-4 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">What you'll get:</h3>
                  <ul className="space-y-3">
                    {[
                      'Personalized mock interviews with AI',
                      'Detailed feedback on your responses',
                      'Progress tracking and performance analytics',
                      'Access to B1 visa resources and guides',
                      'Custom preparation plan based on your timeline',
                      'Practice focused on your specific concerns'
                    ].map((item, i) => (
                      <li key={i} className="flex items-start">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="ml-2 text-sm sm:text-base text-gray-700">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {/* Step 2: User Details */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid gap-5">
                  <div>
                    <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
                      What should we call you?
                    </label>
                    <input
                      type="text"
                      id="userName"
                      value={userName}
                      onChange={(e) => setUserName(e.target.value)}
                      placeholder="Your name"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="nationality" className="block text-sm font-medium text-gray-700 mb-1">
                      What is your nationality?
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3">
                      {popularNationalities.map((nat) => (
                        <button
                          key={nat}
                          type="button"
                          onClick={() => setNationality(nat)}
                          className={`py-2 px-3 text-sm rounded-md border ${nationality === nat ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}
                        >
                          {nat}
                        </button>
                      ))}
                    </div>
                    {nationality === 'Other' && (
                      <input
                        type="text"
                        value={nationality === 'Other' ? '' : nationality}
                        onChange={(e) => setNationality(e.target.value)}
                        placeholder="Please specify"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="previousAttempts" className="block text-sm font-medium text-gray-700 mb-1">
                      How many times have you applied for a US visa before?
                    </label>
                    <div className="flex space-x-3">
                      {['0', '1', '2', '3', '4+'].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => setPreviousAttempts(num)}
                          className={`py-2 px-4 text-sm rounded-md border ${previousAttempts === num ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300 hover:bg-gray-50'}`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Step 3: Purpose */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">Select the option that best describes your purpose for visiting the US:</p>
                <div className="grid gap-3">
                  {purposeOptions.map((option) => (
                    <div key={option.id}>
                      <label
                        className={`block relative p-4 border rounded-lg cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 ${
                          purpose === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="purpose"
                          value={option.id}
                          checked={purpose === option.id}
                          onChange={() => setPurpose(option.id)}
                          className="sr-only"
                        />
                        <div className="flex items-center">
                          <div className="mr-3 text-xl" aria-hidden="true">{option.icon}</div>
                          <div className={`rounded-full w-5 h-5 flex items-center justify-center border ${
                            purpose === option.id ? 'border-blue-500' : 'border-gray-400'
                          }`}>
                            {purpose === option.id && (
                              <div className="rounded-full w-3 h-3 bg-blue-500" />
                            )}
                          </div>
                          <span className="ml-3 font-medium text-gray-900">{option.label}</span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 4: Experience Level */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">What is your level of experience with visa interviews?</p>
                <div className="grid gap-3">
                  {experienceLevelOptions.map((option) => (
                    <div key={option.id}>
                      <label
                        className={`block relative p-4 border rounded-lg cursor-pointer focus-within:ring-2 focus-within:ring-blue-500 ${
                          experienceLevel === option.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="experienceLevel"
                          value={option.id}
                          checked={experienceLevel === option.id}
                          onChange={() => setExperienceLevel(option.id)}
                          className="sr-only"
                        />
                        <div className="flex items-center">
                          <div className="mr-3 text-xl" aria-hidden="true">{option.icon}</div>
                          <div className={`rounded-full w-5 h-5 flex items-center justify-center border ${
                            experienceLevel === option.id ? 'border-blue-500' : 'border-gray-400'
                          }`}>
                            {experienceLevel === option.id && (
                              <div className="rounded-full w-3 h-3 bg-blue-500" />
                            )}
                          </div>
                          <span className="ml-3 font-medium text-gray-900">{option.label}</span>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Step 5: Concerns */}
            {currentStep === 5 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">Select your top concerns about the visa interview (choose up to 3):</p>
                <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                  {concernOptions.map((concern) => (
                    <div key={concern}>
                      <button
                        type="button"
                        onClick={() => toggleConcern(concern)}
                        disabled={concerns.length >= 3 && !concerns.includes(concern)}
                        className={`w-full p-3 text-left border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          concerns.includes(concern) 
                            ? 'border-blue-500 bg-blue-50 text-blue-700' 
                            : concerns.length >= 3 
                              ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                              : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`rounded-full w-5 h-5 flex items-center justify-center border ${
                            concerns.includes(concern) ? 'border-blue-500' : 'border-gray-400'
                          }`}>
                            {concerns.includes(concern) && (
                              <svg className="w-3 h-3 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <span className="ml-3 font-medium text-sm">{concern}</span>
                        </div>
                      </button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-600 italic mt-2">
                  {concerns.length} of 3 selected
                </p>
              </div>
            )}
            
            {/* Step 6: Interview Date */}
            {currentStep === 6 && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500 mb-4">When is your scheduled interview date? (If known)</p>
                <div className="max-w-md">
                  <input
                    type="date"
                    value={interviewDate}
                    onChange={(e) => setInterviewDate(e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    min={new Date().toISOString().split('T')[0]}
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    This helps us create a preparation schedule. Don't worry if you don't have a date yet.
                  </p>
                  
                  {interviewDate && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                      <h4 className="text-sm font-medium text-blue-800">Your preparation timeline</h4>
                      <div className="mt-3 space-y-2">
                        {[
                          { days: 30, activity: 'Research documentation requirements' },
                          { days: 20, activity: 'Begin practicing common questions' },
                          { days: 10, activity: 'Daily mock interviews' },
                          { days: 3, activity: 'Final review and confidence building' }
                        ].map((item, i) => {
                          const targetDate = interviewDate 
                            ? new Date(new Date(interviewDate).getTime() - (item.days * 24 * 60 * 60 * 1000))
                            : null;
                          return (
                            <div key={i} className="flex items-center text-sm">
                              <div className="w-2 h-2 rounded-full bg-blue-600 mr-2"></div>
                              <div className="text-blue-700 font-medium mr-2">
                                {targetDate ? targetDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `${item.days} days before`}:
                              </div>
                              <div className="text-blue-600">{item.activity}</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Step 7: All Set */}
            {currentStep === 7 && (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                  <svg className="w-8 h-8 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">Perfect! You're all set, {userName || 'there'}!</h3>
                <p className="text-gray-600 mb-6">
                  We've created your personalized B1 visa interview preparation plan. You're now ready to start practicing.
                </p>
                
                <div className="bg-blue-50 rounded-lg p-4 max-w-md mx-auto">
                  <h4 className="font-medium text-blue-800 mb-3">Your Personalized Setup:</h4>
                  <ul className="text-left space-y-2 text-sm text-blue-700">
                    <li className="flex">
                      <span className="font-medium mr-2">Purpose:</span> 
                      <span>{purposeOptions.find(p => p.id === purpose)?.label || 'Not specified'}</span>
                    </li>
                    {nationality && (
                      <li className="flex">
                        <span className="font-medium mr-2">Nationality:</span> 
                        <span>{nationality}</span>
                      </li>
                    )}
                    {concerns.length > 0 && (
                      <li>
                        <span className="font-medium">Top concerns:</span> 
                        <ul className="list-disc ml-5 mt-1 space-y-1">
                          {concerns.map(concern => (
                            <li key={concern}>{concern}</li>
                          ))}
                        </ul>
                      </li>
                    )}
                    {interviewDate && (
                      <li className="flex">
                        <span className="font-medium mr-2">Interview date:</span> 
                        <span>{new Date(interviewDate).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</span>
                      </li>
                    )}
                  </ul>
                </div>
                
                <div className="mt-6 max-w-md mx-auto">
                  <h4 className="font-medium text-gray-800 mb-2">What's next?</h4>
                  <ol className="list-decimal list-inside text-sm text-gray-700 space-y-2">
                    <li>Start your first mock interview</li>
                    <li>Review feedback and areas for improvement</li>
                    <li>Practice regularly with different scenarios</li>
                    <li>Track your progress in the dashboard</li>
                  </ol>
                </div>
              </div>
            )}
          </div>
          
          {/* Footer with navigation buttons */}
          <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-between">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={handleBackStep}>
                Back
              </Button>
            ) : (
              <div></div>
            )}
            <Button 
              onClick={handleNextStep}
              disabled={(currentStep === 3 && !purpose) || (currentStep === 4 && !experienceLevel)}
            >
              {currentStep === steps.length ? 'Go to Dashboard' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 