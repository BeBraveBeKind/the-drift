'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminDashboard from '@/components/admin/AdminDashboard'

export default function AdminPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [])

  async function checkAuth() {
    const session = await getSession()
    
    if (!session) {
      router.push('/admin/login')
    } else {
      setIsAuthenticated(true)
    }
    
    setIsLoading(false)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#C4A574] flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <AdminDashboard />
}