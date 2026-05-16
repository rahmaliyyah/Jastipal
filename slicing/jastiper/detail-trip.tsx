"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default function DetailTripPage() {
  const router = useRouter()

  /*
    Dummy data sementara.
    Backend nanti tinggal replace dari API/database.
  */
  const trip = {
    id: 1,
    title: "Tokyo Disneyland Trip",
    country: "Jepang",
    arrivalDate: "1 Mei 2026",
    city: "Jakarta",
    description:
      "Berkunjung ke Disneyland dan menyediakan berbagai merchandise original Disneyland Tokyo",
    coverImage: "/disneyland-tokyo.jpg",
  }

  const products = [
    {
      id: 1,
      name: "Socksense Cartoon Character Series Women's Original Crew Socks",
      description: [
        "Free size(One Size) 23~26cm / EUR 38~42 / UK 5~8/ US 7~36",
        "Made of Korean Fine Cotton Material, Stylish design, Stylish, Fashion Socks",
        "100% Brand New and High Quality, Made in South Korea, Machine washable",
        "Materials : 75% cotton, 17% nylon, 6% polyester, 2% spandex",
      ],
      hargaProduk: 190000,
      serviceFee: 40000,
      ongkir: 20000,
      stock: 1,
      image: "/socks.jpg",
    },
  ]

  const handleDeleteProduct = (id: number) => {
    if (!confirm("Hapus produk ini?")) return
    // TODO: hit DELETE /api/products/:id
    alert(`Hapus produk id ${id}`)
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

        {/* TRIP CARD */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl overflow-hidden mb-8">

          {/* COVER */}
          <div className="h-[280px] w-full bg-[#CBD5E1] overflow-hidden">
            <img
              src={trip.coverImage}
              alt={trip.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none"
                e.currentTarget.parentElement!.style.background =
                  "linear-gradient(135deg, #59D3B4 0%, #2563EB 100%)"
              }}
            />
          </div>

          {/* INFO */}
          <div className="p-6">
            <h1 className="text-[24px] font-bold text-[#0F172A] mb-4">{trip.title}</h1>

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
                <p className="text-[15px] font-semibold text-[#0F172A]">{products.length} item</p>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="bg-[#F8FAFC] rounded-xl p-3">
              <p className="text-[12px] text-[#94A3B8] mb-1">Deskripsi</p>
              <p className="text-[14px] text-[#1E293B]">{trip.description}</p>
            </div>
          </div>
        </div>

        {/* KATALOG PRODUK */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[20px] font-bold text-[#0F172A]">Katalog Produk</h2>
          <Link
            href={`/preview/jastiper/tambah-produk?tripTitle=${encodeURIComponent(trip.title)}`}
            className="text-[14px] font-semibold text-[#59D3B4] hover:text-[#46C3A3] transition-colors"
          >
            + Tambah Produk
          </Link>
        </div>

        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white border border-[#CBD5E1] rounded-2xl overflow-hidden"
            >
              <div className="p-5">
                {/* PRODUCT TOP */}
                <div className="flex gap-4">
                  {/* IMAGE */}
                  <div className="w-[100px] h-[100px] rounded-xl bg-[#F1F5F9] flex-shrink-0 overflow-hidden">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.style.display = "none" }}
                    />
                  </div>

                  {/* INFO */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[15px] font-bold text-[#0F172A] leading-snug">
                        {product.name}
                      </h3>
                      <span className="flex-shrink-0 bg-[#ECFDF5] text-[#059669] text-[12px] font-semibold px-3 py-1 rounded-full">
                        Stock {product.stock}
                      </span>
                    </div>

                    {/* DESCRIPTION LIST */}
                    <ul className="mt-2 space-y-1">
                      {product.description.map((d, i) => (
                        <li key={i} className="text-[13px] text-[#64748B] flex gap-2">
                          <span className="mt-[6px] w-1.5 h-1.5 rounded-full bg-[#94A3B8] flex-shrink-0" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* PRICE GRID */}
                <div className="grid grid-cols-3 gap-3 mt-4">
                  <div className="bg-[#F8FAFC] rounded-xl p-3">
                    <p className="text-[12px] text-[#94A3B8] mb-1">Harga Produk</p>
                    <p className="text-[14px] font-semibold text-[#0F172A]">
                      Rp {product.hargaProduk.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-3">
                    <p className="text-[12px] text-[#94A3B8] mb-1">Service Fee</p>
                    <p className="text-[14px] font-semibold text-[#0F172A]">
                      Rp {product.serviceFee.toLocaleString("id-ID")}
                    </p>
                  </div>
                  <div className="bg-[#F8FAFC] rounded-xl p-3">
                    <p className="text-[12px] text-[#94A3B8] mb-1">Ongkos Kirim</p>
                    <p className="text-[14px] font-semibold text-[#0F172A]">
                      Rp {product.ongkir.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>

                {/* PRODUCT ACTIONS */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <Link
                    href={`/preview/jastiper/tambah-produk?tripTitle=${encodeURIComponent(trip.title)}&productId=${product.id}`}
                  >
                    <button className="w-full h-[48px] rounded-xl bg-[#59D3B4] hover:bg-[#46C3A3] text-white font-semibold text-[15px] transition-all">
                      Edit
                    </button>
                  </Link>

                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="w-full h-[48px] rounded-xl border border-[#CBD5E1] hover:bg-[#FEF2F2] hover:border-[#FECACA] text-[#64748B] hover:text-[#DC2626] font-semibold text-[15px] transition-all"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  )
}