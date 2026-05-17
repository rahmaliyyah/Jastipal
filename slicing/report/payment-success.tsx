import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function PaymentSuccessSlicing() {
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
      <div className="max-w-2xl mx-auto px-4 md:px-8 py-12">

        {/* Icon */}
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-full bg-[#e6f7f3] flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-[#49BC9E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-3">Payment Successful</h1>
        <p className="text-sm text-gray-500 text-center mb-8">
          Your funds are now held securely in escrow. The traveler will be notified to proceed with your purchase.
        </p>

        {/* Order Summary */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-base font-bold text-gray-900">Order Summary</p>
              <p className="text-xs text-gray-400">Transaction ID: #JST-882910</p>
            </div>
            <span className="text-xs font-semibold text-[#49BC9E] bg-[#e6f7f3] border border-[#49BC9E]/30 rounded-full px-3 py-1">Paid & Escrowed</span>
          </div>

          {/* Product */}
          <div className="flex items-start gap-3 pb-4 border-b border-gray-100 mb-4">
            <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Onitsuka Tiger Mexico 66</p>
              <p className="text-xs text-gray-400">Color: Yellow/Black, Size: 42</p>
            </div>
          </div>

          {/* Jastiper + Amount */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-500 flex-shrink-0">JD</div>
              <div>
                <p className="text-xs text-gray-400">Jastiper</p>
                <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">Jhonny Doe <span className="text-[#49BC9E]">✓</span></p>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div>
                <p className="text-xs text-gray-400">Total Amount</p>
                <p className="text-sm font-bold text-[#49BC9E]">IDR 1.936.500</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Est. Delivery</p>
                <p className="text-sm font-bold text-gray-900">Oct 24</p>
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <button className="px-6 py-2.5 text-sm font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
            Back to Home
          </button>
          <button className="px-6 py-2.5 text-sm font-semibold text-white bg-[#49BC9E] hover:bg-[#3da88d] rounded-lg transition-colors">
            Track Your Order
          </button>
        </div>

        {/* Escrow Note */}
        <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-[#49BC9E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Protected by Jastipal Escrow Guarantee
        </p>

      </div>
    </div>
  )
}