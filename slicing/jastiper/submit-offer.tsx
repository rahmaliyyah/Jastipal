import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function SubmitOfferSlicing() {
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
      <div className="max-w-5xl mx-auto px-8 py-8">

        {/* Back */}
        <a href="#" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Request
        </a>

        <div className="grid grid-cols-5 gap-4">

          {/* Left Column */}
          <div className="col-span-3 flex flex-col gap-4">

            {/* Request Details */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4">Request Details</h2>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">Apple iPhone 15 Pro Max (256GB, Natural Titanium)</p>
                  <p className="text-xs text-gray-500">Purchase from: Japan (Apple Store Ginza)</p>
                  <p className="text-xs text-gray-500">Qty: 1 &nbsp;·&nbsp; Delivery: Dec 20, 2026</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Buyer's Max Budget</p>
                  <p className="text-sm font-semibold text-gray-900">IDR 24,000,000</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Delivery Method</p>
                  <p className="text-sm font-semibold text-gray-900">Courier (JNE/J&T)</p>
                </div>
              </div>
            </div>

            {/* Submit Your Offer */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-1">Submit Your Offer</h2>
              <p className="text-xs text-gray-500 mb-5">Provide transparent pricing. Platform fees and customs estimates are calculated automatically.</p>

              {/* Step 1 */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-400 mb-3">1 &nbsp; Product Cost & Currency</p>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Source Currency</label>
                    <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5">
                      <span className="flex-1 text-sm text-gray-700">JPY - Japanese Yen</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">↗ Mid-market rate: 1 JPY = 105.42 IDR</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Product Price (Source)</label>
                    <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5">
                      <span className="text-sm text-gray-500 mr-2">¥</span>
                      <input type="text" defaultValue="189800" className="flex-1 text-sm text-gray-700 outline-none bg-transparent" />
                      <span className="text-sm text-gray-400 flex-shrink-0">JPY</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">= IDR 20,008,716</p>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-400 mb-3">2 &nbsp; Your Fees & Logistics</p>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Jastiper Service Fee (IDR)</label>
                    <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5">
                      <span className="text-sm text-gray-500 mr-2">Rp</span>
                      <input type="text" defaultValue="1500000" className="flex-1 text-sm text-gray-700 outline-none bg-transparent" />
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1">Your profit margin before expenses.</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Domestic Shipping (IDR)</label>
                    <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5">
                      <span className="text-sm text-gray-500 mr-2">Rp</span>
                      <input type="text" defaultValue="25000" className="flex-1 text-sm text-gray-700 outline-none bg-transparent" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Flight Arrival Date</label>
                    <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5">
                      <input type="text" defaultValue="12/18/2023" className="flex-1 text-sm text-gray-700 outline-none bg-transparent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">Available Weight (Kg)</label>
                    <div className="flex items-center border border-gray-200 rounded-lg px-3 py-2.5">
                      <input type="text" defaultValue="1.5" className="flex-1 text-sm text-gray-700 outline-none bg-transparent" />
                      <span className="text-sm text-gray-400 flex-shrink-0">kg</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button className="px-5 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">Cancel</button>
                <button className="px-5 py-2 text-sm font-semibold text-white bg-[#49BC9E] hover:bg-[#3da88d] rounded-lg transition-colors">Submit Offer</button>
              </div>
            </div>

            {/* Customs Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <span className="text-amber-400 flex-shrink-0 mt-0.5">⚠</span>
              <div>
                <p className="text-sm font-semibold text-amber-600 mb-1">Customs Responsibility</p>
                <p className="text-xs text-amber-500">You are responsible for truthfully declaring this item upon arrival in Indonesia. The system will add an estimated customs buffer to the buyer's total.</p>
              </div>
            </div>

          </div>

          {/* Right Column */}
          <div className="col-span-2 flex flex-col gap-4">

            {/* Buyer's Landed Cost Preview */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4">Buyer's Landed Cost Preview</h2>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">Sony WH-1000XM5 Wireless Noise Canceling Headphones</p>
                  <p className="text-xs text-gray-500 mt-1">Color: Silver</p>
                  <p className="text-xs text-gray-500">Qty: 1</p>
                </div>
              </div>
              <div className="space-y-2 text-xs mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Product Price (JPY converted)</span>
                  <span className="text-gray-700 font-medium">IDR 20,008,716</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Jastiper Fee</span>
                  <span className="text-gray-700 font-medium">IDR 1,500,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Platform Fee (5%)</span>
                  <span className="text-gray-700 font-medium">IDR 1,076,685</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Est. Customs Duty</span>
                  <span className="text-gray-700 font-medium">Rp 3,850,000</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-semibold text-gray-900">Total Payable</span>
                  <span className="font-bold text-[#49BC9E]">IDR 26,460,401</span>
                </div>
              </div>
              <p className="text-[10px] text-gray-400">Exchange Rate applied: 1 JPY = 105.4 IDR (Mid-market rate, no hidden FX markup)</p>
            </div>

            {/* Your Net Earnings */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-2">Your Net Earnings</h2>
              <p className="text-2xl font-bold text-[#49BC9E] mb-1">Rp 1,525,000</p>
              <p className="text-xs text-gray-500 mb-3">Service Fee + Shipping Reimbursement</p>
              <div className="bg-[#e6f7f3] border border-[#49BC9E]/30 rounded-lg p-3">
                <p className="text-xs text-[#49BC9E]">Product cost (¥ 189,800) is reimbursed separately upon proof of purchase.</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}