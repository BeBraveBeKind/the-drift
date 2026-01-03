'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// For MVP, we only have Viroqua, so let's redirect there automatically
// Later we can expand this to show a town picker

export default function LandingPage() {
  const router = useRouter()
  
  useEffect(() => {
    // Auto-redirect to Viroqua for MVP
    router.push('/viroqua')
  }, [router])
  
  return (
    <main className="min-h-screen bg-[#C4A574] relative flex items-center justify-center">
      {/* Cork Board Texture Overlay */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23A68B5B' fill-opacity='0.4'%3E%3Ccircle cx='9' cy='9' r='1'/%3E%3Ccircle cx='49' cy='21' r='1'/%3E%3Ccircle cx='19' cy='29' r='1'/%3E%3Ccircle cx='39' cy='41' r='1'/%3E%3Ccircle cx='9' cy='49' r='1'/%3E%3Ccircle cx='29' cy='9' r='1'/%3E%3Ccircle cx='51' cy='51' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Loading/Redirect Message */}
      <div className="relative z-10 text-center">
        <div 
          className="bg-[#FFFEF9] p-8 shadow-lg border-[1px] border-[#E5E5E5] relative"
          style={{ 
            transform: 'rotate(-1deg)',
            boxShadow: '0 4px 8px rgba(0,0,0,0.15)'
          }}
        >
          <h1 className="text-[24px] font-bold text-[#2C2C2C] mb-3">
            Switchboard
          </h1>
          <p className="text-[14px] text-[#6B6B6B] mb-4">
            Redirecting to Viroqua...
          </p>
          
          {/* Manual Link in case redirect fails */}
          <Link 
            href="/viroqua" 
            className="text-[#D94F4F] hover:text-[#C43F3F] underline text-sm font-medium"
          >
            Click here if not redirected
          </Link>
          
          {/* Pushpin */}
          <div 
            className="absolute -top-2 left-1/2 w-5 h-5 rounded-full shadow-sm transform -translate-x-1/2"
            style={{ backgroundColor: '#D94F4F' }}
          >
            <div 
              className="w-3 h-3 rounded-full absolute top-1 left-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.3)' }}
            />
          </div>
        </div>
      </div>
    </main>
  )
}