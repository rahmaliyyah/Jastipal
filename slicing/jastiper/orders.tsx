"use client"

import Link from "next/link"
import {
  BadgeCheck,
  Box,
  CreditCard,
  Info,
  PackageCheck,
} from "lucide-react"

export default function OrdersPage() {

  /*
    Dummy data sementara.
    Backend nanti tinggal replace dari API/database.
  */
  const orders = [
    {
      id: 1,
      title: "IVE Album REVIVE+ Vinyl LP (Limited Edition)",
      date: "25 April 2026",
      buyer: "Kim Jennie",
      role: "Pembeli",
      address:
        "Jl. Greenwood Golf I 7-21, Boro Teronggo, Tirtomoyo, Kec. Pakis, Kabupaten Malang, Jawa Timur 65154",
      status: "waiting_purchase" as const,
    },

    {
      id: 2,
      title: "Nintendo Switch OLED White Edition",
      date: "02 Mei 2026",
      buyer: "Park Jisoo",
      role: "Pembeli",
      address:
        "Jl. Melati Raya No. 12, Kel. Sukamaju, Kec. Taman Sari, Kota Jakarta Selatan 12190",
      status: "verifying" as const,
    },

    {
      id: 3,
      title: "Dummy Order (Sudah Diverifikasi)",
      date: "05 Mei 2026",
      buyer: "Dummy Buyer",
      role: "Pembeli",
      address:
        "Jl. Dummy No. 123, Kota Dummy, Provinsi Dummy",
      status: "verified" as const,
    },
  ]

  type OrderStatus =
    | "waiting_purchase"
    | "verifying"
    | "verified"

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {

      case "waiting_purchase":
        return (
          <div className="bg-[#FFF4E5] text-[#FF8A00] px-4 py-1 rounded-full text-[13px] font-medium whitespace-nowrap">
            Menunggu Pembelian
          </div>
        )

      case "verifying":
        return (
          <div className="bg-[#EEF4FF] text-[#2952CC] px-4 py-1 rounded-full text-[13px] font-medium whitespace-nowrap">
            Dalam Verifikasi
          </div>
        )

      case "verified":
        return (
          <div className="bg-[#ECFDF5] text-[#059669] px-4 py-1 rounded-full text-[13px] font-medium whitespace-nowrap">
            Sudah diverifikasi
          </div>
        )

      default:
        return null
    }
  }

  

  const waitingCount = orders.filter(
  (order) =>
    order.status === "waiting_purchase" ||
    order.status === "verifying" ||
    order.status === "verified"
).length

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-8 overflow-x-hidden">

        {/* HEADER */}
        <div>
          <h1 className="text-[32px] font-bold text-[#1E293B]">
            Pesanan Masuk
          </h1>

          <p className="mt-2 text-[16px] text-[#64748B]">
            Kelola pesanan yang sedang kamu proses
          </p>
        </div>

        {/* TABS */}
        <div className="flex items-center gap-8 mt-8 overflow-x-auto border-b border-[#E2E8F0]">

          <button className="relative pb-4 text-[#59D3B4] font-semibold text-[16px] whitespace-nowrap flex items-center gap-2">
  
  <span>Menunggu</span>

  <span className="min-w-[22px] h-[22px] px-2 flex items-center justify-center bg-[#DCFCE7] text-[#59D3B4] text-[13px] font-semibold rounded-full">
    {waitingCount}
  </span>

  <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#59D3B4]" />
</button>

          <button className="pb-4 text-[#64748B] font-semibold text-[16px] whitespace-nowrap">
            Dikirim
          </button>

          <button className="pb-4 text-[#64748B] font-semibold text-[16px] whitespace-nowrap">
            Selesai
          </button>

          <button className="pb-4 text-[#64748B] font-semibold text-[16px] whitespace-nowrap">
            Dibatalkan
          </button>

        </div>

        {/* ORDER LIST */}
        <div className="space-y-6 mt-6">

          {orders.map((order) => (

            <div
              key={order.id}
              className="bg-white border border-[#CBD5E1] rounded-xl p-5"
            >

              {/* TOP */}
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">

                <div>
                  <h2 className="text-[20px] font-bold text-[#0F172A] leading-snug">
                    {order.title}
                  </h2>

                  <p className="mt-1 text-[15px] text-[#64748B]">
                    {order.date}
                  </p>
                </div>

                {getStatusBadge(order.status)}

              </div>

              {/* PROGRESS */}
              <div className="mt-7 relative">

                {/* BASE LINE */}
                <div className="absolute top-[22px] left-0 w-full h-[2px] bg-[#E2E8F0]" />

                {/* VERIFIED LINE */}
                {order.status === "verified" && (
                  <div className="absolute top-[22px] left-0 w-[33%] h-[2px] bg-[#59D3B4]" />
                )}

                <div className="relative flex items-center justify-between gap-2">

                  {/* STEP 1 */}
                  <div
                    className={`w-11 h-11 rounded-full border-2 bg-white flex items-center justify-center z-10 ${
                      order.status === "verified"
                        ? "border-[#2563EB]"
                        : "border-[#59D3B4]"
                    }`}
                  >
                    <CreditCard
                      size={18}
                      className={
                        order.status === "verified"
                          ? "text-[#2563EB]"
                          : "text-[#59D3B4]"
                      }
                    />
                  </div>

                  {/* STEP 2 */}
                  <div
                    className={`w-11 h-11 rounded-full border-2 bg-white flex items-center justify-center z-10 ${
                      order.status === "verified"
                        ? "border-[#59D3B4]"
                        : "border-[#E2E8F0]"
                    }`}
                  >
                    <PackageCheck
                      size={18}
                      className={
                        order.status === "verified"
                          ? "text-[#59D3B4]"
                          : "text-[#94A3B8]"
                      }
                    />
                  </div>

                  {/* STEP 3 */}
                  <div className="w-11 h-11 rounded-full border-2 border-[#E2E8F0] bg-white flex items-center justify-center z-10">
                    <Box
                      size={18}
                      className="text-[#94A3B8]"
                    />
                  </div>

                  {/* STEP 4 */}
                  <div className="w-11 h-11 rounded-full border-2 border-[#E2E8F0] bg-white flex items-center justify-center z-10">
                    <BadgeCheck
                      size={18}
                      className="text-[#94A3B8]"
                    />
                  </div>

                </div>
              </div>

              {/* CONTENT */}
              <div className="mt-8">

                {/* ADDRESS */}
                <div>
                  <h3 className="text-[18px] font-bold text-[#0F172A]">
                    Pengiriman:
                  </h3>

                  <p className="mt-2 text-[15px] text-[#1E293B] leading-relaxed max-w-[950px]">
                    {order.address}
                  </p>
                </div>

                {/* BUYER */}
                <div className="mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                  <div className="flex items-center gap-3">

                    <img
                      src="/Vector.svg"
                      alt="Buyer"
                      className="w-12 h-12 rounded-full object-cover"
                    />

                    <div>
                      <h3 className="text-[18px] font-bold text-[#0F172A]">
                        {order.buyer}
                      </h3>

                      <p className="text-[13px] text-[#94A3B8]">
                        {order.role}
                      </p>
                    </div>

                  </div>

                  <button className="w-full md:w-[120px] h-[44px] rounded-xl bg-[#59D3B4] hover:bg-[#4CC2A5] text-white font-semibold text-[16px] shadow-md shadow-[#59D3B433] transition-all">
                    Hubungi
                  </button>

                </div>

                {/* ========================= */}
                {/* WAITING PURCHASE */}
                {/* ========================= */}
                {order.status === "waiting_purchase" && (
                  <div className="mt-6">
                    <Link
                      href="/preview/jastiper/upload-proof"
                      className="
                        w-full
                        h-[56px]
                        rounded-xl
                        bg-[#59D3B4]
                        hover:bg-[#46C3A3]
                        transition-all
                        shadow-lg
                        shadow-teal-100
                        flex
                        items-center
                        justify-center
                        text-white
                        font-semibold
                        text-[16px]
                      "
                    >
                      Upload Bukti Pembelian
                    </Link>
                  </div>
                )}

                {/* ========================= */}
                {/* VERIFYING */}
                {/* ========================= */}
                {order.status === "verifying" && (
                  <div className="mt-6 bg-[#EEF4FF] border border-[#D7E3FF] rounded-xl p-4 flex items-start gap-3">

                    <Info
                      size={20}
                      className="text-[#2952CC] flex-shrink-0 mt-[2px]"
                    />

                    <div>
                      <h3 className="text-[16px] font-bold text-[#2952CC]">
                        Pembayaran Sedang Diverifikasi
                      </h3>

                      <p className="mt-1 text-[13px] text-[#2952CC] leading-relaxed">
                        Admin sedang memeriksa bukti transfer Anda.
                        Mohon tunggu maksimal 1×24 jam.
                      </p>
                    </div>

                  </div>
                )}

              </div>

            </div>

          ))}

        </div>
      </div>
    </main>
  )
}