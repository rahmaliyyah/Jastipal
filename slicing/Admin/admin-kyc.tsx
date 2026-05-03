import AdminNavbar from '@/components/shared/AdminNavbar'

export default function AdminKYCSlicing() {
  const hasData = true // 🔥 ubah true/false buat test

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col w-full">

      {/* NAVBAR */}
      <AdminNavbar />

      <div className="max-w-[1280px] mx-auto px-6 py-10 w-full">

        {/* HEADER */}
        <h1 className="text-[24px] font-semibold text-[#0F172A] mb-6">
          Verifikasi KYC
        </h1>

        {/* TABS */}
        <div className="flex items-center gap-6 border-b border-gray-200 mb-6">
          
          <div className="flex items-center gap-2 pb-2 border-b-2 border-[#14B8A6] text-[#14B8A6] font-medium">
            Menunggu
            <span className="bg-[#E6F7F5] text-[#14B8A6] text-xs px-2 py-0.5 rounded-full">
              1
            </span>
          </div>

          <div className="text-gray-500 pb-2 cursor-pointer">
            Disetujui
          </div>

          <div className="text-gray-500 pb-2 cursor-pointer">
            Ditolak
          </div>
        </div>

        {/* CONTENT */}
        {hasData ? (
          <div className="space-y-4">

            {/* CARD */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-between">
              
              <div className="flex items-center gap-4">

                {/* AVATAR */}
                <img
                  src="/avatar-default.png"
                  className="w-12 h-12 rounded-full object-cover"
                />

                {/* INFO */}
                <div>
                  <p className="font-semibold text-[#0F172A]">
                    Kim Taehyung
                  </p>
                  <p className="text-sm text-[#64748B]">
                    taehyung@student.ub.ac.id
                  </p>

                  <div className="flex gap-6 mt-2 text-sm text-[#64748B]">
                    <span>Domisili: Korea</span>
                    <span>Service Fee: 5%</span>
                  </div>
                </div>
              </div>

              {/* RIGHT */}
              <div className="flex items-center gap-4">
                
                <span className="text-orange-500 text-sm font-medium">
                  Menunggu
                </span>

                <button className="text-[#14B8A6] text-sm font-medium flex items-center gap-1">
                  Lihat Detail →
                </button>

              </div>
            </div>

          </div>
        ) : (
          
          /* EMPTY STATE */
          <div className="flex flex-col items-center justify-center mt-20 text-center">
            
            <img
              src="/empty.svg"
              className="w-40 mb-4 opacity-80"
            />

            <p className="text-[#0F172A] font-medium">
              Belum ada pengajuan
            </p>

            <p className="text-sm text-[#64748B] mt-1">
              Data pengajuan KYC akan muncul di sini
            </p>

          </div>
        )}

      </div>
    </div>
  )
}