import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Ditolaklicing() {
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

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Profil Saya</h1>
          <p className="text-sm text-gray-500">Kelola informasi akun Jastipal kamu</p>
        </div>

        {/* Card: Data Pribadi */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-5">Data Pribadi</h2>

          {/* Avatar */}
          <div className="flex items-center gap-4 mb-6">
            <img src="/mas_ganteng.svg" alt="Avatar" className="w-16 h-16 rounded-full object-cover border border-gray-200" />
            <div>
              <p className="text-sm font-medium text-[#49BC9E] hover:underline cursor-pointer">Ubah foto</p>
              <p className="text-xs text-gray-400 mt-0.5">PNG, JPG up to 2MB</p>
            </div>
          </div>

          {/* Nama Lengkap */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap</label>
            <input
              type="text"
              defaultValue="Han Yujin"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#49BC9E] transition-colors"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              defaultValue="hanyujin@student.ub.ac.id"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#49BC9E] transition-colors"
            />
          </div>

          {/* Nomor Telepon */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Telepon</label>
            <input
              type="tel"
              defaultValue="+62 85810393050"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#49BC9E] transition-colors"
            />
          </div>

          {/* Simpan Perubahan */}
          <button className="w-full bg-[#49BC9E] hover:bg-[#3da88d] transition-colors text-white font-semibold text-sm py-3 rounded-lg">
            Simpan Perubahan
          </button>
        </div>

        {/* Card: Pengajuan Ditolak */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h2 className="text-base font-bold text-red-500 mb-1">Pengajuan Ditolak</h2>
          <p className="text-sm text-red-500 mb-4">Alasan: Foto KTP tidak jelas</p>
          <button className="w-full bg-red-500 hover:bg-red-600 transition-colors text-white font-semibold text-sm py-3 rounded-lg">
            Ajukan Kembali
          </button>
        </div>

      </div>
    </div>
  )
}