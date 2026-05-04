export default function DashboardPenggunaSlicing() {
    return (
      <div className="min-h-screen bg-gray-100">
        
        {/* Navbar */}
        <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="Jastipal" className="h-6 w-6" />
              <span className="font-bold text-gray-900">Jastipal</span>
            </div>
            {/* Nav Links */}
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm font-semibold text-gray-900 border-b-2 border-gray-900 pb-1">Dashboard</a>
              <a href="#" className="text-sm text-gray-500">Request</a>
              <a href="#" className="text-sm text-gray-500">Pesanan</a>
            </div>
          </div>
          {/* User Info */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="text-gray-500 text-xl">🔔</span>
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">1</span>
            </div>
            <img src="/avatar.png" alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
            <span className="text-sm font-medium text-gray-900">Han Yujin</span>
          </div>
        </nav>
  
        {/* Content */}
        <div className="max-w-4xl mx-auto px-8 py-8">
          
          {/* Greeting */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              <span className="bg-yellow-300 px-1">Selamat</span> datang, Yujin! 🙌
            </h1>
            <p className="text-sm text-gray-500">Temukan jastiper terpercaya untuk membantu belanja dari luar negeri</p>
          </div>
  
          {/* Aksi Cepat */}
          <h2 className="text-base font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
  
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Browse Listing */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="w-10 h-10 bg-[#49BC9E] rounded-lg flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
                </svg>
              </div>
              <p className="font-bold text-gray-900 mb-1">Browse Listing</p>
              <p className="text-sm text-gray-500">Cari jastiper yang siap berangkat</p>
            </div>
  
            {/* Buat Request */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="w-10 h-10 bg-[#49BC9E] rounded-lg flex items-center justify-center mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="font-bold text-gray-900 mb-1">Buat Request</p>
              <p className="text-sm text-gray-500">Minta jastiper belikan barang</p>
            </div>
          </div>
  
          {/* Request Saya */}
          <div className="bg-white rounded-xl p-6 border border-gray-200 flex items-center gap-4">
            <div className="w-10 h-10 bg-[#49BC9E] rounded-lg flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h18v2H3zM3 8h18v2H3zM3 13h18v2H3zM3 18h18v2H3z" />
              </svg>
            </div>
            <div>
              <p className="font-bold text-gray-900">Request Saya</p>
              <p className="text-sm text-gray-500">0 Aktif</p>
            </div>
          </div>
  
        </div>
      </div>
    )
  }