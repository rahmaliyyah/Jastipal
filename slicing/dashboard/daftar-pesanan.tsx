import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function DaftarPesananSlicing() {
  return (
    <div className={`${inter.className} min-h-screen bg-gray-100`}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <img src="/logo_jastipal.svg" alt="Jastipal" className="h-6 w-6" />
            <span className="font-bold text-gray-900">Jastipal</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Dashboard</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Request</a>
            <a href="#" className="text-sm font-semibold text-gray-900 border-b-2 border-gray-900 pb-1">Pesanan</a>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">1</span>
          </div>
          <img src="/mas_ganteng.svg" alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
          <span className="text-sm font-medium text-gray-900">Han Yujin</span>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-8 py-8">

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Daftar Pesanan</h1>
          <p className="text-sm text-gray-500">Lacak dan pantau status pesanan Anda</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
        {/* Tagihan - active */}
        <button className="flex items-center gap-1.5 pb-3 border-b-2 border-[#49BC9E] text-[#49BC9E] font-semibold text-sm">
            Tagihan
            <span className="bg-[#49BC9E] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">1</span>
        </button>
        <button className="pb-3 text-sm text-gray-500 border-b-2 border-transparent">Diproses</button>
        <button className="pb-3 text-sm text-gray-500 border-b-2 border-transparent">Selesai</button>
        <button className="pb-3 text-sm text-gray-500 border-b-2 border-transparent">Dibatalkan</button>
        </div>

        {/* Pesanan Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">

          {/* Card Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-bold text-gray-900 mb-0.5">IVE Album REVIVE+ Vinyl LP (Limited Edition)</p>
              <p className="text-sm text-gray-500">25 April 2026</p>
            </div>
            <span className="text-sm font-semibold text-orange-400 flex-shrink-0 ml-4">Menunggu Pembayaran</span>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center mb-6">

            {/* Step 1 - aktif */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-[#49BC9E] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#49BC9E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Line */}
            <div className="flex-1 h-px bg-gray-200 mx-2"></div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>

            {/* Line */}
            <div className="flex-1 h-px bg-gray-200 mx-2"></div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
              </div>
            </div>

            {/* Line */}
            <div className="flex-1 h-px bg-gray-200 mx-2"></div>

            {/* Step 4 */}
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

          </div>

          {/* Pengiriman */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">Pengiriman:</p>
            <p className="text-sm text-gray-500">Jl. Greenwood Golf I 7-21, Boro Teronggo, Tirtomoyo, Kec. Pakis, Kabupaten Malang, Jawa Timur 65154</p>
          </div>

          {/* Jastiper Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <img src="/mas_ganteng.svg" alt="Youngjae" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold text-gray-900">Youngjae</p>
                <p className="text-xs text-gray-500">Jastiper</p>
              </div>
            </div>
            <button className="bg-[#49BC9E] hover:bg-[#3da88d] transition-colors text-white text-sm font-semibold px-5 py-2 rounded-lg">
              Hubungi
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="bg-[#49BC9E] hover:bg-[#3da88d] transition-colors text-white text-sm font-semibold py-3 rounded-lg">
              Bayar
            </button>
            <button className="border border-gray-200 text-sm font-semibold text-gray-500 py-3 rounded-lg hover:bg-gray-50 transition-colors">
              Batalkan
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}