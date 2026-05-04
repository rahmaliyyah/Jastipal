import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function DashboardPenggunaSlicing() {
  return (
    <div className={`${inter.className} min-h-screen bg-gray-100`}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/logo_jastipal.svg" alt="Jastipal" className="h-7 w-7" />
            <span className="font-bold text-gray-900 text-lg">Jastipal</span>
          </div>

          {/* Nav Links - hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-semibold text-gray-900 border-b-2 border-gray-900 pb-1">
              Dashboard
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Request
            </a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              Pesanan
            </a>
          </div>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
              1
            </span>
          </div>

          {/* Avatar */}
          <img
            src="/mas_ganteng.svg"
            alt="Avatar"
            className="w-8 h-8 rounded-full object-cover border border-gray-200"
          />

          {/* Name - hidden on mobile */}
          <span className="hidden md:block text-sm font-medium text-gray-900">Han Yujin</span>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">

        {/* Greeting */}
        <div className="mb-5">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            <span className="bg-yellow-300 px-1 rounded-sm">Selamat</span> datang, Yujin! 🙌
          </h1>
          <p className="text-sm text-gray-500">
            Temukan jastiper terpercaya untuk membantu belanja dari luar negeri
          </p>
        </div>

        {/* Alert Tagihan */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl px-5 py-4 flex items-start gap-3 mb-7">
          <div className="flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-blue-600">
              1 tagihan menunggu pembayaran
            </p>
            <p className="text-xs text-blue-400 mt-0.5">
              Segera lakukan pembayaran sebelum batas waktu berakhir
            </p>
          </div>
        </div>

        {/* Aksi Cepat */}
        <h2 className="text-base font-semibold text-gray-900 mb-4">Aksi Cepat</h2>

        {/* Top Cards: Browse Listing & Buat Request */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

          {/* Browse Listing */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-[#49BC9E] rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
            </div>
            <p className="font-bold text-gray-900 mb-1">Browse Listing</p>
            <p className="text-sm text-gray-500">Cari jastiper yang sedang membuka jasa titip</p>
          </div>

          {/* Buat Request */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer">
            <div className="w-12 h-12 bg-[#49BC9E] rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="font-bold text-gray-900 mb-1">Buat Request</p>
            <p className="text-sm text-gray-500">Ajukan permintaan pembelian barang dari luar negeri</p>
          </div>

        </div>

        {/* Request Saya */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-sm transition-shadow cursor-pointer">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#49BC9E] rounded-xl flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-900">Request Saya</p>
              <p className="text-sm text-gray-500">0 Aktif</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}