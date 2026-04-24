'use client'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-[#0a0a0a]/80 border-b border-white/5">
        <span className="text-xl font-bold tracking-tight">Jastipal</span>
        <div className="flex items-center gap-3">
          <button onClick={() => router.push('/login')} className="text-sm text-white/60 hover:text-white transition-colors px-4 py-2">
            Masuk
          </button>
          <button onClick={() => router.push('/register')} className="text-sm bg-white text-black font-medium px-4 py-2 rounded-full hover:bg-white/90 transition-all">
            Daftar
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px]" />
        </div>
        <div className="relative text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/60 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Platform jastip terpercaya dengan escrow
          </div>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight leading-none mb-6">
            Titip beli dari<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">luar negeri</span>
            <br />dengan aman.
          </h1>
          <p className="text-lg text-white/50 mb-10 max-w-xl mx-auto leading-relaxed">
            Jastipal menghubungkan buyer dengan jastiper terpercaya. Dana aman di escrow sampai barang tiba di tanganmu.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => router.push('/register')} className="bg-white text-black font-semibold px-8 py-3.5 rounded-full hover:bg-white/90 transition-all text-sm">
              Mulai Sekarang →
            </button>
            <button onClick={() => router.push('/login')} className="border border-white/20 text-white/80 font-medium px-8 py-3.5 rounded-full hover:bg-white/5 transition-all text-sm">
              Sudah punya akun
            </button>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/20">
          <span className="text-xs">scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </section>

      {/* Cara kerja */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Gimana cara kerjanya?</h2>
            <p className="text-white/40 text-lg">Dua cara untuk belanja dari luar negeri</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-400">
                  <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Request Barang</h3>
              <p className="text-white/40 text-sm mb-6 leading-relaxed">Kamu punya barang incaran? Buat request dengan budget maksimal. Jastiper yang cocok akan mengambil dan menetapkan harga final.</p>
              <div className="space-y-3">
                {['Buat request dengan max budget', 'Jastiper ambil & set harga fix', 'Bayar ke escrow Jastipal', 'Terima barang & dana cair ke jastiper'].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xs text-blue-400 font-mono mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-sm text-white/60">{step}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-8 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center mb-6">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Browse Katalog Trip</h3>
              <p className="text-white/40 text-sm mb-6 leading-relaxed">Jastiper yang mau berangkat ke luar negeri post trip mereka. Kamu tinggal browse dan order produk yang tersedia di katalog.</p>
              <div className="space-y-3">
                {['Browse trip jastiper yang tersedia', 'Pilih produk dari katalog trip', 'Order & bayar ke escrow Jastipal', 'Terima barang & dana cair ke jastiper'].map((step, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-xs text-purple-400 font-mono mt-0.5 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-sm text-white/60">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kenapa Jastipal */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Kenapa Jastipal?</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { color: 'text-green-400', bg: 'bg-green-500/10', title: 'Dana Aman di Escrow', desc: 'Uang kamu tidak langsung ke jastiper. Dana ditahan di escrow dan cair setelah kamu konfirmasi terima barang.' },
              { color: 'text-blue-400', bg: 'bg-blue-500/10', title: 'Jastiper Terverifikasi', desc: 'Semua jastiper wajib upload KYC dan diverifikasi admin sebelum bisa menerima order dari buyer.' },
              { color: 'text-orange-400', bg: 'bg-orange-500/10', title: 'Ada Sistem Disputes', desc: 'Kalau ada masalah, buka dispute dan admin akan menengahi. Dana aman sampai masalah terselesaikan.' },
            ].map((item, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center mb-4`}>
                  <div className={`w-4 h-4 rounded-full ${item.color} bg-current opacity-80`} />
                </div>
                <h3 className="font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-b from-white/[0.07] to-white/[0.02] border border-white/10 rounded-3xl p-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Siap mulai?</h2>
            <p className="text-white/40 mb-8">Daftar gratis dan mulai titip beli dari luar negeri dengan aman.</p>
            <button onClick={() => router.push('/register')} className="bg-white text-black font-semibold px-8 py-3.5 rounded-full hover:bg-white/90 transition-all text-sm">
              Buat Akun Gratis →
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 px-6 py-8 text-center">
        <p className="text-white/20 text-sm">© 2026 Jastipal. Platform jastip dengan escrow.</p>
      </footer>
    </div>
  )
}