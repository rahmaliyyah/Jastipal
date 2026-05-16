"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

type TripStatus = "aktif" | "ditutup"

interface Trip {
  id: number
  title: string
  country: string
  arrivalDate: string
  city: string
  description: string
  productCount: number
  coverImage: string
  status: TripStatus
}

export default function PerjalananSayaPage() {
  const router = useRouter()

  const [activeTab, setActiveTab] = useState<TripStatus>("aktif")

  /*
    Dummy data sementara.
    Backend nanti tinggal replace dari API/database.
  */
  const trips: Trip[] = [
    {
      id: 1,
      title: "Tokyo Disneyland Trip",
      country: "Jepang",
      arrivalDate: "1 Mei 2026",
      city: "Jakarta",
      description:
        "Berkunjung ke Disneyland dan menyediakan berbagai merchandise original Disneyland Tokyo",
      productCount: 2,
      coverImage: "/disneyland-tokyo.jpg",
      status: "aktif",
    },
    {
      id: 2,
      title: "Seoul K-Beauty Haul",
      country: "Korea Selatan",
      arrivalDate: "15 Juni 2026",
      city: "Surabaya",
      description:
        "Belanja produk skincare dan kosmetik K-Beauty terbaru langsung dari Seoul",
      productCount: 5,
      coverImage: "/seoul.jpg",
      status: "ditutup",
    },
  ]

  const filtered = trips.filter((t) => t.status === activeTab)

  const handleDelete = (id: number) => {
    // TODO: hit DELETE /api/trips/:id
    alert(`Hapus trip id ${id}`)
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-bold text-[#0F172A]">Perjalanan Saya</h1>
            <p className="mt-1 text-[15px] text-[#64748B]">Kelola perjalanan dan produk jastip Anda</p>
          </div>

          <Link href="/preview/jastiper/buat-trip">
            <button className="h-[44px] px-6 rounded-xl bg-[#59D3B4] hover:bg-[#46C3A3] text-white font-semibold text-[15px] transition-all shadow-md shadow-teal-100 whitespace-nowrap">
              Buat Perjalanan
            </button>
          </Link>
        </div>

        {/* TOGGLE TAB */}
        <div className="inline-flex bg-[#1E293B] rounded-xl p-1 mb-6">
          {(["aktif", "ditutup"] as TripStatus[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 rounded-lg text-[14px] font-semibold capitalize transition-all ${
                activeTab === tab
                  ? "bg-white text-[#0F172A]"
                  : "text-[#94A3B8] hover:text-white"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* TRIP LIST */}
        <div className="space-y-6">
          {filtered.length === 0 ? (
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-12 flex flex-col items-center gap-3">
              <p className="text-[16px] text-[#94A3B8]">Belum ada perjalanan {activeTab}.</p>
              {activeTab === "aktif" && (
                <Link href="/preview/jastiper/buat-trip">
                  <button className="mt-2 h-[44px] px-6 rounded-xl bg-[#59D3B4] hover:bg-[#46C3A3] text-white font-semibold text-[15px] transition-all">
                    Buat Perjalanan
                  </button>
                </Link>
              )}
            </div>
          ) : (
            filtered.map((trip) => (
              <div
                key={trip.id}
                className="bg-white border border-[#CBD5E1] rounded-2xl overflow-hidden"
              >
                {/* COVER IMAGE */}
                <div className="h-[240px] w-full bg-[#CBD5E1] overflow-hidden">
                  <img
                    src={trip.coverImage}
                    alt={trip.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback gradient jika image tidak ada
                      const target = e.currentTarget
                      target.style.display = "none"
                      target.parentElement!.style.background =
                        "linear-gradient(135deg, #59D3B4 0%, #2563EB 100%)"
                    }}
                  />
                </div>

                {/* CONTENT */}
                <div className="p-6">
                  <h2 className="text-[22px] font-bold text-[#0F172A] mb-4">{trip.title}</h2>

                  {/* INFO GRID */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-[#F8FAFC] rounded-xl p-3">
                      <p className="text-[12px] text-[#94A3B8] mb-1">Negara</p>
                      <p className="text-[15px] font-semibold text-[#0F172A]">{trip.country}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-3">
                      <p className="text-[12px] text-[#94A3B8] mb-1">Tanggal Tiba</p>
                      <p className="text-[15px] font-semibold text-[#0F172A]">{trip.arrivalDate}</p>
                    </div>
                    <div className="bg-[#F8FAFC] rounded-xl p-3">
                      <p className="text-[12px] text-[#94A3B8] mb-1">Produk</p>
                      <p className="text-[15px] font-semibold text-[#0F172A]">{trip.productCount} item</p>
                    </div>
                  </div>

                  {/* DESCRIPTION */}
                  <div className="bg-[#F8FAFC] rounded-xl p-3 mb-5">
                    <p className="text-[12px] text-[#94A3B8] mb-1">Deskripsi</p>
                    <p className="text-[14px] text-[#1E293B]">{trip.description}</p>
                  </div>

                  {/* ACTIONS */}
                  <div className="grid grid-cols-3 gap-3">
                    <Link href={`/preview/jastiper/detail-trip?id=${trip.id}`} className="col-span-1">
                      <button className="w-full h-[48px] rounded-xl bg-[#59D3B4] hover:bg-[#46C3A3] text-white font-semibold text-[15px] transition-all">
                        Lihat Detail
                      </button>
                    </Link>

                    <Link href={`/preview/jastiper/tambah-produk?tripId=${trip.id}&tripTitle=${encodeURIComponent(trip.title)}`}>
                      <button className="w-full h-[48px] rounded-xl border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#0F172A] font-semibold text-[15px] transition-all">
                        Tambah Produk
                      </button>
                    </Link>

                    <button
                      onClick={() => handleDelete(trip.id)}
                      className="w-full h-[48px] rounded-xl border border-[#CBD5E1] hover:bg-[#FEF2F2] hover:border-[#FECACA] text-[#64748B] hover:text-[#DC2626] font-semibold text-[15px] transition-all"
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  )
}