'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/app/utils/supabase/client'

// Create a separate component to use searchParams
function TokenHandlerContent() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const redirectTo = searchParams.get('redirect') || '/dashboard'

  useEffect(() => {
    async function handleToken() {
      try {
        setLoading(true)
        
        if (!token) {
          throw new Error('No token provided')
        }
        
        const supabase = createClient()
        
        // Set session using the JWT token
        const { error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: token, // This might not be correct, depending on your token structure
        })
        
        if (error) {
          throw error
        }
        
        // Successful authentication, redirect to intended page
        router.push(redirectTo)
      } catch (err: any) {
        console.error('Error setting session with token:', err)
        setError(err.message || 'Failed to authenticate')
        // Redirect to dashboard with error message after a delay
        setTimeout(() => {
          const dashboardUrl = new URL('/dashboard', window.location.origin)
          dashboardUrl.searchParams.set('auth_error', 'Token authentication failed: ' + (err.message || 'Unknown error'))
          router.push(dashboardUrl.toString())
        }, 3000)
      } finally {
        setLoading(false)
      }
    }
    
    handleToken()
  }, [token, redirectTo, router])
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {loading ? (
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
      ) : error ? (
        <div className="text-red-500 text-center">
          <h3 className="text-xl font-bold mb-2">Authentication Error</h3>
          <p>{error}</p>
          <p className="mt-4">Redirecting to dashboard...</p>
        </div>
      ) : (
        <div className="text-center">
          <h3 className="text-xl font-bold mb-2">Authentication Successful</h3>
          <p>Redirecting...</p>
        </div>
      )}
    </div>
  )
}

// Main component with Suspense boundary
export default function TokenHandler() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600 mb-4"></div>
        <p>Loading authentication handler...</p>
      </div>
    }>
      <TokenHandlerContent />
    </Suspense>
  )
} 