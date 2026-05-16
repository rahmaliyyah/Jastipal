"use client"

import { useState, useRef, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ImagePlus, Calendar } from "lucide-react"

export default function BuatTripPage() {
  const router = useRouter()

  const [previewUrl, setPreviewUrl]     = useState<string | null>(null)
  const [judul, setJudul]               = useState("")
  const [negara, setNegara]             = useState("")
  const [tanggalTiba, setTanggalTiba]   = useState("")
  const [deskripsi, setDeskripsi]       = useState("")
  const [kota, setKota]                 = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
  }

  const handleSubmit = () => {
    if (!judul || !negara || !tanggalTiba || !kota) {
      alert("Mohon lengkapi semua field wajib.")
      return
    }
    // Lanjut ke halaman Tambah Produk, kirim tripTitle via query
    router.push(
      `/preview/jastiper/tambah-produk?tripTitle=${encodeURIComponent(judul)}&isNew=true`
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
        <h1 className="text-[28px] font-bold text-[#0F172A]">Buat Perjalanan</h1>
        <p className="mt-1 text-[14px] text-[#94A3B8] mb-6">Informasi perjalanan Anda</p>

        {/* FORM CARD */}
        <div className="bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8">
          <h2 className="text-[20px] font-bold text-[#0F172A] mb-6">Detail Perjalanan</h2>

          {/* FOTO */}
          <div className="mb-6">
            <p className="text-[14px] font-medium text-[#1E293B] mb-2">
              Foto Perjalanan <span className="italic font-normal text-[#94A3B8]">(opsional)</span>
            </p>

            {previewUrl ? (
              <div className="relative rounded-xl overflow-hidden">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-[280px] object-cover"
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

          {/* JUDUL */}
          <div className="mb-5">
            <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
              Judul Perjalanan
            </label>
            <input
              type="text"
              value={judul}
              onChange={(e) => setJudul(e.target.value)}
              placeholder="Masukkan judul perjalanan Anda"
              className="w-full h-[48px] px-4 rounded-xl border border-[#E2E8F0] text-[14px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#59D3B4] transition-colors"
            />
          </div>

          {/* NEGARA + TANGGAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
                Negara Tujuan
              </label>
              <input
                type="text"
                value={negara}
                onChange={(e) => setNegara(e.target.value)}
                placeholder="Masukan negara perjalanan Anda"
                className="w-full h-[48px] px-4 rounded-xl border border-[#E2E8F0] text-[14px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#59D3B4] transition-colors"
              />
            </div>

            <div>
              <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
                Tanggal tiba di Indonesia
              </label>
              <div className="relative">
                <Calendar size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  type="date"
                  value={tanggalTiba}
                  onChange={(e) => setTanggalTiba(e.target.value)}
                  placeholder="Pilih tanggal perkiraan tiba"
                  className="w-full h-[48px] pl-10 pr-4 rounded-xl border border-[#E2E8F0] text-[14px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#59D3B4] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* DESKRIPSI */}
          <div className="mb-5">
            <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
              Deskripsi <span className="italic font-normal text-[#94A3B8]">(Opsional)</span>
            </label>
            <textarea
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              placeholder="Jelaskan detail perjalanan Anda, termasuk barang yang dapat dititipkan, area yang dikunjungi, dan informasi lainnya."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-[14px] text-[#0F172A] placeholder-[#94A3B8] resize-none focus:outline-none focus:border-[#59D3B4] transition-colors"
            />
          </div>

          {/* KOTA */}
          <div>
            <label className="block text-[14px] font-medium text-[#1E293B] mb-2">
              Kota Kedatangan di Indonesia
            </label>
            <input
              type="text"
              value={kota}
              onChange={(e) => setKota(e.target.value)}
              placeholder="Masukkan kota kedatangan Anda"
              className="w-full h-[48px] px-4 rounded-xl border border-[#E2E8F0] text-[14px] text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#59D3B4] transition-colors"
            />
          </div>
        </div>

        {/* SUBMIT */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            className="h-[52px] px-8 rounded-xl bg-[#59D3B4] hover:bg-[#46C3A3] text-white font-semibold text-[16px] transition-all shadow-lg shadow-teal-100"
          >
            Lanjut Tambah Produk
          </button>
        </div>

      </div>
    </main>
  )
}