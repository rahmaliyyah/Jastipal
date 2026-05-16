import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function PaymentSlicing() {
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

        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout & Escrow Payment</h1>

        <div className="flex flex-col md:flex-row gap-4">

          {/* Left Column */}
          <div className="flex-1 flex flex-col gap-4">

            {/* Escrow Notice */}
            <div className="bg-[#e6f7f3] border border-[#49BC9E]/30 rounded-xl p-4 flex items-start gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-[#49BC9E] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-[#49BC9E] mb-1">Funds held securely by Jastipal</p>
                <p className="text-sm text-[#49BC9E]">Your payment is held in our escrow account. The Jastiper (traveler) only gets paid after you confirm you have received the item in good condition.</p>
              </div>
            </div>

            {/* Delivery Address */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-gray-900">Delivery Address</h2>
                <button className="text-sm text-[#49BC9E] font-medium hover:underline">Edit</button>
              </div>
              <div className="flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-gray-900">Sari Rahayu</p>
                  <p className="text-sm text-gray-500">Jl. Jendral Sudirman No. 45, Kebayoran Baru</p>
                  <p className="text-sm text-gray-500">Jakarta Selatan, DKI Jakarta 12190</p>
                  <p className="text-sm text-gray-500">+62 812 3456 7890</p>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-4">Select Payment Method</h2>
              <div className="flex flex-col gap-3">

                {/* Bank Virtual Account - selected */}
                <label className="flex items-start gap-3 border-2 border-[#49BC9E] rounded-xl p-4 cursor-pointer">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Bank Virtual Account</p>
                    <p className="text-xs text-gray-500">Instant confirmation, no manual upload.</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-[#49BC9E] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#49BC9E]"></div>
                  </div>
                </label>

                {/* E-Wallet / QRIS */}
                <label className="flex items-start gap-3 border border-gray-200 rounded-xl p-4 cursor-pointer hover:border-[#49BC9E] transition-colors">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">E-Wallet / QRIS</p>
                    <p className="text-xs text-gray-500">Scan via GoPay, OVO, ShopeePay.</p>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0 mt-0.5"></div>
                </label>

                {/* Credit Card - coming soon */}
                <div className="flex items-start gap-3 border border-gray-100 rounded-xl p-4 opacity-50 cursor-not-allowed">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-400">Credit Card (Coming Soon)</p>
                    <p className="text-xs text-gray-400">Visa, Mastercard</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Note */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-start gap-2">
              <span className="text-blue-400 flex-shrink-0 mt-0.5">ⓘ</span>
              <p className="text-sm text-blue-500">
                <span className="font-semibold">Note:</span> No post-delivery cash collection allowed. All payments must be completed securely through the Jastipal platform to ensure escrow protection.
              </p>
            </div>

          </div>

          {/* Right Column */}
          <div className="w-full md:w-80 flex flex-col gap-4">

            {/* Order Summary */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-base font-bold text-gray-900 mb-1">Order Summary</h2>
              <p className="text-xs text-gray-400 mb-4">Transaction ID: #JST-882910</p>

              {/* Product */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-0.5">Onitsuka Tiger Mexico 66</p>
                  <p className="text-xs text-gray-400">Color: Yellow/Black, Size: 42</p>
                  <p className="text-xs text-gray-400">Request from: Japan (JP)</p>
                </div>
              </div>

              {/* Traveler */}
              <div className="flex items-center justify-between border border-gray-100 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-500">JD</div>
                  <div>
                    <p className="text-xs font-semibold text-gray-700">Traveler: Jhonny Doe</p>
                    <p className="text-xs text-[#49BC9E] flex items-center gap-1">✓ Verified Jastiper</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Arrives</p>
                  <p className="text-sm font-bold text-gray-900">Oct 24</p>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="mb-4">
                <p className="text-sm font-bold text-gray-900 mb-3">Landed Cost Breakdown</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      Product Price (JPY 13,000)
                      <span className="text-[10px] text-gray-400 border border-gray-200 rounded px-1">ⓘ</span>
                    </span>
                    <span className="text-gray-700 font-medium">IDR 1.430.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      Estimated Customs
                      <span className="text-[10px] text-orange-400 border border-orange-200 rounded px-1">Est.</span>
                    </span>
                    <span className="text-gray-700 font-medium">IDR 250.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Jastiper Service Fee</span>
                    <span className="text-gray-700 font-medium">IDR 150.000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Platform Fee (5%)</span>
                    <span className="text-gray-700 font-medium">IDR 91.500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Domestic Shipping (JNE Reg)</span>
                    <span className="text-gray-700 font-medium">IDR 15.000</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100">
                    <span className="font-bold text-gray-900">Total Payment</span>
                    <span className="font-bold text-[#49BC9E]">IDR 1.936.500</span>
                  </div>
                </div>
              </div>

              {/* Pay Button */}
              <button className="w-full bg-[#49BC9E] hover:bg-[#3da88d] transition-colors text-white font-semibold text-sm py-3 rounded-lg mb-3">
                Pay Securely
              </button>
              <p className="text-xs text-gray-400 text-center">
                By clicking the button, you agree to Jastipal's{' '}
                <a href="#" className="text-[#49BC9E] underline">Terms of Service</a>
                {' '}&{' '}
                <a href="#" className="text-[#49BC9E] underline">Escrow Policy</a>
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}