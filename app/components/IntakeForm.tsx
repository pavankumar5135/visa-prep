'use client';

import { useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Define schema for form validation
const formSchema = z.object({
  name: z.string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(50, { message: "Name must be less than 50 characters" }),
  role: z.string()
    .min(1, { message: "Please select a role" }),
  visaType: z.string()
    .min(2, { message: "Visa type must be at least 2 characters" })
    .max(20, { message: "Visa type must be less than 20 characters" }),
  originCountry: z.string()
    .min(1, { message: "Please select your origin country" }),
  destinationCountry: z.string()
    .min(1, { message: "Please select your destination country" })
    .refine(val => val !== "", { message: "Please select your destination country" }),
  employer: z.string()
    .min(2, { message: "Employer name must be at least 2 characters" })
    .max(100, { message: "Employer name must be less than 100 characters" }),
  client: z.string()
    .max(100, { message: "Client name must be less than 100 characters" })
    .optional(),
}).refine(
  (data) => data.originCountry !== data.destinationCountry || data.originCountry === "" || data.destinationCountry === "",
  {
    message: "Origin country and destination country cannot be the same",
    path: ["destinationCountry"]
  }
);

// Define form data types
type IntakeFormData = z.infer<typeof formSchema>;

interface IntakeFormProps {
  onSubmit: (formData: IntakeFormData) => void;
  onCancel: () => void;
  initialData?: IntakeFormData | null;
  title?: string;
  submitButtonText?: string;
  showNavLink?: boolean;
}

export default function IntakeForm({ 
  onSubmit, 
  onCancel, 
  initialData,
  title = "Visa Interview Details",
  submitButtonText,
  showNavLink = false
}: IntakeFormProps) {
  const router = useRouter();
  const interviewLinkRef = useRef<HTMLAnchorElement>(null);

  // Initialize form with react-hook-form
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm<IntakeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      role: '',
      visaType: '',
      originCountry: '',
      destinationCountry: '',
      employer: '',
      client: '',
    }
  });

  // Handle form submission
  const onSubmitForm = (data: IntakeFormData) => {
    onSubmit(data);
  };

  // Handle clearing the form
  const handleClearForm = () => {
    reset({
      name: '',
      role: '',
      visaType: '',
      originCountry: '',
      destinationCountry: '',
      employer: '',
      client: '',
    });
  };
  
  // Determine if we're in edit mode
  const isEditMode = !!initialData;

  // Sample countries for dropdowns
  const countries = [
    'United States',
    'Canada',
    'United Kingdom',
    'Australia',
    'India',
    'China',
    'Japan',
    'Germany',
    'France',
    'Brazil',
    'Mexico',
    'South Africa',
    'Nigeria',
    'Russia',
    'South Korea',
    'Philippines',
    'Bangladesh',
    'Italy',
    'Spain',
  ];

  // Sample roles for dropdown
  const roles = [
    'Doctor',
    'Nurse',
    'Pharmacist',
    'Engineer',
    'Software Developer',
    'Business Analyst',
    'Project Manager',
    'Consultant',
    'Researcher',
    'Teacher',
    'Professor',
    'Student',
    'Sales Representative',
    'Marketing Specialist',
    'Executive',
    'Other'
  ];

  // Determine button text based on mode
  const buttonText = submitButtonText || (isEditMode ? 'Save Changes' : 'Start AI Interview');

  return (
    <div className="bg-white rounded-xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-3xl mx-auto transform transition-all w-full">
      {/* Hidden link for direct navigation - only shown if needed */}
      {showNavLink && (
        <Link ref={interviewLinkRef} href="/interview" className="hidden">Navigate to Interview</Link>
      )}
      
      <div className="flex items-center justify-center mb-4 sm:mb-6">
        <div className="bg-blue-600 rounded-full p-2 sm:p-3 mr-2 sm:mr-3">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
      </div>
      
      <p className="text-sm sm:text-base text-gray-600 text-center mb-6 sm:mb-8">
        {isEditMode 
          ? "Update your details to personalize your visa interview practice session."
          : "Please provide your details to personalize your visa interview practice session."}
      </p>
      
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4 sm:space-y-6">
        <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Name Input */}
          <div className="col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <input
                type="text"
                id="name"
                {...register("name")}
                className={`w-full pl-10 pr-4 py-2 border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg focus:ring-2 transition-colors text-sm sm:text-base`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Role Dropdown */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Your Role
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <select
                id="role"
                {...register("role")}
                className={`w-full pl-10 pr-10 py-2 border ${errors.role ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg appearance-none focus:ring-2 bg-white transition-colors`}
              >
                <option value="" disabled>Select your role</option>
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          {/* Visa Type Text Input */}
          <div>
            <label htmlFor="visaType" className="block text-sm font-medium text-gray-700 mb-1">
              Visa Type
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <input
                type="text"
                id="visaType"
                {...register("visaType")}
                className={`w-full pl-10 pr-4 py-2 border ${errors.visaType ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg focus:ring-2 transition-colors`}
                placeholder="Enter visa type (e.g. B1, H-1B)"
              />
            </div>
            {errors.visaType && (
              <p className="mt-1 text-sm text-red-600">{errors.visaType.message}</p>
            )}
          </div>

          {/* Origin Country Dropdown */}
          <div>
            <label htmlFor="originCountry" className="block text-sm font-medium text-gray-700 mb-1">
              Origin Country
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                </svg>
              </div>
              <select
                id="originCountry"
                {...register("originCountry")}
                className={`w-full pl-10 pr-10 py-2 border ${errors.originCountry ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg appearance-none focus:ring-2 bg-white transition-colors`}
              >
                <option value="" disabled>Select your country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.originCountry && (
              <p className="mt-1 text-sm text-red-600">{errors.originCountry.message}</p>
            )}
          </div>

          {/* Destination Country Dropdown */}
          <div>
            <label htmlFor="destinationCountry" className="block text-sm font-medium text-gray-700 mb-1">
              Destination Country
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <select
                id="destinationCountry"
                {...register("destinationCountry")}
                className={`w-full pl-10 pr-10 py-2 border ${errors.destinationCountry ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg appearance-none focus:ring-2 bg-white transition-colors`}
              >
                <option value="" disabled>Select destination country</option>
                {countries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.destinationCountry && (
              <p className="mt-1 text-sm text-red-600">{errors.destinationCountry.message}</p>
            )}
          </div>

          {/* Employer Input */}
          <div>
            <label htmlFor="employer" className="block text-sm font-medium text-gray-700 mb-1">
              Your Employer or College Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <input
                type="text"
                id="employer"
                {...register("employer")}
                className={`w-full pl-10 pr-4 py-2 border ${errors.employer ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg focus:ring-2 transition-colors`}
                placeholder="Enter employer or college name"
              />
            </div>
            {errors.employer && (
              <p className="mt-1 text-sm text-red-600">{errors.employer.message}</p>
            )}
          </div>

          {/* Client Input (Optional) */}
          <div>
            <label htmlFor="client" className="block text-sm font-medium text-gray-700 mb-1">
              Your Client <span className="text-xs text-gray-500">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="client"
                {...register("client")}
                className={`w-full pl-10 pr-4 py-2 border ${errors.client ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg focus:ring-2 transition-colors`}
                placeholder="Enter your client's name (optional)"
              />
            </div>
            {errors.client && (
              <p className="mt-1 text-sm text-red-600">{errors.client.message}</p>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="pt-4 sm:pt-6 border-t border-gray-200 mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
            <div className="flex flex-row gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="w-full xs:w-auto px-8 py-3 border border-gray-300 rounded-2xl shadow-sm text-lg font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleClearForm}
                  className="w-full xs:w-auto px-8 py-3 border border-gray-300 rounded-2xl shadow-sm text-lg font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
            
            <button
              type="submit"
              className="w-full sm:w-auto px-8 py-3 rounded-2xl shadow-md text-lg font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all transform hover:scale-105 mt-2 sm:mt-0 flex items-center justify-center"
              style={{
                background: 'linear-gradient(to right, #4f46e5, #3b82f6)',
              }}
            >
              <span>{buttonText}</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
} 