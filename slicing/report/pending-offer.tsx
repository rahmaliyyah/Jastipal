import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function PendingOfferSlicing() {
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
          <button className="flex items-center gap-1.5 pb-3 border-b-2 border-[#49BC9E] text-[#49BC9E] font-semibold text-sm">
            Pending Offers
            <span className="bg-[#49BC9E] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">3</span>
          </button>
          <button className="pb-3 text-sm text-gray-500 border-b-2 border-transparent hover:text-gray-700 transition-colors">Active Orders</button>
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

        {/* Request Cards */}
        <div className="flex flex-col gap-4">

          {/* Card 1 - Nike Air Jordan */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex">
            <div className="w-56 flex-shrink-0 bg-gray-50 flex items-center justify-center">
              <div className="w-full h-36 bg-gray-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-[#49BC9E] bg-[#e6f7f3] rounded-full px-2.5 py-0.5">Japan Source</span>
                <span className="text-xs text-gray-400">Posted 5 hours ago</span>
              </div>
              <p className="font-bold text-gray-900 mb-1">Nike Air Jordan 1 High OG "Chicago"</p>
              <p className="text-sm text-gray-500 mb-4">Looking for size US 10. Must be original with box and receipt. Willing to pay for express shipping.</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-2">
                    <img src="/mas_ganteng.svg" alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                    <img src="/mas_ganteng.svg" alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                    <img src="/mas_ganteng.svg" alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                  </div>
                  <span className="text-sm text-gray-500 ml-1">3 New Offer</span>
                </div>
                <button className="bg-[#49BC9E] hover:bg-[#3da88d] transition-colors text-white text-sm font-semibold px-5 py-2 rounded-lg">
                  View Offer
                </button>
              </div>
            </div>
          </div>

          {/* Card 2 - Olive Young */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden flex">
            <div className="w-56 flex-shrink-0 bg-[#e8f0ec] flex items-center justify-center">
              <div className="w-full h-36 bg-[#e8f0ec] flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="flex-1 p-5">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-medium text-blue-500 bg-blue-50 rounded-full px-2.5 py-0.5">Korean Source</span>
                <span className="text-xs text-gray-400">Posted 5 hours ago</span>
              </div>
              <p className="font-bold text-gray-900 mb-1">Olive Young Exclusive Skincare Set</p>
              <p className="text-sm text-gray-500 mb-4">Specific set from the Myeongdong flagship store. Please include samples if possible.</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <img src="/mas_ganteng.svg" alt="" className="w-7 h-7 rounded-full border-2 border-white object-cover" />
                  <span className="text-sm text-gray-500 ml-1">1 New Offer</span>
                </div>
                <button className="bg-[#49BC9E] hover:bg-[#3da88d] transition-colors text-white text-sm font-semibold px-5 py-2 rounded-lg">
                  View Offer
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}