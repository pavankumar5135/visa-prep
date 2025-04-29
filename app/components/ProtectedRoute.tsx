'use client';

import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  // Simply render the children without any auth checks
  return <>{children}</>;
} 