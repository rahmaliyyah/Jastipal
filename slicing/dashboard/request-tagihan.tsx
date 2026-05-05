import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RequestTagihanSlicing() {
  return (
    <div className={`${inter.className} min-h-screen bg-gray-100`}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img src="/logo_jastipal.svg" alt="Jastipal" className="h-6 w-6" />
            <span className="font-bold text-gray-900">Jastipal</span>
          </div>
          {/* Nav Links */}
          <div className="flex items-center gap-6">
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Dashboard</a>
            <a href="#" className="text-sm font-semibold text-gray-900 border-b-2 border-gray-900 pb-1">Request</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Pesanan</a>
          </div>
        </div>

        {/* User Info */}
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
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Request Saya</h1>
          <p className="text-sm text-gray-500">Pantau status permintaan barang kamu</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
        <button className="pb-3 text-sm text-gray-500 hover:text-gray-700 transition-colors border-b-2 border-transparent">Menunggu</button>
        {/* Tagihan - active */}
        <button className="flex items-center gap-1.5 pb-3 border-b-2 border-[#49BC9E] text-[#49BC9E] font-semibold text-sm">
            Tagihan
            <span className="bg-[#49BC9E] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">1</span>
        </button>
        <button className="pb-3 text-sm text-gray-500 hover:text-gray-700 transition-colors border-b-2 border-transparent">Diproses</button>
        <button className="pb-3 text-sm text-gray-500 hover:text-gray-700 transition-colors border-b-2 border-transparent">Selesai</button>
        <button className="pb-3 text-sm text-gray-500 hover:text-gray-700 transition-colors border-b-2 border-transparent">Dibatalkan</button>
        </div>

        {/* Request Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">

          {/* Card Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-bold text-gray-900 mb-1">IVE Album REVIVE+ Vinyl LP (Limited Edition)</p>
              <p className="text-sm text-[#49BC9E] hover:underline cursor-pointer">
                https://www.ktown4u.com/iteminfo?goods_no=161392
              </p>
            </div>
            {/* Status Badge */}
            <span className="flex-shrink-0 ml-4 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full px-4 py-1.5">
            Tagihan Masuk
            </span>
          </div>

          {/* Detail Grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4 border border-gray-100 rounded-lg p-4 mb-4">
            {/* Estimasi Barang Diterima */}
            <div>
              <p className="text-xs text-[#49BC9E] mb-1">Estimasi Barang Diterima</p>
              <p className="text-sm font-semibold text-gray-900">27 April 2026</p>
            </div>
            {/* Metode Pengiriman */}
            <div>
              <p className="text-xs text-[#49BC9E] mb-1">Metode Pengiriman</p>
              <p className="text-sm font-semibold text-gray-900">Kirim Paket</p>
            </div>
            {/* Maksimal Budget */}
            <div>
              <p className="text-xs text-[#49BC9E] mb-1">Maksimal Budget (IDR)</p>
              <p className="text-sm font-semibold text-gray-900">Rp 75.000</p>
            </div>
            {/* Jumlah */}
            <div>
              <p className="text-xs text-[#49BC9E] mb-1">Jumlah</p>
              <p className="text-sm font-semibold text-gray-900">1 Pcs</p>
            </div>
          </div>

          {/* Catatan */}
          <div className="mb-5">
            <p className="text-sm font-semibold text-gray-900 mb-1">Catatan:</p>
            <p className="text-sm text-gray-500">Pastikan barang yang dibeli original</p>
          </div>

          {/* Actions */}
          <div className="flex justify-end">
            <button className="bg-[#49BC9E] hover:bg-[#3da88d] transition-colors text-white text-sm font-semibold px-6 py-2.5 rounded-lg">
              Batalkan
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}