'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [role, setRole] = useState<'user' | 'jastiper'>('user')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      router.push('/login')
      return
    }

    const { error: insertError } = await supabase.from('users').insert({
      id: user.id,
      full_name: user.user_metadata.full_name ?? user.email ?? 'User',
      role: role,
    })

    if (insertError) {
      setError('Gagal menyimpan, coba lagi.')
      setLoading(false)
      return
    }

    if (role === 'jastiper') {
      router.push('/jastiper/requests')
    } else {
      router.push('/browse')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl border border-gray-200 w-full max-w-sm">

        <h1 className="text-xl font-semibold mb-2">Satu langkah lagi!</h1>
        <p className="text-sm text-gray-500 mb-8">Kamu mau pakai Jastipal sebagai apa?</p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <div className="flex flex-col gap-4 mb-8">
          <div
            onClick={() => setRole('user')}
            className={`border rounded-xl p-4 cursor-pointer transition-all ${
              role === 'user'
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                role === 'user' ? 'border-blue-400' : 'border-gray-300'
              }`}>
                {role === 'user' && (
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                )}
              </div>
              <div>
                <div className="text-sm font-medium">User</div>
                <div className="text-xs text-gray-500">Saya ingin titip beli barang dari Jepang</div>
              </div>
            </div>
          </div>

          <div
            onClick={() => setRole('jastiper')}
            className={`border rounded-xl p-4 cursor-pointer transition-all ${
              role === 'jastiper'
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                role === 'jastiper' ? 'border-blue-400' : 'border-gray-300'
              }`}>
                {role === 'jastiper' && (
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                )}
              </div>
              <div>
                <div className="text-sm font-medium">Jastiper</div>
                <div className="text-xs text-gray-500">Saya tinggal di Jepang dan ingin membantu belanja</div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-gray-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-gray-700 disabled:opacity-50 transition-all"
        >
          {loading ? 'Menyimpan...' : 'Mulai sekarang'}
        </button>

      </div>
    </div>
  )
}