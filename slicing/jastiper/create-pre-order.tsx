import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function CreatePreOrderSlicing() {
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
      <div className="max-w-3xl mx-auto px-8 py-8">

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Create Pre-Order Listing</h1>
          <p className="text-sm text-gray-500">List items you plan to buy on your upcoming trip.</p>
        </div>

        {/* Section: Select Upcoming Trip */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-3">Select Upcoming Trip</h2>
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5 mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="flex-1 text-sm text-gray-700">NRT (Tokyo) → CGK (Jakarta) • Oct 10 - Oct 15</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <p className="flex items-center gap-1 text-xs text-[#49BC9E]">
            <span className="flex-shrink-0">✓</span>
            Verified Trip • Boarding Pass Uploaded
            </p>
        </div>

        {/* Section: Product Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-4">Product Details</h2>
 
          {/* Product Photos */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Photos</label>
            <div className="flex items-center gap-3 mb-2">
              {/* Add Photo */}
              <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-[#49BC9E] transition-colors flex-shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs text-gray-400">Add Photo</span>
              </div>
              {/* Photo 1 */}
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <button className="absolute top-1 right-1 w-5 h-5 bg-gray-800 bg-opacity-60 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {/* Photo 2 */}
              <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                <div className="w-full h-full bg-orange-50 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <button className="absolute top-1 right-1 w-5 h-5 bg-gray-800 bg-opacity-60 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400">Upload up to 5 photos. First photo will be the cover.</p>
          </div>

          {/* Product Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
            <input
              type="text"
              placeholder="e.g. Nike Air Max 97 White"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 outline-none focus:border-[#49BC9E] transition-colors"
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              placeholder="Describe size, color options, or condition..."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 outline-none focus:border-[#49BC9E] transition-colors resize-none"
            />
          </div>

          {/* Category + Max Capacity */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5">
                <span className="flex-1 text-sm text-gray-400">Select Category</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Capacity (Stock)</label>
              <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5">
                <input
                  type="text"
                  defaultValue="5"
                  className="flex-1 text-sm text-gray-700 outline-none bg-transparent"
                />
                <span className="text-sm text-gray-400 flex-shrink-0">Items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section: Pricing Configuration */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900">Pricing Configuration</h2>
            <span className="text-xs text-gray-500 bg-gray-100 rounded-full px-3 py-1">1 JPY = 105 IDR</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Left: Inputs */}
            <div>
              {/* Base Price */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Base Price (Source)</label>
                <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5">
                  <span className="text-sm text-gray-500 mr-2">¥</span>
                  <input
                    type="text"
                    defaultValue="12000"
                    className="flex-1 text-sm text-gray-700 outline-none bg-transparent"
                  />
                  <span className="text-sm text-gray-400 flex-shrink-0">JPY</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">~ Rp 1,260,000 (Base Cost)</p>
              </div>

              {/* Service Fee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Service Fee (IDR)</label>
                <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5">
                  <span className="text-sm text-gray-500 mr-2">Rp</span>
                  <input
                    type="text"
                    defaultValue="250000"
                    className="flex-1 text-sm text-gray-700 outline-none bg-transparent"
                  />
                  <span className="text-sm text-gray-400 flex-shrink-0">IDR</span>
                </div>
                <p className="text-xs text-[#49BC9E] mt-1">This is your profit per item.</p>
              </div>
            </div>

            {/* Right: Buyer's Price Preview */}
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="flex items-center gap-1 text-sm font-semibold text-gray-900 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-[#49BC9E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Buyer's Price Preview
              </p>
              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Product Cost (JPY → IDR)</span>
                  <span className="text-gray-700 font-medium">Rp 1,260,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Est. Customs (+10% Buffer)</span>
                  <span className="text-gray-700 font-medium">Rp 126,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jastiper Fee (You)</span>
                  <span className="text-gray-700 font-medium">Rp 250,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Platform Fee (5%)</span>
                  <span className="text-gray-700 font-medium">Rp 81,800</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Total Landed Cost</span>
                  <span className="font-bold text-[#49BC9E]">Rp 1,717,800</span>
                </div>
              </div>
              <p className="flex items-start gap-1 text-xs text-gray-400">
                <span className="flex-shrink-0 mt-0.5">ⓘ</span>
                Customs fees are estimated. If actual customs are lower, the difference is refunded to the buyer's wallet.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button className="px-6 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Save as Draft
          </button>
          <button className="px-6 py-2.5 text-sm font-semibold text-white bg-[#49BC9E] hover:bg-[#3da88d] rounded-lg transition-colors">
            Publish Listing
          </button>
        </div>

      </div>
    </div>
  )
}