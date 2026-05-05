import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function DaftarSlicing() {
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
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Home</a>
            <a href="#" className="text-sm font-semibold text-gray-900 border-b-2 border-gray-900 pb-1">My Requests</a>
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Orders</a>
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

        {/* Back */}
        <a href="#" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali ke Profile
        </a>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Daftar sebagai Jastiper</h1>
          <p className="text-sm text-gray-500">Isi data di bawah ini dan upload dokumen identitas untuk verifikasi</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-bold text-gray-900 mb-5">Data Pribadi</h2>

          {/* Bio */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Bio</label>
            <input
              type="text"
              placeholder="Ceritakan sedikit tentang Anda"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 placeholder-gray-400 outline-none focus:border-[#49BC9E] transition-colors"
            />
          </div>

          {/* Service Fee */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Fee (%)</label>
            <input
              type="text"
              placeholder="Masukkan biaya service Anda"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 placeholder-gray-400 outline-none focus:border-[#49BC9E] transition-colors"
            />
          </div>

          {/* Negara Domisili */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Negara Domisili</label>
            <input
              type="text"
              placeholder="Masukkan negara domisili Anda"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-400 placeholder-gray-400 outline-none focus:border-[#49BC9E] transition-colors"
            />
          </div>

          {/* Foto KTP / Passport */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto KTP / Passport</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#49BC9E] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-center">
                <span className="text-[#49BC9E] font-medium hover:underline cursor-pointer">Upload a file</span>
                <span className="text-gray-500"> or drag and drop</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>

          {/* Foto Selfie & KTP */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Foto Selfie & KTP</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg px-6 py-8 flex flex-col items-center justify-center cursor-pointer hover:border-[#49BC9E] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-center">
                <span className="text-[#49BC9E] font-medium hover:underline cursor-pointer">Upload a file</span>
                <span className="text-gray-500"> or drag and drop</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>

          {/* Submit */}
          <button className="w-full bg-[#49BC9E] hover:bg-[#3da88d] transition-colors text-white font-semibold text-sm py-3 rounded-lg mb-3">
            Kirim Pengajuan
          </button>

          {/* Privacy Note */}
          <p className="text-xs text-gray-400 text-center">
            Jastipal menjamin keamanan data Anda. Informasi yang diberikan hanya digunakan untuk proses verifikasi identitas
          </p>
        </div>

      </div>
    </div>
  )
}