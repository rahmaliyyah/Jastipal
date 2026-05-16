"use client"

import {
  Bell,
  Plus,
  Search,
  ShoppingCart,
} from "lucide-react"
import Link from "next/link"


export default function JastiperDashboardPage() {

  /*
    Dummy data sementara.
    Nanti backend tinggal replace value ini dari API/database.
  */
  const unpaidInvoices = 1

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-6 py-8">

        {/* HEADER */}
        <div className="mb-10">
          <h1 className="text-[28px] font-bold text-[#1E293B]">
            Selamat datang, Rora! 🙌🏻
          </h1>

          <p className="mt-2 text-[17px] text-[#64748B] max-w-[700px]">
            Kelola titipan pelanggan dan pantau pesananmu
            dengan mudah di satu tempat.
          </p>

          {/* PAYMENT ALERT */}
          {unpaidInvoices > 0 && (
            <div className="mt-6 border border-[#C7D2FE] bg-[#EEF2FF] rounded-2xl p-5 flex items-start gap-4">

              {/* ICON */}
              <div className="mt-1 flex-shrink-0">
                <Bell className="w-6 h-6 text-[#1D4ED8]" />
              </div>

              {/* CONTENT */}
              <div>
                <h3 className="text-[18px] font-bold text-[#1D4ED8]">
                  {unpaidInvoices} tagihan menunggu pembayaran
                </h3>

                <p className="mt-1 text-[15px] text-[#1E3A8A] leading-relaxed">
                  Segera lakukan pembayaran sebelum batas waktu berakhir
                </p>
              </div>

            </div>
          )}
        </div>

        {/* TITLE */}
        <h2 className="text-[20px] font-semibold text-[#0F172A] mb-6">
          Aksi Cepat
        </h2>

        {/* QUICK ACTION */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* BROWSE REQUEST */}
          <Link href="/preview/jastiper/browse-request">
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 min-h-[140px] hover:shadow-md transition-all cursor-pointer hover:shadow-md">
              <div className="w-12 h-12 rounded-xl bg-[#59D3B4] flex items-center justify-center shadow-md shadow-teal-100">
                <Search className="text-white" size={24} />
              </div>

              <h3 className="mt-5 text-[18px] font-bold text-[#0F172A]">
                Browse Request
              </h3>

              <p className="mt-2 text-[16px] text-[#64748B] leading-relaxed">
                Cari permintaan titip yang bisa kamu ambil
              </p>
            </div>
          </Link>



          {/* BUAT TRIP */}
          <div className="bg-white border border-[#CBD5E1] rounded-2xl p-5 min-h-[140px] hover:shadow-md transition-all">

            <div className="w-12 h-12 rounded-xl bg-[#59D3B4] flex items-center justify-center shadow-md shadow-teal-100">
              <Plus className="text-white" size={24} />
            </div>

            <h3 className="mt-5 text-[18px] font-bold text-[#0F172A]">
              Buat Trip
            </h3>

            <p className="mt-2 text-[16px] text-[#64748B] leading-relaxed">
              Buat perjalanan baru dan tambahkan katalog produkmu
            </p>
          </div>

          {/* ORDER MASUK */}
          <div className="lg:col-span-2 bg-white border border-[#CBD5E1] rounded-2xl p-5 min-h-[100px] hover:shadow-md transition-all">

            <div className="flex items-start gap-4">

              <div className="w-12 h-12 rounded-xl bg-[#59D3B4] flex items-center justify-center shadow-md shadow-teal-100 flex-shrink-0">
                <ShoppingCart className="text-white" size={24} />
              </div>

              <div>
                <h3 className="text-[18px] font-bold text-[#0F172A]">
                  Order Masuk
                </h3>

                <p className="mt-1 text-[16px] text-[#64748B] leading-relaxed">
                  Kelola pesanan pelanggan yang perlu diproses
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  )
}