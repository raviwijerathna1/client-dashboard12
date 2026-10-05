'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface Lead {
  id: string
  name: string
  email: string
  created_at: string
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [userEmail, setUserEmail] = useState<string | undefined>('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUserAndLeads = async () => {
      // 1. පරිශීලකයා ලොග් වී ඇත්දැයි පරීක්ෂා කිරීම
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }
      
      setUserEmail(user.email)

      // 2. අදාළ පරිශීලකයාගේ (Client) Leads පමණක් ලබා ගැනීම
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (data) {
        setLeads(data)
      }
    }

    fetchUserAndLeads()
  }, [router, supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Z Quant Research Lab - Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {userEmail}</span>
            <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
              Logout
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {leads.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-gray-500">No leads found.</td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="px-6 py-4">{lead.name}</td>
                    <td className="px-6 py-4">{lead.email}</td>
                    <td className="px-6 py-4">{new Date(lead.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}