import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function FormRequestKirimSlicing() {
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
        <div className="bg-white rounded-xl border-2 border-blue-300 border-dashed p-8">

          {/* Back */}
          <a href="#" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </a>

          {/* Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Buat Permintaan</h1>
            <p className="text-sm text-gray-500">Kasih tahu kami barang apa yang ingin kamu beli dari luar negeri.</p>
          </div>

          {/* Section: Detail Produk */}
          <div className="border border-gray-200 rounded-xl p-5 mb-4">
            <h2 className="text-base font-bold text-gray-900 mb-4">Detail Produk</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Link Produk</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="flex-1 text-sm text-gray-700">https://www.ktown4u.com/iteminfo?goods_no=161392</span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Kami akan mencoba mengambil detail produk secara otomatis.</p>
            </div>

            <div className="flex items-start gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Produk</label>
                <input
                  type="text"
                  defaultValue="IVE Album REVIVE+ Vinyl LP (Limited Edition)"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#49BC9E] transition-colors"
                />
              </div>
              <div className="w-36">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Jumlah</label>
                <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                  <button className="px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 border-r border-gray-200">-</button>
                  <span className="flex-1 text-center text-sm text-gray-900 py-2.5">1</span>
                  <button className="px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 border-l border-gray-200">+</button>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Budget & Tenggat Waktu */}
          <div className="border border-gray-200 rounded-xl p-5 mb-4">
            <h2 className="text-base font-bold text-gray-900 mb-4">Budget & Tenggat Waktu</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Maksimal Budget (IDR)</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5">
                <span className="text-sm text-gray-500 font-medium flex-shrink-0">Rp</span>
                <span className="flex-1 text-sm text-gray-700">900.000</span>
              </div>
              <p className="text-xs text-gray-400 mt-1.5 flex items-start gap-1">
                <span className="flex-shrink-0 mt-0.5">ⓘ</span>
                Jastiper akan menyesuaikan harga akhir agar tetap dalam batas budget. Tagihan dikirim setelah request disetujui.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Estimasi Barang Diterima</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-700">27/04/2026</span>
              </div>
            </div>
          </div>

          {/* Section: Pengiriman */}
          <div className="border border-gray-200 rounded-xl p-5 mb-4">
            <h2 className="text-base font-bold text-gray-900 mb-4">Pengiriman</h2>

            <label className="block text-sm font-medium text-gray-700 mb-2">Metode Pengiriman</label>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {/* Kirim Paket - active */}
              <div className="flex items-center gap-2 border border-[#49BC9E] bg-[#49BC9E]/10 rounded-lg px-4 py-3 cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#49BC9E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                </svg>
                <span className="text-sm font-medium text-[#49BC9E]">Kirim Paket</span>
              </div>
              {/* Meetup */}
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:border-[#49BC9E] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-sm text-gray-700">Meetup / Ketemuan</span>
              </div>
            </div>

            {/* Alamat Pengiriman */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Pengiriman</label>
              <textarea
                defaultValue="Jl. Greenwood Golf I 7-21, Boro Teronggo, Tirtomoyo, Kec. Pakis, Kabupaten Malang, Jawa Timur 65154"
                rows={3}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#49BC9E] transition-colors resize-none"
              />
            </div>
          </div>

          {/* Section: Catatan */}
          <div className="border border-gray-200 rounded-xl p-5 mb-6">
            <h2 className="text-base font-bold text-gray-900 mb-4">Catatan untuk Jastiper</h2>
            <textarea
              placeholder="Tambahkan catatan khusus (misalnya: packaging, struk, warna, dll.)"
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 placeholder-gray-400 outline-none focus:border-[#49BC9E] transition-colors resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end">
            <button className="bg-[#49BC9E] hover:bg-[#3da88d] transition-colors text-white text-sm font-semibold px-6 py-2.5 rounded-lg">
              Kirim Request
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}