'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [initials, setInitials] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data } = await supabase
        .from('users')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single()
      if (data) {
        setUser(data)
        setAvatarUrl(data.avatar_url)
        const names = data.full_name.split(' ')
        setInitials(names.length >= 2 ? names[0][0] + names[1][0] : names[0][0])
      }
    }
    getUser()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const navItems = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Pesanan', href: '/orders' },
  ]

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <span className="text-base font-semibold text-gray-900 dark:text-white">
          Jastipal
        </span>
        <div className="flex items-center gap-1">
          {navItems.map(item => (
            <a
              key={item.href}
              href={item.href}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                pathname === item.href
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 hover:opacity-80 transition-all"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xs font-medium text-blue-600 dark:text-blue-300">
              {initials}
            </div>
          )}
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {user?.full_name}
          </span>
        </button>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 dark:text-gray-500 hover:text-red-500 transition-all"
        >
          Keluar
        </button>
      </div>
    </nav>
  )
}