'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminTestPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const addResult = (test: string, result: any, success: boolean) => {
    setTestResults(prev => [...prev, { test, result, success, timestamp: new Date().toISOString() }])
  }

  const testDatabaseConnection = async () => {
    try {
      const { data, error } = await supabase.from('locations').select('count').single()
      addResult('Database Connection', { data, error }, !error)
    } catch (err) {
      addResult('Database Connection', err, false)
    }
  }

  const testAuthStatus = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      addResult('Auth Status', { session: session ? 'Authenticated' : 'Not authenticated', error }, !error)
    } catch (err) {
      addResult('Auth Status', err, false)
    }
  }

  const testListLocations = async () => {
    try {
      const { data, error } = await supabase
        .from('locations')
        .select('id, name, slug, is_active')
        .limit(5)
      addResult('List Locations', { count: data?.length || 0, data, error }, !error)
    } catch (err) {
      addResult('List Locations', err, false)
    }
  }

  const testAdminFunctions = async () => {
    try {
      // Test if functions exist by calling with invalid params (should error with param validation, not "function does not exist")
      const { error } = await supabase.rpc('admin_toggle_location_active', {
        p_id: '00000000-0000-0000-0000-000000000000',
        p_is_active: true
      })
      
      // We expect an error (location not found), but not a "function does not exist" error
      const functionExists = !error?.message?.includes('function') && !error?.message?.includes('does not exist')
      addResult('Admin Functions Check', { 
        functionExists, 
        errorMessage: error?.message 
      }, functionExists)
    } catch (err) {
      addResult('Admin Functions Check', err, false)
    }
  }

  const testStorageBucket = async () => {
    try {
      const { data, error } = await supabase.storage.getBucket('board-photos')
      addResult('Storage Bucket', { bucketExists: !!data, data, error }, !error)
    } catch (err) {
      addResult('Storage Bucket', err, false)
    }
  }

  const runAllTests = async () => {
    setIsLoading(true)
    setTestResults([])
    
    await testDatabaseConnection()
    await testAuthStatus()
    await testListLocations()
    await testAdminFunctions()
    await testStorageBucket()
    
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Admin Panel Debug Tests</h1>
        
        <button
          onClick={runAllTests}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded mb-6 disabled:opacity-50"
        >
          {isLoading ? 'Running Tests...' : 'Run All Tests'}
        </button>

        <div className="space-y-4">
          {testResults.map((result, index) => (
            <div
              key={index}
              className={`p-4 rounded border ${
                result.success ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold">{result.test}</h3>
                <span className={`px-2 py-1 rounded text-xs ${
                  result.success ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                }`}>
                  {result.success ? 'PASS' : 'FAIL'}
                </span>
              </div>
              <pre className="text-xs overflow-auto bg-white p-2 rounded">
                {JSON.stringify(result.result, null, 2)}
              </pre>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 rounded border border-yellow-300">
          <h3 className="font-semibold mb-2">Instructions:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>First, make sure you're logged into the admin panel</li>
            <li>Click "Run All Tests" to check various aspects of the admin functionality</li>
            <li>Green tests are passing, red tests indicate issues</li>
            <li>Check the browser console for additional debug information</li>
            <li>Run the SQL script fix-admin-complete.sql in Supabase SQL Editor if you see function errors</li>
          </ol>
        </div>
      </div>
    </div>
  )
}