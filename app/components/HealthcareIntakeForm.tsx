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
  jobDescription: z.string()
    .min(2, { message: "Job description must be at least 2 characters" })
    .max(2000, { message: "Job description must be less than 2000 characters" }),
  role: z.string()
    .min(2, { message: "Role must be at least 2 characters" })
    .max(100, { message: "Role must be less than 100 characters" }),
  businessUnit: z.string()
    .min(2, { message: "Business unit must be at least 2 characters" })
    .max(100, { message: "Business unit must be less than 100 characters" }),
  careSpeciality: z.string()
    .min(2, { message: "Care speciality must be at least 2 characters" })
    .max(100, { message: "Care speciality must be less than 100 characters" }),
  yearsExperience: z.string()
    .min(1, { message: "Please select your years of experience" }),
  employer: z.string()
    .min(2, { message: "Employer name must be at least 2 characters" })
    .max(100, { message: "Employer name must be less than 100 characters" }),
  location: z.string()
    .min(2, { message: "Location must be at least 2 characters" })
    .max(100, { message: "Location must be less than 100 characters" }),
});

// Define form data types
type HealthcareIntakeFormData = z.infer<typeof formSchema>;

interface HealthcareIntakeFormProps {
  onSubmit: (data: HealthcareIntakeFormData) => void;
  onCancel?: () => void;
  initialData?: HealthcareIntakeFormData;
  title?: string;
  submitButtonText?: string;
  showNavLink?: boolean;
}

export default function HealthcareIntakeForm({ 
  onSubmit, 
  onCancel, 
  initialData,
  title = "Healthcare Interview Details",
  submitButtonText,
  showNavLink = false
}: HealthcareIntakeFormProps) {
  const router = useRouter();
  const interviewLinkRef = useRef<HTMLAnchorElement>(null);

  // Initialize form with react-hook-form
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm<HealthcareIntakeFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      jobDescription: '',
      role: '',
      businessUnit: '',
      careSpeciality: '',
      yearsExperience: '',
      employer: '',
      location: '',
    }
  });

  // Handle form submission
  const onSubmitForm = (data: HealthcareIntakeFormData) => {
    onSubmit(data);
  };

  // Handle clearing the form
  const handleClearForm = () => {
    reset({
      name: '',
      jobDescription: '',
      role: '',
      businessUnit: '',
      careSpeciality: '',
      yearsExperience: '',
      employer: '',
      location: '',
    });
  };
  
  // Determine if we're in edit mode
  const isEditMode = !!initialData;

  // Healthcare professions for dropdown
  const professions = [
    'Physician',
    'Nurse',
    'Nurse Practitioner',
    'Physician Assistant',
    'Pharmacist',
    'Physical Therapist',
    'Occupational Therapist',
    'Respiratory Therapist',
    'Dietitian',
    'Medical Technologist',
    'Radiologic Technologist',
    'Medical Assistant',
    'Dental Hygienist',
    'Dentist',
    'Optometrist',
    'Psychologist',
    'Social Worker',
    'Healthcare Administrator',
    'Other'
  ];

  // Healthcare roles for dropdown
  const roles = [
    'HHA',
    'Caregiver',
    'CNA',
    'LPN',
    'RN',
    'APRN',
    'Staff Nurse',
    'Senior Staff Nurse',
    'Nurse Incharge',
    'Nurse Manager',
    'Head of Nursing Services',
    'Director of Nursing',
    'Executive Leadership'
  ];

  // Business units for dropdown
  const businessUnits = [
    'Home Care',
    'In-Home Day Care',
    'Adult Day Care',
    'Assisted Living',
    'Rehab Center',
    'Hospitals',
    'Clinics',
    'Urgent Cares',
    'FSE Clinics',
    'Nursing Homes',
    'Hospitals - Acute Care',
    'Hospitals - Critical Care',
    'Hospitals - Emergency',
    'Hospitals - ICU',
    'Hospitals - Medical/Surgical',
    'Hospitals - Pediatrics',
    'Hospitals - Rehabilitation',
    'LTC/SNF'
  ];

  // Care specialties for dropdown
  const careSpecialties = [
    'Acute Care Float',
    'Administrative',
    'Ambulatory Care',
    'Anesthetist',
    'Antepartum',
    'Apheresis',
    'Bariatrics',
    'Behavioral Health',
    'BICU',
    'BMT',
    'Cardiac Rehab',
    'Cardiac Stress Testing',
    'Cardiac Tele',
    'Cardio Thoracic ICU',
    'Case Manager',
    'Cath Lab',
    'Cath Lab Holding',
    'CCU',
    'Certified School Nurse',
    'Chemo',
    'Child Abuse Program Nurse SART',
    'Clinical Decisions',
    'Clinical Education Specialist',
    'Clinical Program Coordinator',
    'Clinical Research Nurse',
  ];

  // Years of experience options
  const experienceLevels = [
    'Less than 1 year',
    '1-2 years',
    '3-5 years',
    '6-10 years',
    'More than 10 years'
  ];

  // Determine button text based on mode
  const buttonText = submitButtonText || (isEditMode ? 'Save Changes' : 'Start AI Interview');

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">{title}</h2>
        <p className="mt-2 text-gray-600">Please provide details for your healthcare interview preparation</p>
      </div>
      
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
                className={`w-full pl-10 pr-4 py-2 border ${errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-lg focus:ring-2 transition-colors text-sm sm:text-base`}
                placeholder="Enter your full name"
              />
            </div>
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          {/* Job Description Text Input */}
          <div className="col-span-2">
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Job Description
            </label>
            <div className="relative">
              <textarea
                id="jobDescription"
                {...register("jobDescription")}
                className={`w-full p-3 border ${errors.jobDescription ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-lg focus:ring-2 transition-colors`}
                placeholder="Enter detailed job description"
                rows={4}
              ></textarea>
            </div>
            {errors.jobDescription && (
              <p className="mt-1 text-sm text-red-600">{errors.jobDescription.message}</p>
            )}
          </div>

          {/* Role Dropdown */}
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <select
                id="role"
                {...register("role")}
                className={`w-full pl-10 pr-10 py-2 border ${errors.role ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-lg appearance-none focus:ring-2 bg-white transition-colors`}
              >
                <option value="" disabled>Select role</option>
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

          {/* Business Unit Dropdown */}
          <div>
            <label htmlFor="businessUnit" className="block text-sm font-medium text-gray-700 mb-1">
              Business Unit
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <select
                id="businessUnit"
                {...register("businessUnit")}
                className={`w-full pl-10 pr-10 py-2 border ${errors.businessUnit ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-lg appearance-none focus:ring-2 bg-white transition-colors`}
              >
                <option value="" disabled>Select business unit</option>
                {businessUnits.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.businessUnit && (
              <p className="mt-1 text-sm text-red-600">{errors.businessUnit.message}</p>
            )}
          </div>

          {/* Care Speciality Dropdown */}
          <div>
            <label htmlFor="careSpeciality" className="block text-sm font-medium text-gray-700 mb-1">
              Care Speciality
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <select
                id="careSpeciality"
                {...register("careSpeciality")}
                className={`w-full pl-10 pr-10 py-2 border ${errors.careSpeciality ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-lg appearance-none focus:ring-2 bg-white transition-colors`}
              >
                <option value="" disabled>Select care specialty</option>
                {careSpecialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.careSpeciality && (
              <p className="mt-1 text-sm text-red-600">{errors.careSpeciality.message}</p>
            )}
          </div>

          {/* Years Experience Dropdown */}
          <div>
            <label htmlFor="yearsExperience" className="block text-sm font-medium text-gray-700 mb-1">
              Years of Experience
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <select
                id="yearsExperience"
                {...register("yearsExperience")}
                className={`w-full pl-10 pr-10 py-2 border ${errors.yearsExperience ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-lg appearance-none focus:ring-2 bg-white transition-colors`}
              >
                <option value="" disabled>Select years of experience</option>
                {experienceLevels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            {errors.yearsExperience && (
              <p className="mt-1 text-sm text-red-600">{errors.yearsExperience.message}</p>
            )}
          </div>

          {/* Employer Input */}
          <div>
            <label htmlFor="employer" className="block text-sm font-medium text-gray-700 mb-1">
              Employer / Organization
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
                className={`w-full pl-10 pr-4 py-2 border ${errors.employer ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-lg focus:ring-2 transition-colors`}
                placeholder="Enter employer or organization name"
              />
            </div>
            {errors.employer && (
              <p className="mt-1 text-sm text-red-600">{errors.employer.message}</p>
            )}
          </div>

          {/* Location Input */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="location"
                {...register("location")}
                className={`w-full pl-10 pr-4 py-2 border ${errors.location ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'} rounded-lg focus:ring-2 transition-colors`}
                placeholder="Enter location (e.g. Boston, MA)"
              />
            </div>
            {errors.location && (
              <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
            )}
          </div>
        </div>

        <div className="pt-2 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={handleClearForm}
              className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Clear Form
            </button>
          </div>
          <button
            type="submit"
            className="flex items-center justify-center py-2 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
          >
            {buttonText}
            <svg xmlns="http://www.w3.org/2000/svg" className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
} 