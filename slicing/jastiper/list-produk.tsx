"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, Trash2 } from "lucide-react"

interface Product {
  id: number
  name: string
  totalPrice: number
  image: string
}

export default function ListProdukPage() {
  const router       = useRouter()
  const searchParams = useSearchParams()
  const tripTitle    = searchParams.get("tripTitle") ?? "Trip"

  /*
    Dummy data sementara.
    Backend nanti tinggal replace dari API/database.
  */
  const [products, setProducts] = useState<Product[]>([
    {
      id: 1,
      name: "Socksense Cartoon Character Series Women's Original Crew Socks",
      totalPrice: 250000,
      image: "/socks.jpg",
    },
    {
      id: 2,
      name: '"it\'s a small world" Loungefly Crossbody Bag – 60th Anniversary',
      totalPrice: 1550000,
      image: "/bag.jpg",
    },
  ])

  const handleDelete = (id: number) => {
    if (!confirm("Hapus produk ini?")) return
    setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-[#64748B] text-[15px] hover:text-[#0F172A] transition-colors mb-4"
        >
          <ChevronLeft size={18} />
          Kembali
        </button>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-[28px] font-bold text-[#0F172A]">Produk</h1>
            <p className="mt-1 text-[14px] text-[#94A3B8]">{tripTitle}</p>
          </div>

          <Link
            href={`/preview/jastiper/tambah-produk?tripTitle=${encodeURIComponent(tripTitle)}`}
          >
            <button className="h-[44px] px-6 rounded-xl bg-[#59D3B4] hover:bg-[#46C3A3] text-white font-semibold text-[15px] transition-all shadow-md shadow-teal-100 whitespace-nowrap">
              Tambah Produk
            </button>
          </Link>
        </div>

        {/* PRODUCT LIST */}
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="bg-white border border-[#CBD5E1] rounded-2xl p-12 flex flex-col items-center gap-3">
              <p className="text-[16px] text-[#94A3B8]">Belum ada produk ditambahkan.</p>
              <Link
                href={`/preview/jastiper/tambah-produk?tripTitle=${encodeURIComponent(tripTitle)}`}
              >
                <button className="mt-2 h-[44px] px-6 rounded-xl bg-[#59D3B4] hover:bg-[#46C3A3] text-white font-semibold text-[15px] transition-all">
                  Tambah Produk Pertama
                </button>
              </Link>
            </div>
          ) : (
            products.map((product) => (
              <div
                key={product.id}
                className="bg-white border border-[#CBD5E1] rounded-2xl p-4 flex items-center gap-4"
              >
                {/* IMAGE */}
                <div className="w-16 h-16 rounded-xl bg-[#F1F5F9] flex-shrink-0 overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none"
                    }}
                  />
                </div>

                {/* INFO */}
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[#0F172A] leading-snug line-clamp-2">
                    {product.name}
                  </p>
                  <p className="mt-1 text-[14px] text-[#64748B]">
                    Rp {product.totalPrice.toLocaleString("id-ID")}
                  </p>
                </div>

                {/* ACTIONS */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="w-10 h-10 rounded-xl border border-[#E2E8F0] flex items-center justify-center text-[#DC2626] hover:bg-[#FEF2F2] hover:border-[#FECACA] transition-all"
                  >
                    <Trash2 size={16} />
                  </button>

                  <Link
                    href={`/preview/jastiper/tambah-produk?tripTitle=${encodeURIComponent(tripTitle)}&productId=${product.id}`}
                  >
                    <button className="h-[40px] px-5 rounded-xl bg-[#59D3B4] hover:bg-[#46C3A3] text-white font-semibold text-[14px] transition-all">
                      Edit
                    </button>
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* SELESAI — tombol untuk kembali ke Perjalanan Saya */}
        {products.length > 0 && (
          <div className="mt-8 flex justify-end">
            <Link href="/preview/jastiper/perjalanan-saya">
              <button className="h-[52px] px-8 rounded-xl bg-[#59D3B4] hover:bg-[#46C3A3] text-white font-semibold text-[16px] transition-all shadow-lg shadow-teal-100">
                Selesai
              </button>
            </Link>
          </div>
        )}

      </div>
    </main>
  )
}