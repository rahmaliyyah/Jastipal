'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'user'
  })

  async function handleRegister() {
    setLoading(true)
    setError('')

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        full_name: form.full_name,
        role: form.role,
      })
    }

    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl border border-gray-200 w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-6">Daftar akun</h1>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-1 block">Nama lengkap</label>
          <input className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            value={form.full_name}
            onChange={e => setForm({...form, full_name: e.target.value})}
          />
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-1 block">Email</label>
          <input type="email" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            value={form.email}
            onChange={e => setForm({...form, email: e.target.value})}
          />
        </div>

        <div className="mb-4">
          <label className="text-sm text-gray-600 mb-1 block">Password</label>
          <input type="password" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400"
            value={form.password}
            onChange={e => setForm({...form, password: e.target.value})}
          />
        </div>

        <div className="mb-6">
          <label className="text-sm text-gray-600 mb-2 block">Daftar sebagai</label>
          <div className="flex gap-3">
            <div onClick={() => setForm({...form, role: 'user'})}
              className={`flex-1 border rounded-lg p-3 text-center cursor-pointer transition-all ${form.role === 'user' ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
              <div className="text-sm font-medium">User</div>
              <div className="text-xs text-gray-500">Mau nitip beli</div>
            </div>
            <div onClick={() => setForm({...form, role: 'jastiper'})}
              className={`flex-1 border rounded-lg p-3 text-center cursor-pointer transition-all ${form.role === 'jastiper' ? 'border-blue-400 bg-blue-50' : 'border-gray-200'}`}>
              <div className="text-sm font-medium">Jastiper</div>
              <div className="text-xs text-gray-500">Ada di Jepang</div>
            </div>
          </div>
        </div>

        <button onClick={handleRegister} disabled={loading}
          className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-all">
          {loading ? 'Loading...' : 'Daftar'}
        </button>

        <p className="text-center text-xs text-gray-500 mt-4">
          Sudah punya akun? <a href="/login" className="text-blue-500">Masuk</a>
        </p>
      </div>
    </div>
  )
}