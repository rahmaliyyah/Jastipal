import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

const countries = [
  { flag: '🇯🇵', name: 'Japan' },
  { flag: '🇰🇷', name: 'Korea' },
  { flag: '🇺🇸', name: 'USA' },
  { flag: '🇨🇳', name: 'China' },
  { flag: '🇸🇬', name: "S'pore" },
]

export default function RequestBarangSlicing() {
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

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">New Request</h1>
          <p className="text-sm text-gray-500">Tell us what you want from overseas.</p>
        </div>

        {/* Section: Product Details */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <h2 className="text-base font-bold text-gray-900 mb-4">Product Details</h2>

          {/* Product Link */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Link</label>
            <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              <input
                type="text"
                placeholder="Paste URL from Amazon, Shopee JP, Olive Young..."
                className="flex-1 text-sm text-gray-400 placeholder-gray-400 outline-none bg-transparent"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5">We'll try to fetch details automatically.</p>
          </div>

          {/* Or Upload Image */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Or Upload Image</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg px-6 py-6 flex flex-col items-center justify-center cursor-pointer hover:border-[#49BC9E] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-center">
                <span className="text-[#49BC9E] font-medium">Upload a file</span>
                <span className="text-gray-500"> or drag and drop</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
            </div>
          </div>

          {/* Item Name + Quantity */}
          <div className="flex items-start gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Item Name</label>
              <input
                type="text"
                placeholder="e.g. Sony WH-1000XM5"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 outline-none focus:border-[#49BC9E] transition-colors"
              />
            </div>
            <div className="w-36">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Quantity</label>
              <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                <button className="px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 border-r border-gray-200">-</button>
                <span className="flex-1 text-center text-sm text-gray-900 py-2.5">1</span>
                <button className="px-3 py-2.5 text-sm text-gray-500 hover:bg-gray-50 border-l border-gray-200">+</button>
              </div>
            </div>
          </div>

          {/* Variant / Specifics */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Variant / Specifics</label>
            <input
              type="text"
              placeholder="e.g. Size M, Color Black, 256GB"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 outline-none focus:border-[#49BC9E] transition-colors"
            />
          </div>
        </div>

        {/* Section: Logistics & Budget */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="text-base font-bold text-gray-900 mb-4">Logistics & Budget</h2>

          {/* Buy from which country */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Buy from which country?</label>
            <div className="flex items-center gap-3 flex-wrap">
              {countries.map((c) => (
                <div key={c.name} className="flex flex-col items-center gap-1 border border-gray-200 rounded-lg px-4 py-2.5 cursor-pointer hover:border-[#49BC9E] transition-colors min-w-[64px]">
                  <span className="text-2xl">{c.flag}</span>
                  <span className="text-xs text-gray-600">{c.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Latest Arrival Date + Delivery Preference */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Latest Arrival Date</label>
              <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-400">mm/dd/yyyy</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Delivery Preference</label>
              <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5">
                <span className="flex-1 text-sm text-gray-700">Domestic Courier (JNE/J&T)</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Max Budget Slider */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-gray-700">Max Budget (IDR)</label>
              <span className="text-sm font-semibold text-[#49BC9E]">Rp 1.500.000</span>
            </div>
            <input
              type="range"
              min={100000}
              max={10000000}
              defaultValue={1500000}
              className="w-full accent-[#49BC9E]"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Rp 100rb</span>
              <span>Rp 10jt+</span>
            </div>
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <span>ⓘ</span> Optional: Leave blank for open offers
            </p>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Additional Notes</label>
            <textarea
              placeholder="Any specific instructions about packaging, receipt, etc."
              rows={3}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm placeholder-gray-400 outline-none focus:border-[#49BC9E] transition-colors resize-none"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <span className="text-sm text-gray-400">You won't be charged yet.</span>
          <button className="bg-[#49BC9E] hover:bg-[#3da88d] transition-colors text-white text-sm font-semibold px-6 py-2.5 rounded-lg">
            Request Item
          </button>
        </div>

      </div>
    </div>
  )
}