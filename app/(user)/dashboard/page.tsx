'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const supabase = createClient()
  const [userName, setUserName] = useState('')

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', user.id)
        .single()
      if (data) setUserName(data.full_name)
    }
    getUser()
  }, [])

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Selamat datang, {userName} 👋
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Temukan jastiper terpercaya untuk belanja dari Jepang
        </p>
      </div>

      {/* Placeholder — nanti diisi list jastiper */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-12 text-center">
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          List jastiper akan muncul di sini
        </p>
      </div>
    </div>
  )
}