'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ email: '', password: '' })

  async function handleLogin() {
    setLoading(true)
    setError('')

    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    })

    if (loginError) {
      setError('Email atau password salah')
      setLoading(false)
      return
    }

    // Cek role user, redirect sesuai role
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (userData?.role === 'jastiper') {
      router.push('/jastiper/requests')
    } else {
      router.push('/browse')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl border border-gray-200 w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-6">Masuk</h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-1 block">Email</label>
          <input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
          />
        </div>

        <div className="mb-6">
          <label className="text-sm text-gray-600 mb-1 block">Password</label>
          <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
          />
        </div>

        <button onClick={handleLogin} disabled={loading}
          className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-all">
          {loading ? 'Loading...' : 'Masuk'}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Belum punya akun? <a href="/register" className="text-blue-500">Daftar</a>
        </p>
      </div>
    </div>
  )
}