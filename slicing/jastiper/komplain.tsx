"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ChevronLeft } from "lucide-react"

const ALASAN = [
  "Pembeli belum mengonfirmasi penerimaan meskipun barang telah dikirim",
  "Pembeli tidak dapat dihubungi",
  "Lainnya",
]

export default function KomplainPage() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  const title   = searchParams.get("title") ?? "Pesanan"
  const [selected, setSelected] = useState<string | null>(null)
  const [deskripsi, setDeskripsi] = useState("")

  const handleSubmit = () => {
    if (!selected) return
    // TODO: kirim ke API
    alert("Komplain berhasil dikirim!")
    router.back()
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[640px] mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* BACK */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-[#64748B] text-[15px] hover:text-[#0F172A] transition-colors mb-6"
        >
          <ChevronLeft size={18} />
          Kembali
        </button>

        {/* HEADER */}
        <h1 className="text-[28px] font-bold text-[#0F172A]">Ajukan Komplain</h1>
        <p className="mt-1 text-[14px] text-[#94A3B8]">{title}</p>

        {/* FORM CARD */}
        <div className="mt-6 bg-white border border-[#CBD5E1] rounded-xl p-6">
          <h2 className="text-[18px] font-bold text-[#0F172A] mb-5">Detail Komplain</h2>

          {/* PILIH ALASAN */}
          <p className="text-[14px] font-medium text-[#1E293B] mb-3">Pilih Alasan</p>
          <div className="space-y-3">
            {ALASAN.map((alasan) => (
              <button
                key={alasan}
                onClick={() => setSelected(alasan)}
                className={`w-full text-left px-4 py-3 rounded-xl border text-[14px] transition-all ${
                  selected === alasan
                    ? "border-[#59D3B4] bg-[#F0FDF9] text-[#0F172A] font-medium"
                    : "border-[#E2E8F0] text-[#1E293B] hover:border-[#59D3B4]"
                }`}
              >
                {alasan}
              </button>
            ))}
          </div>

          {/* DESKRIPSI */}
          <p className="text-[14px] font-medium text-[#1E293B] mt-6 mb-3">
            Jelaskan kendala yang dialami
          </p>
          <textarea
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Tuliskan detail kendala atau kronologi yang terjadi..."
            rows={5}
            className="w-full px-4 py-3 rounded-xl border border-[#E2E8F0] text-[14px] text-[#1E293B] placeholder-[#94A3B8] resize-none focus:outline-none focus:border-[#59D3B4] transition-colors"
          />
        </div>

        {/* SUBMIT */}
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSubmit}
            disabled={!selected}
            className="w-full sm:w-auto px-8 h-[52px] rounded-xl bg-[#59D3B4] hover:bg-[#46C3A3] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[16px] transition-all shadow-lg shadow-teal-100"
          >
            Kirim Komplain
          </button>
        </div>

      </div>
    </main>
  )
}