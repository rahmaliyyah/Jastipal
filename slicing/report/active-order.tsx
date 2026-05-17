import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function ActiveOrderSlicing() {
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
            <a href="#" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">Message</a>
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

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">My Request</h1>
          <p className="text-sm text-gray-500">Manage your buying activities and check incoming offers.</p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
          <button className="pb-3 text-sm text-gray-500 border-b-2 border-transparent hover:text-gray-700 transition-colors">Pending Offers</button>
          <button className="flex items-center gap-1.5 pb-3 border-b-2 border-[#49BC9E] text-[#49BC9E] font-semibold text-sm">
            Active Order
            <span className="bg-[#49BC9E] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">1</span>
          </button>
          <button className="pb-3 text-sm text-gray-500 border-b-2 border-transparent hover:text-gray-700 transition-colors">Completed</button>
        </div>

        {/* Action Required Header */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-bold text-gray-900">Action Required</p>
          <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
            </svg>
            Sort by: Newest
          </button>
        </div>

        {/* Order Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
          {/* Product Image */}
          <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Product Info */}
          <div className="flex-1">
            <span className="text-xs font-medium text-[#49BC9E] bg-[#e6f7f3] rounded-full px-2.5 py-0.5 mb-1 inline-block">Item Purchased</span>
            <p className="font-bold text-gray-900 mb-0.5">Sony WH-1000XM5 Wireless Noise Canceling Headphones</p>
            <p className="text-xs text-gray-400">Order #JP-8821</p>
          </div>

          {/* Escrow Status */}
          <div className="flex-shrink-0 text-center">
            <p className="text-xs text-gray-400 mb-0.5">Escrow Status</p>
            <p className="text-base font-bold text-[#49BC9E]">IDR 4,250,000</p>
          </div>

          {/* Track Button */}
          <button className="flex-shrink-0 bg-[#49BC9E] hover:bg-[#3da88d] transition-colors text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
            Track Order
          </button>
        </div>

      </div>
    </div>
  )
}