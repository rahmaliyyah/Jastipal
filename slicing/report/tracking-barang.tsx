import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function TrackingBarangSlicing() {
  return (
    <div className={`${inter.className} min-h-screen bg-gray-100`}>

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <img src="/logo_jastipal.svg" alt="Jastipal" className="h-6 w-6" />
            <span className="font-bold text-gray-900">Jastipal</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
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
          <span className="hidden md:block text-sm font-medium text-gray-900">Han Yujin</span>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">

        {/* Back */}
        <a href="#" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </a>

        <div className="flex flex-col md:flex-row gap-4">

          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Order Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between mb-1">
                <h1 className="text-xl font-bold text-gray-900">Order #JP-29384</h1>
                <span className="text-sm font-semibold text-[#49BC9E]">Active</span>
              </div>
              <p className="text-sm text-gray-500 mb-3">Placed on Oct 24, 2026</p>
              <p className="text-xs text-gray-400 mb-4">
                Via Jastiper <span className="text-[#49BC9E] font-medium">Sarah T.</span> ✓
              </p>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 bg-[#49BC9E] hover:bg-[#3da88d] transition-colors text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Message
                </button>
                <button className="flex items-center gap-2 border border-gray-200 text-sm font-semibold text-gray-600 px-5 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Help
                </button>
              </div>
            </div>

            {/* Escrow Tracker */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-bold text-gray-900">Escrow Tracker</h2>
                <span className="text-xs text-gray-500 border border-gray-200 rounded-full px-3 py-1">Funds held securely</span>
              </div>

              <div className="relative">

                {/* Step 1 - Purchased (active) */}
                <div className="flex gap-4 mb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border-2 border-[#49BC9E] bg-white flex items-center justify-center z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#49BC9E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div className="w-px flex-1 bg-[#49BC9E] min-h-[120px]"></div>
                  </div>
                  <div className="flex-1 pb-6">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-gray-900">Purchased</p>
                      <span className="text-xs font-semibold text-[#49BC9E] bg-[#e6f7f3] rounded-full px-2.5 py-0.5">Active Step</span>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">Oct 26, 2023 at 02:15 PM</p>
                    <p className="text-sm text-gray-500 mb-3">The Jastiper has purchased your item. Please review the proof of purchase below.</p>
                    <div className="border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-700 font-medium">Official_Store_Receipt.jpg</p>
                          <p className="text-xs text-gray-400">Uploaded 2h ago</p>
                        </div>
                      </div>
                      <button className="flex items-center gap-1.5 border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        View Receipt
                      </button>
                    </div>
                  </div>
                </div>

                {/* Step 2 - Funded (done) */}
                <div className="flex gap-4 mb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border-2 border-[#49BC9E] bg-white flex items-center justify-center z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#49BC9E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="w-px flex-1 bg-gray-200 min-h-[80px]"></div>
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="text-sm font-bold text-gray-900 mb-1">Funded</p>
                    <p className="text-xs text-gray-400 mb-2">Oct 24, 2023 at 10:30 AM</p>
                    <p className="text-sm text-gray-500">Your payment of <span className="font-semibold text-gray-700">IDR 4,250,000</span> has been secured in escrow.</p>
                  </div>
                </div>

                {/* Step 3 - In Transit */}
                <div className="flex gap-4 mb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </div>
                    <div className="w-px flex-1 bg-gray-200 min-h-[80px]"></div>
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="text-sm font-bold text-gray-400 mb-1">In Transit</p>
                    <p className="text-sm text-gray-400">Jastiper is traveling back to Indonesia. Expected arrival: Oct 29, 2023.</p>
                  </div>
                </div>

                {/* Step 4 - Delivered */}
                <div className="flex gap-4 mb-0">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                      </svg>
                    </div>
                    <div className="w-px flex-1 bg-gray-200 min-h-[80px]"></div>
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="text-sm font-bold text-gray-400 mb-1">Delivered</p>
                    <p className="text-sm text-gray-400">Local delivery or meetup. You will have 3 days to inspect the item.</p>
                  </div>
                </div>

                {/* Step 5 - Funds Released */}
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center z-10">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-400 mb-1">Funds Released</p>
                    <p className="text-sm text-gray-400">Escrow completed. Funds released to Jastiper.</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Buyer Protection */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-blue-600 mb-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Jastipal Buyer Protection
              </p>
              <p className="text-sm text-blue-500 mb-2">Your funds are only released after you confirm you've received the correct item. If there is an issue, you can open a dispute within 3 days of delivery.</p>
              <a href="#" className="text-sm font-semibold text-gray-900 underline">Read our Buyer Protection Policy</a>
            </div>

          </div>

          {/* Right Column */}
          <div className="w-full md:w-72 flex flex-col gap-4">

            {/* Product Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4">Product Summary</h2>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">Sony WH-1000XM5 Wireless Noise Canceling Headphones</p>
                  <p className="text-xs text-gray-400">Color: Silver</p>
                  <p className="text-xs text-gray-400">Qty: 1</p>
                </div>
              </div>
              <div className="space-y-2 text-sm mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Product Price (JPY converted)</span>
                  <span className="text-gray-700 font-medium">IDR 3,850,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jastiper Fee</span>
                  <span className="text-gray-700 font-medium">IDR 250,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Platform Fee (5%)</span>
                  <span className="text-gray-700 font-medium">IDR 150,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Est. Customs Duty</span>
                  <span className="text-gray-700 font-medium">Included in Estimate</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="font-bold text-gray-900">Total Paid (Escrowed)</span>
                  <span className="font-bold text-[#49BC9E]">IDR 4,250,000</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-[10px] text-gray-400 text-center">Exchange Rate applied: 1 JPY = 105.4 IDR<br />(Mid-market rate, no hidden FX markup)</p>
              </div>
            </div>

            {/* About the Jastiper */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4">About the Jastiper</h2>
              <div className="flex items-center gap-3 mb-3">
                <img src="/mas_ganteng.svg" alt="Sangwon" className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-bold text-gray-900 flex items-center gap-1">Sangwon <span className="text-[#49BC9E]">✓</span></p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">⭐ 4.9 (24 trips)</p>
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-start gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-700">Trip: Tokyo (NRT) → Jakarta (CGK)</p>
                    <p className="text-xs text-gray-400">Flight Date: Oct 29, 2023</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-700">Domestic Delivery</p>
                    <p className="text-xs text-gray-400">JNE Regular (Included)</p>
                  </div>
                </div>
              </div>
              <button className="w-full text-sm font-medium text-[#49BC9E] hover:text-[#3da88d] transition-colors">
                View Jastiper Profile
              </button>
            </div>

            {/* Need Help */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-2">NEED HELP?</h2>
              <p className="text-sm text-gray-500 mb-4">If the item is not what you ordered or arrives damaged, please document it immediately.</p>
              <div className="space-y-2">
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Read FAQ
                </button>
                <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Report an Issue
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}