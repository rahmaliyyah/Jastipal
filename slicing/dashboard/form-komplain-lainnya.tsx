import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function FormKomplainSlicing() {
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
            <a href="#" className="text-sm font-semibold text-gray-900 border-b-2 border-gray-900 pb-1">Request</a>
            <a href="#" className="text-sm text-gray-500">Pesanan</a>
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
        <a href="#" className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </a>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Ajukan Komplain</h1>
          <p className="text-sm text-gray-500">NMIXX Album Heavy Serenade (Heavy Ver.) Signed</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-4">Detail Komplain</h2>

        {/* Pilih Alasan */}
        <label className="block text-sm font-medium text-gray-700 mb-3">Pilih Alasan</label>
        <div className="flex flex-col gap-2 mb-6">
        {[
            'Pesanan belum diterima sesuai estimasi',
            'Barang rusak / tidak sesuai deskripsi',
            'Jastiper sulit dihubungi',
            'Pesanan tidak dibelikan oleh jastiper',
        ].map((alasan) => (
            <div key={alasan} className="border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-700 cursor-pointer hover:border-[#49BC9E] transition-colors">
            {alasan}
            </div>
        ))}
        {/* Lainnya - dipilih */}
        <div className="border border-[#49BC9E] bg-[#f0faf7] rounded-lg px-4 py-3 text-sm text-[#49BC9E] font-medium cursor-pointer">
            Lainnya
        </div>
        </div>

        {/* Textarea - sudah ada isi */}
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Jelaskan kendala yang dialami</label>
        <textarea
        defaultValue="Foto yang dikirim oleh Jastiper adalah hasil generate AI"
        rows={4}
        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#49BC9E] transition-colors resize-none"
        />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button className="bg-[#49BC9E] hover:bg-[#3da88d] transition-colors text-white text-sm font-semibold px-6 py-2.5 rounded-lg">
            Kirim Komplain
          </button>
        </div>

      </div>
    </div>
  )
}