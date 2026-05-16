"use client"

import { useState } from "react"
import Link from "next/link"

import {
  BadgeCheck,
  Box,
  CreditCard,
  Info,
  PackageCheck,
} from "lucide-react"

export default function OrdersPage() {

  const [activeTab, setActiveTab] = useState("waiting")

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
      shippingDate: "26 April 2026",
      courier: "JNE Express",
      trackingNumber: "JTP240511847291",
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
      shippingDate: "03 Mei 2026",
      courier: "SiCepat",
      trackingNumber: "SICEPAT24051122",
      status: "verifying" as const,
    },
    {
      id: 3,
      title: "Dummy Order (Sudah Diverifikasi)",
      date: "05 Mei 2026",
      buyer: "Dummy Buyer",
      role: "Pembeli",
      address: "Jl. Dummy No. 123, Kota Dummy, Provinsi Dummy",
      shippingDate: "06 Mei 2026",
      courier: "J&T Express",
      trackingNumber: "JNT9988776655",
      status: "verified" as const,
    },
    {
      id: 4,
      title: "Sony WH-1000XM5 Wireless Headphones",
      date: "08 Mei 2026",
      buyer: "Lee Chaeyeon",
      role: "Pembeli",
      address:
        "Jl. Pahlawan No. 45, Kel. Kauman, Kec. Klojen, Kota Malang, Jawa Timur 65119",
      shippingDate: "09 Mei 2026",
      courier: "JNE Express",
      trackingNumber: "JNE240509123456",
      status: "shipping" as const,
    },
    {
      id: 5,
      title: "LEGO Technic Bugatti Chiron 42083",
      date: "10 Mei 2026",
      buyer: "Kang Yeoseo",
      role: "Pembeli",
      address:
        "Jl. Sudirman No. 77, Kel. Purwantoro, Kec. Blimbing, Kota Malang, Jawa Timur 65122",
      shippingDate: "11 Mei 2026",
      courier: "SiCepat",
      trackingNumber: "SICE240511987654",
      status: "completed" as const,
    },
    {
      id: 6,
      title: "Apple AirPods Pro (2nd Generation)",
      date: "12 Mei 2026",
      buyer: "Han Seojun",
      role: "Pembeli",
      address:
        "Jl. Veteran No. 10, Kel. Sumbersari, Kec. Lowokwaru, Kota Malang, Jawa Timur 65145",
      shippingDate: "13 Mei 2026",
      courier: "J&T Express",
      trackingNumber: "JT240512654321",
      status: "cancelled" as const,
    },
  ]

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "waiting")
      return ["waiting_purchase", "verifying", "verified"].includes(order.status)
    if (activeTab === "shipping")   return order.status === "shipping"
    if (activeTab === "completed")  return order.status === "completed"
    if (activeTab === "cancelled")  return order.status === "cancelled"
    return true
  })

  type OrderStatus =
    | "waiting_purchase"
    | "verifying"
    | "verified"
    | "shipping"
    | "completed"
    | "cancelled"

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
            Sudah Diverifikasi
          </div>
        )
      case "shipping":
        return (
          <div className="bg-[#F0F9FF] text-[#0284C7] px-4 py-1 rounded-full text-[13px] font-medium whitespace-nowrap">
            Dalam Pengiriman
          </div>
        )
      case "completed":
        return (
          <div className="bg-[#ECFDF5] text-[#059669] px-4 py-1 rounded-full text-[13px] font-medium whitespace-nowrap">
            Selesai
          </div>
        )
      case "cancelled":
        return (
          <div className="bg-[#FEF2F2] text-[#DC2626] px-4 py-1 rounded-full text-[13px] font-medium whitespace-nowrap">
            Dibatalkan
          </div>
        )
      default:
        return null
    }
  }

  /*
   * Progress bar width per status:
   * waiting_purchase / verifying → w-0      (hanya step 1 aktif, tidak ada garis hijau)
   * verified                     → w-[33%]  (step 1–2 aktif)
   * shipping                     → w-[66%]  (step 1–3 aktif)
   * completed                    → w-full   (semua step aktif)
   */
  const getProgressLine = (status: OrderStatus): string => {
    if (status === "verified")  return "w-[33%]"
    if (status === "shipping")  return "w-[66%]"
    if (status === "completed") return "w-full"
    return "w-0"
  }

  /* Returns border + icon color classes for each step circle */
  const stepClass = (
    status: OrderStatus,
    stepIndex: number
  ): { border: string; icon: string } => {
    const teal  = { border: "border-[#59D3B4]", icon: "text-[#59D3B4]" }
    const blue  = { border: "border-[#2563EB]", icon: "text-[#2563EB]" }
    const grey  = { border: "border-[#E2E8F0]", icon: "text-[#94A3B8]" }

    if (status === "completed") return teal  // all 4 steps teal

    if (status === "shipping") {
      if (stepIndex <= 2) return blue
      if (stepIndex === 3) return teal
      return grey
    }

    if (status === "verified") {
      if (stepIndex === 1) return blue
      if (stepIndex === 2) return teal
      return grey
    }

    // waiting_purchase / verifying / cancelled
    if (stepIndex === 1) return teal
    return grey
  }

  const waitingCount = orders.filter(
    (o) =>
      o.status === "waiting_purchase" ||
      o.status === "verifying" ||
      o.status === "verified"
  ).length

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-8 overflow-x-hidden">

        {/* HEADER */}
        <div>
          <h1 className="text-[32px] font-bold text-[#1E293B]">Pesanan Masuk</h1>
          <p className="mt-2 text-[16px] text-[#64748B]">Kelola pesanan yang sedang kamu proses</p>
        </div>

        {/* TABS */}
        <div className="flex gap-10 mt-8 overflow-x-auto border-b border-[#D6DDEB]">

          <button
            onClick={() => setActiveTab("waiting")}
            className={`relative pb-4 font-semibold text-[16px] whitespace-nowrap flex items-center gap-2 ${
              activeTab === "waiting"
                ? "text-[#59D3B4] border-b-2 border-[#59D3B4]"
                : "text-[#667085]"
            }`}
          >
            <span>Menunggu</span>
            <span className="min-w-[24px] h-[24px] px-2 flex items-center justify-center bg-[#DCFCE7] text-[#59D3B4] text-[13px] font-semibold rounded-full">
              {waitingCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("shipping")}
            className={`pb-4 font-semibold text-[16px] whitespace-nowrap ${
              activeTab === "shipping"
                ? "text-[#59D3B4] border-b-2 border-[#59D3B4]"
                : "text-[#667085]"
            }`}
          >
            Dikirim
          </button>

          <button
            onClick={() => setActiveTab("completed")}
            className={`pb-4 font-semibold text-[16px] whitespace-nowrap ${
              activeTab === "completed"
                ? "text-[#59D3B4] border-b-2 border-[#59D3B4]"
                : "text-[#667085]"
            }`}
          >
            Selesai
          </button>

          <button
            onClick={() => setActiveTab("cancelled")}
            className={`pb-4 font-semibold text-[16px] whitespace-nowrap ${
              activeTab === "cancelled"
                ? "text-[#59D3B4] border-b-2 border-[#59D3B4]"
                : "text-[#667085]"
            }`}
          >
            Dibatalkan
          </button>

        </div>

        {/* ORDER LIST */}
        <div className="space-y-6 mt-6">
          {filteredOrders.map((order) => {
            const s = order.status as OrderStatus
            const s1 = stepClass(s, 1)
            const s2 = stepClass(s, 2)
            const s3 = stepClass(s, 3)
            const s4 = stepClass(s, 4)
            const progressLine = getProgressLine(s)

            return (
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
                    <p className="mt-1 text-[15px] text-[#64748B]">{order.date}</p>
                  </div>
                  {getStatusBadge(s)}
                </div>

                {/* PROGRESS */}
                <div className="mt-7 relative">

                  {/* BASE LINE — full grey */}
                  <div className="absolute top-[22px] left-0 w-full h-[2px] bg-[#E2E8F0]" />

                  {/* ACTIVE LINE — teal, width depends on status */}
                  {progressLine !== "w-0" && (
                    <div
                      className={`absolute top-[22px] left-0 h-[2px] bg-[#59D3B4] ${progressLine}`}
                    />
                  )}

                  <div className="relative flex items-center justify-between gap-2">

                    {/* STEP 1 — Pembayaran */}
                    <div className={`w-11 h-11 rounded-full border-2 bg-white flex items-center justify-center z-10 ${s1.border}`}>
                      <CreditCard size={18} className={s1.icon} />
                    </div>

                    {/* STEP 2 — Verifikasi */}
                    <div className={`w-11 h-11 rounded-full border-2 bg-white flex items-center justify-center z-10 ${s2.border}`}>
                      <PackageCheck size={18} className={s2.icon} />
                    </div>

                    {/* STEP 3 — Pengiriman */}
                    <div className={`w-11 h-11 rounded-full border-2 bg-white flex items-center justify-center z-10 ${s3.border}`}>
                      <Box size={18} className={s3.icon} />
                    </div>

                    {/* STEP 4 — Selesai */}
                    <div className={`w-11 h-11 rounded-full border-2 bg-white flex items-center justify-center z-10 ${s4.border}`}>
                      <BadgeCheck size={18} className={s4.icon} />
                    </div>

                  </div>
                </div>

                {/* CONTENT */}
                <div className="mt-8">

                  {/* SHIPPING DETAIL */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* ADDRESS */}
                    <div>
                      <h3 className="text-[18px] font-bold text-[#0F172A]">Pengiriman:</h3>
                      <p className="mt-2 text-[15px] text-[#1E293B] leading-relaxed">
                        {order.address}
                      </p>
                    </div>

                    {/* RIGHT COLUMN — sesuai design image 1 untuk shipping: hanya Tanggal */}
                    <div>
                      {s === "shipping" || s === "completed" ? (
                        <>
                          <h3 className="text-[18px] font-bold text-[#0F172A]">Tanggal:</h3>
                          <p className="mt-2 text-[15px] text-[#1E293B]">{order.shippingDate}</p>
                        </>
                      ) : (
                        <>
                          <h3 className="text-[18px] font-bold text-[#0F172A]">Detail Pengiriman:</h3>
                          <div className="mt-2 space-y-2 text-[15px] text-[#1E293B]">
                            <p><span className="font-semibold">Ekspedisi:</span> {order.courier}</p>
                            <p><span className="font-semibold">Nomor Resi:</span> {order.trackingNumber}</p>
                            <p><span className="font-semibold">Tanggal:</span> {order.shippingDate}</p>
                          </div>
                        </>
                      )}
                    </div>

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
                        <h3 className="text-[18px] font-bold text-[#0F172A]">{order.buyer}</h3>
                        <p className="text-[13px] text-[#94A3B8]">{order.role}</p>
                      </div>
                    </div>

                    <button className="w-full md:w-[120px] h-[44px] rounded-xl bg-[#59D3B4] hover:bg-[#4CC2A5] text-white font-semibold text-[16px] shadow-md shadow-[#59D3B433] transition-all">
                      Hubungi
                    </button>
                  </div>

                  {/* ── STATUS-SPECIFIC ACTIONS ── */}

                  {/* WAITING PURCHASE */}
                  {s === "waiting_purchase" && (
                    <div className="mt-6">
                      <Link
                        href="/preview/jastiper/upload-proof"
                        className="w-full h-[56px] rounded-xl bg-[#59D3B4] hover:bg-[#46C3A3] transition-all shadow-lg shadow-teal-100 flex items-center justify-center text-white font-semibold text-[16px]"
                      >
                        Upload Bukti Pembelian
                      </Link>
                    </div>
                  )}

                  {/* VERIFYING */}
                  {s === "verifying" && (
                    <div className="mt-6 bg-[#EEF4FF] border border-[#D7E3FF] rounded-xl p-4 flex items-start gap-3">
                      <Info size={20} className="text-[#2952CC] flex-shrink-0 mt-[2px]" />
                      <div>
                        <h3 className="text-[16px] font-bold text-[#2952CC]">
                          Pembayaran Sedang Diverifikasi
                        </h3>
                        <p className="mt-1 text-[13px] text-[#2952CC] leading-relaxed">
                          Admin sedang memeriksa bukti transfer Anda. Mohon tunggu maksimal 1×24 jam.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* SHIPPING — Laporkan Kendala */}
                  {s === "shipping" && (
                    <div className="mt-6">
                      <Link
                        href={`/preview/jastiper/komplain?orderId=${order.id}&title=${encodeURIComponent(order.title)}`}
                        className="w-full h-[56px] rounded-xl border border-[#CBD5E1] hover:bg-[#F8FAFC] transition-all flex items-center justify-center text-[#64748B] font-semibold text-[16px]"
                      >
                        Laporkan Kendala
                      </Link>
                    </div>
                  )}

                  {/* COMPLETED */}
                  {s === "completed" && (
                    <div className="mt-6 bg-[#ECFDF5] border border-[#A7F3D0] rounded-xl p-4 flex items-start gap-3">
                      <BadgeCheck size={20} className="text-[#059669] flex-shrink-0 mt-[2px]" />
                      <div>
                        <h3 className="text-[16px] font-bold text-[#059669]">Pesanan Selesai</h3>
                        <p className="mt-1 text-[13px] text-[#059669] leading-relaxed">
                          Pembeli telah mengkonfirmasi penerimaan barang. Terima kasih!
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CANCELLED */}
                  {s === "cancelled" && (
                    <div className="mt-6 bg-[#FEF2F2] border border-[#FECACA] rounded-xl p-4 flex items-start gap-3">
                      <Info size={20} className="text-[#DC2626] flex-shrink-0 mt-[2px]" />
                      <div>
                        <h3 className="text-[16px] font-bold text-[#DC2626]">Pesanan Dibatalkan</h3>
                        <p className="mt-1 text-[13px] text-[#DC2626] leading-relaxed">
                          Pesanan ini telah dibatalkan dan tidak dapat diproses lebih lanjut.
                        </p>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            )
          })}
        </div>

      </div>
    </main>
  )
}