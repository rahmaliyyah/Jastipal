import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function RequestPembayaranSlicing() {
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
            <a href="#" className="text-sm font-semibold text-gray-900 border-b-2 border-gray-900 pb-1">Request</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Pesanan</a>
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
      <div className="max-w-3xl mx-auto px-8 py-8">

        {/* Back + Title */}
        <a href="#" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </a>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Pembayaran</h1>
          <p className="text-sm text-gray-500">IVE Album REVIVE+ Vinyl LP (Limited Edition)</p>
        </div>

        <div className="flex flex-col gap-4">

          {/* Card: Transfer ke Rekening Berikut */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Transfer ke Rekening Berikut</h2>
            <div className="grid grid-cols-2 gap-3">

              {/* BCA */}
              <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                <div>
                  <p className="text-xs text-[#49BC9E] mb-0.5">PT Jastipal Indonesia</p>
                  <p className="text-sm font-semibold text-gray-900">BCA • 1234567890</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              {/* BRI */}
              <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                <div>
                  <p className="text-xs text-[#49BC9E] mb-0.5">PT Jastipal Indonesia</p>
                  <p className="text-sm font-semibold text-gray-900">BRI • 0987654321</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

              {/* Mandiri */}
              <div className="flex items-center justify-between border border-gray-100 rounded-lg px-4 py-3">
                <div>
                  <p className="text-xs text-[#49BC9E] mb-0.5">PT Jastipal Indonesia</p>
                  <p className="text-sm font-semibold text-gray-900">Mandiri • 1122334455</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>

            </div>
          </div>

          {/* Card: Rincian Tagihan */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Rincian Tagihan</h2>

            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-[#49BC9E]">Harga (Produk & Fee Jastiper)</p>
              <p className="text-sm font-semibold text-gray-900">Rp 850.000</p>
            </div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-[#49BC9E]">Platform Fee (5%)</p>
              <p className="text-sm font-semibold text-gray-900">Rp 42.500</p>
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-bold text-gray-900">Total Tagihan</p>
              <p className="text-sm font-bold text-[#49BC9E]">IDR 892.500</p>
            </div>

            <p className="text-xs text-gray-400 flex items-center gap-1">
              <span>ⓘ</span>
              Mohon transfer sesuai nominal untuk mempercepat proses verifikasi.
            </p>
          </div>

          {/* Card: Upload Bukti Transfer */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Upload Bukti Transfer</h2>

            {/* Metode Pembayaran */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Metode Pembayaran</label>
              <input
                type="text"
                placeholder="Pilih Metode Pembayaran"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 placeholder-gray-400 outline-none focus:border-[#49BC9E] transition-colors"
              />
            </div>

            {/* Upload Area */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload Bukti Transfer</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-8 flex flex-col items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-400">
                  <span className="text-[#49BC9E] font-medium cursor-pointer hover:underline">Upload a file</span>
                  {' '}or drag and drop
                </p>
                <p className="text-xs text-gray-400">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>

            {/* Submit */}
            <button className="w-full bg-[#49BC9E] hover:bg-[#3da88d] transition-colors text-white text-sm font-semibold py-3 rounded-lg">
              Kirim Bukti Pembayaran
            </button>

          </div>

        </div>
      </div>
    </div>
  )
}