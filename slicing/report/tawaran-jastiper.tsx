import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

const offers = [
  {
    name: 'Lee Sangwon',
    avatar: '/mas_ganteng.svg',
    verified: true,
    badge: 'Verified Jastiper',
    rating: 4.9,
    reviews: 42,
    arrivalDate: 'Oct 26',
    luggage: '2.5 kg left',
    price: 'Rp 5.245.000',
  },
  {
    name: 'Kim Taehyung',
    avatar: '/mas_ganteng.svg',
    verified: true,
    badge: 'Verified Jastiper',
    rating: 4.9,
    reviews: 42,
    arrivalDate: 'Oct 23',
    luggage: '2.5 kg left',
    price: 'Rp 5.445.000',
  },
  {
    name: 'Huh Yunjin',
    avatar: '/mas_ganteng.svg',
    verified: false,
    badge: 'New Jastiper',
    rating: null,
    reviews: null,
    arrivalDate: 'Oct 28',
    luggage: '4.0 kg left',
    price: 'Rp 5.100.000',
  },
]

export default function TawaranJastiper() {
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

        {/* Back */}
        <a href="#" className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors mb-5">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </a>

        {/* Request Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-medium text-[#49BC9E] bg-[#e6f7f3] rounded-full px-2.5 py-0.5">Open Request</span>
                <span className="text-xs text-gray-400">• Posted 2 days ago</span>
              </div>
              <h1 className="text-lg font-bold text-gray-900 mb-1">Nike Air Jordan 1 High OG "Chicago"</h1>
              <div className="flex items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  Japan
                </span>
                <span className="flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  ~1kg
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 mb-0.5">Target Price</p>
              <p className="text-xl font-bold text-[#49BC9E]">Rp 4.500.000</p>
            </div>
          </div>
        </div>

        {/* Offers Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">3 Jastiper made an offer</h2>
          <span className="flex items-center gap-1 text-xs text-[#49BC9E] bg-[#e6f7f3] rounded-full px-3 py-1">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            All offers include Escrow Protection
          </span>
        </div>

        {/* Offer Cards */}
        <div className="flex flex-col gap-4">
          {offers.map((offer) => (
            <div key={offer.name} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-stretch gap-6">
          
              {/* Kiri: Avatar + Info */}
              <div className="w-56 flex-shrink-0">
                <div className="flex items-center gap-3 mb-2">
                  <img src={offer.avatar} alt={offer.name} className="w-14 h-14 rounded-full object-cover flex-shrink-0" />
                  <div>
                    <p className="font-bold text-gray-900">{offer.name}</p>
                    <p className={`text-xs flex items-center gap-1 ${offer.verified ? 'text-[#49BC9E]' : 'text-orange-400'}`}>
                      <span>✓</span>{offer.badge}
                    </p>
                  </div>
                </div>
                {offer.rating ? (
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map((s) => (
                      <svg key={s} xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 ${s <= Math.floor(offer.rating) ? 'text-yellow-400' : 'text-gray-200'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="text-xs text-gray-500 ml-1">{offer.rating} ({offer.reviews} reviews)</span>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 mb-3">No Reviews yet</p>
                )}
                <div className="bg-gray-50 rounded-lg p-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Arrival Date</p>
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {offer.arrivalDate}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Luggage</p>
                    <p className="text-sm font-medium text-gray-700 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {offer.luggage}
                    </p>
                  </div>
                </div>
              </div>
          
              {/* Tengah: Harga */}
              <div className="flex-1 flex flex-col justify-center border-l border-gray-100 pl-6">
                <p className="text-xs text-gray-400 mb-1">Total Landed Cost</p>
                <p className="text-2xl font-bold text-gray-900 mb-1">{offer.price}</p>
                <p className="text-xs text-[#49BC9E] flex items-center gap-1">
                  <span>✓</span> Includes taxes, customs, and shipping
                </p>
              </div>
          
              {/* Kanan: Button */}
              <div className="flex flex-col items-center justify-center flex-shrink-0">
                <button className="bg-[#49BC9E] hover:bg-[#3da88d] transition-colors text-white text-sm font-semibold px-6 py-3 rounded-xl mb-1 w-44">
                  Accept & Pay Securely
                </button>
                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                  <span>🔒</span> Protected by Jastipal Escrow
                </p>
              </div>
          
            </div>
          
            {/* View Breakdown */}
            <button className="w-full flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-sm text-[#49BC9E] hover:text-[#3da88d] transition-colors">
              <span className="flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                </svg>
                View Transparent Cost Breakdown
              </span>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          ))}
        </div>
      </div>
    </div>
  )
}