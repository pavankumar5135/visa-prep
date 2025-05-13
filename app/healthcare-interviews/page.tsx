'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard page
    router.push('/healthcare-interviews/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse mb-4">
          <div className="h-12 w-12 mx-auto rounded-full bg-teal-500"></div>
        </div>
        <h1 className="text-2xl font-semibold text-gray-700">Redirecting to healthcare interviews...</h1>
      </div>
    </div>
  );
} 