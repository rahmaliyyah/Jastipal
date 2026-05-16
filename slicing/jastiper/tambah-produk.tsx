"use client"

import { useState, useRef, ChangeEvent } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ChevronLeft, ImagePlus } from "lucide-react"

const formatRupiah = (val: string) => {
  const num = val.replace(/\D/g, "")
  return num ? parseInt(num).toLocaleString("id-ID") : ""
}

const parseNumber = (val: string) => {
  const num = parseInt(val.replace(/\D/g, "") || "0")
  return isNaN(num) ? 0 : num
}

export default function TambahProdukPage() {
  const router      = useRouter()
  const searchParams = useSearchParams()
  const tripTitle   = searchParams.get("tripTitle") ?? "Trip"
  const isNew       = searchParams.get("isNew") === "true"

  const [previewUrl, setPreviewUrl]     = useState<string | null>(null)
  const [namaProduk, setNamaProduk]     = useState("")
  const [deskripsi, setDeskripsi]       = useState("")
  const [harga, setHarga]               = useState("")
  const [jumlah, setJumlah]             = useState(1)
  const [serviceFee, setServiceFee]     = useState("")
  const [ongkir, setOngkir]             = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    setPreviewUrl(URL.createObjectURL(file))
  }

  // Total listing = harga + service fee + ongkir
  const totalListing =
    parseNumber(harga) + parseNumber(serviceFee) + parseNumber(ongkir)

  const showTotal = harga || serviceFee || ongkir

  const handleSubmit = () => {
    if (!namaProduk || !harga) {
      alert("Nama produk dan harga wajib diisi.")
      return
    }
    // TODO: POST ke API
    // Setelah berhasil, arahkan ke halaman list produk trip
    router.push(
      `/preview/jastiper/list-produk?tripTitle=${encodeURIComponent(tripTitle)}`
    )
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
        <h1 className="text-[28px] font-bold text-[#0F172A]">Tambah Produk</h1>
        <p className="mt-1 text-[14px] text-[#94A3B8] mb-6">{tripTitle}</p>

        {/* FORM CARD */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8">
          <h2 className="text-[20px] font-bold text-[#0F172A] mb-6">Detail Produk</h2>

          {/* FOTO */}
          <div className="mb-6">
            <p className="text-[14px] font-medium text-[#1E293B] mb-2">
              Foto Produk <span className="italic font-normal text-[#94A3B8]">(opsional)</span>
            </p>

            {previewUrl ? (
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full max-h-[300px] object-cover"
                />
                <button
                  onClick={() => setPreviewUrl(null)}
                  className="absolute top-3 right-3 bg-white/80 hover:bg-white text-[#DC2626] text-[13px] font-semibold px-3 py-1 rounded-lg transition-all"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                className="w-full h-[160px] border-2 border-dashed border-[#CBD5E1] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#59D3B4] transition-colors"
              >
                <ImagePlus size={28} className="text-[#94A3B8]" />
                <p className="text-[14px]">
                  <span className="text-[#59D3B4] font-medium">Upload a file</span>
                  <span className="text-[#64748B]"> or drag and drop</span>
                </p>
                <p className="text-[12px] text-[#94A3B8]">PNG, JPG, GIF up to 10MB</p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          {/* NAMA PRODUK */}
          <div className="mb-5">
            <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
              Nama Produk
            </label>
            <input
              type="text"
              value={namaProduk}
              onChange={(e) => setNamaProduk(e.target.value)}
              placeholder="Masukkan nama produk"
              className="w-full h-[48px] px-4 rounded-xl border border-[#E2E8F0] text-[14px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#59D3B4] transition-colors"
            />
          </div>

          {/* DESKRIPSI */}
          <div className="mb-5">
            <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
              Deskripsi <span className="italic font-normal text-[#94A3B8]">(Opsional)</span>
            </label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan detail produk, termasuk ukuran, warna, varian, atau catatan khusus."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-[14px] text-[#0F172A] placeholder-[#94A3B8] resize-none focus:outline-none focus:border-[#59D3B4] transition-colors"
            />
          </div>

          {/* HARGA + JUMLAH */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
                Harga Produk
              </label>
              <div className="flex items-center h-[48px] border border-[#E2E8F0] rounded-xl px-4 gap-2 focus-within:border-[#59D3B4] transition-colors">
                <span className="text-[14px] text-[#94A3B8] font-medium">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={harga}
                  onChange={(e) => setHarga(formatRupiah(e.target.value))}
                  placeholder="Masukkan harga produk"
                  className="flex-1 text-[14px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
                Jumlah
              </label>
              <div className="flex items-center h-[48px] border border-[#E2E8F0] rounded-xl overflow-hidden">
                <button
                  onClick={() => setJumlah((j) => Math.max(1, j - 1))}
                  className="w-12 h-full flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] text-[20px] font-bold transition-colors border-r border-[#E2E8F0]"
                >
                  −
                </button>
                <span className="flex-1 text-center text-[15px] font-semibold text-[#0F172A]">
                  {jumlah}
                </span>
                <button
                  onClick={() => setJumlah((j) => j + 1)}
                  className="w-12 h-full flex items-center justify-center text-[#64748B] hover:bg-[#F8FAFC] text-[20px] font-bold transition-colors border-l border-[#E2E8F0]"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* SERVICE FEE + ONGKIR */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
                Service Fee
              </label>
              <div className="flex items-center h-[48px] border border-[#E2E8F0] rounded-xl px-4 gap-2 focus-within:border-[#59D3B4] transition-colors">
                <span className="text-[14px] text-[#94A3B8] font-medium">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={serviceFee}
                  onChange={(e) => setServiceFee(formatRupiah(e.target.value))}
                  placeholder="Masukkan service fee"
                  className="flex-1 text-[14px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none bg-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
                Ongkos Kirim
              </label>
              <div className="flex items-center h-[48px] border border-[#E2E8F0] rounded-xl px-4 gap-2 focus-within:border-[#59D3B4] transition-colors">
                <span className="text-[14px] text-[#94A3B8] font-medium">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={ongkir}
                  onChange={(e) => setOngkir(formatRupiah(e.target.value))}
                  placeholder="Masukkan ongkos kirim"
                  className="flex-1 text-[14px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none bg-transparent"
                />
              </div>
            </div>
          </div>

          {/* TOTAL LISTING — muncul kalau ada nilai */}
          {showTotal && (
            <div className="bg-[#F0FDF9] border border-[#A7F3D0] rounded-xl p-4">
              <p className="text-[13px] text-[#059669] font-medium mb-1">Total Listing</p>
              <p className="text-[18px] font-bold text-[#0F172A]">
                Rp {totalListing.toLocaleString("id-ID")}
              </p>
            </div>
          )}
        </div>

        {/* SUBMIT */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="h-[52px] px-8 rounded-xl bg-[#59D3B4] hover:bg-[#46C3A3] text-white font-semibold text-[16px] transition-all shadow-lg shadow-teal-100"
          >
            Tambah Produk
          </button>
        </div>

      </div>
    </main>
  )
}