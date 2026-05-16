import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function DaftarPesananDikirimKonfirmasiSlicing() {
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
            <a href="#" className="text-sm text-gray-500">Dashboard</a>
            <a href="#" className="text-sm text-gray-500">Request</a>
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
          <span className="text-sm font-medium text-gray-900">Rora</span>
        </div>
      </nav>

      {/* Content - dengan overlay */}
      <div className="relative">

        {/* Overlay */}
        <div className="fixed inset-0 bg-black/30 z-10"></div>

        {/* Modal */}
        <div className="fixed inset-0 z-20 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-gray-900">Konfirmasi Pesanan Diterima</h2>
              <button className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <p className="text-sm text-gray-500 mb-6">
              Pastikan pesanan telah diterima dalam kondisi baik sebelum melakukan konfirmasi. Setelah dikonfirmasi, dana akan otomatis diteruskan kepada jastiper.
            </p>

            {/* Modal Actions */}
            <div className="flex flex-col gap-3">
              <button className="w-full bg-[#49BC9E] hover:bg-[#3da88d] transition-colors text-white text-sm font-semibold py-3 rounded-lg">
                Konfirmasi Diterima
              </button>
              <button className="w-full border border-gray-200 text-sm font-semibold text-gray-500 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                Batal
              </button>
            </div>

          </div>
        </div>

        {/* Background Content */}
        <div className="max-w-4xl mx-auto px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Daftar Pesanan</h1>
            <p className="text-sm text-gray-500">Lacak dan pantau status pesanan Anda</p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
            <button className="pb-3 text-sm text-gray-500 border-b-2 border-transparent">Menunggu</button>
            <button className="flex items-center gap-1.5 pb-3 border-b-2 border-[#49BC9E] text-[#49BC9E] font-semibold text-sm">
              Dikirim
              <span className="bg-[#49BC9E] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">1</span>
            </button>
            <button className="pb-3 text-sm text-gray-500 border-b-2 border-transparent">Selesai</button>
            <button className="pb-3 text-sm text-gray-500 border-b-2 border-transparent">Dibatalkan</button>
          </div>

          {/* Pesanan Card */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-bold text-gray-900 mb-0.5">IVE Album REVIVE+ Vinyl LP (Limited Edition)</p>
                <p className="text-sm text-gray-500">25 April 2026</p>
              </div>
              <span className="flex-shrink-0 ml-4 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full px-3 py-1">Dikirim</span>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full border-2 border-[#49BC9E] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#49BC9E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 h-px bg-[#49BC9E] mx-2"></div>
              <div className="w-10 h-10 rounded-full border-2 border-[#49BC9E] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#49BC9E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div className="flex-1 h-px bg-[#49BC9E] mx-2"></div>
              <div className="w-10 h-10 rounded-full border-2 border-[#49BC9E] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#49BC9E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
              </div>
              <div className="flex-1 h-px bg-gray-200 mx-2"></div>
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>

            {/* Pengiriman */}
            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-900 mb-1">Pengiriman:</p>
              <p className="text-sm text-gray-500">Jl. Greenwood Golf I 7-21, Boro Teronggo, Tirtomoyo, Kec. Pakis, Kabupaten Malang, Jawa Timur 65154</p>
            </div>

            {/* Jastiper */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <img src="/mas_ganteng.svg" alt="Kim Jennie" className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Kim Jennie</p>
                  <p className="text-xs text-gray-500">Pembeli</p>
                </div>
              </div>
              <button className="bg-[#49BC9E] text-white text-sm font-semibold px-5 py-2 rounded-lg">Hubungi</button>
            </div>

            {/* Bukti Pembelian */}
            <div className="border border-gray-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-semibold text-gray-900 mb-3">Bukti Pembelian</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-gray-700">Lihat Invoice</span>
                </div>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-sm text-gray-700">Foto Toko</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button className="bg-[#49BC9E] text-white text-sm font-semibold py-3 rounded-lg">
                Konfirmasi Pesanan Diterima
              </button>
              <button className="border border-gray-200 text-sm font-semibold text-gray-500 py-3 rounded-lg">
                Laporkan Kendala
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}