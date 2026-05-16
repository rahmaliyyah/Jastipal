"use client"

import Link from "next/link"
import { ImagePlus, ArrowLeft } from "lucide-react"

export default function UploadProofPage() {
  return (
    <main className="min-h-screen bg-[#F8FAFC]">

      <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-8">

        {/* BACK */}
        <Link
          href="/preview/jastiper/orders"
          className="inline-flex items-center gap-2 text-[#64748B] hover:text-[#0F172A] transition-all"
        >
          <ArrowLeft size={18} />
          <span className="text-[16px] font-medium">
            Kembali
          </span>
        </Link>

        {/* HEADER */}
        <div className="mt-4">

          <h1 className="text-[36px] font-bold text-[#1E293B]">
            Bukti Pembelian
          </h1>

          <p className="mt-2 text-[18px] text-[#64748B]">
            IVE Album REVIVE+ Vinyl LP (Limited Edition)
          </p>

        </div>

        {/* ========================== */}
        {/* UPLOAD SECTION */}
        {/* ========================== */}
        <div className="mt-8 bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8">

          <h2 className="text-[20px] font-bold text-[#0F172A]">
            Upload Bukti Pembelian
          </h2>

          {/* FOTO STRUK */}
          <div className="mt-8">

            <label className="block text-[18px] font-semibold text-[#0F172A] mb-3">
              Foto Struk / Invoice
            </label>

            <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl h-[150px] flex flex-col items-center justify-center text-center px-4 cursor-pointer hover:border-[#59D3B4] transition-all">

              <ImagePlus
                size={40}
                className="text-[#9CA3AF]"
              />

              <p className="mt-3 text-[18px] text-[#0F172A]">
                <span className="text-[#59D3B4] font-semibold">
                  Upload a file
                </span>{" "}
                or drag and drop
              </p>

              <p className="mt-1 text-[15px] text-[#64748B]">
                PNG, JPG, GIF up to 10MB
              </p>

            </div>

          </div>

          {/* DESKRIPSI */}
          <div className="mt-8">

            <label className="block text-[18px] font-semibold text-[#0F172A] mb-3">
              Deskripsi <span className="italic">(Optional)</span>
            </label>

            <textarea
              placeholder="Jelaskan detail perjalanan Anda, termasuk barang yang dapat dititipkan, area yang dikunjungi, dan informasi lainnya."
              className="w-full h-[120px] rounded-xl border border-[#CBD5E1] px-4 py-4 text-[16px] outline-none focus:border-[#59D3B4] resize-none"
            />

          </div>

          {/* BOARDING PASS */}
          <div className="mt-8">

            <label className="block text-[18px] font-semibold text-[#0F172A] mb-3">
              Boarding Pass <span className="italic">(Optional)</span>
            </label>

            <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl h-[150px] flex flex-col items-center justify-center text-center px-4 cursor-pointer hover:border-[#59D3B4] transition-all">

              <ImagePlus
                size={40}
                className="text-[#9CA3AF]"
              />

              <p className="mt-3 text-[18px] text-[#0F172A]">
                <span className="text-[#59D3B4] font-semibold">
                  Upload a file
                </span>{" "}
                or drag and drop
              </p>

              <p className="mt-1 text-[15px] text-[#64748B]">
                PNG, JPG, GIF up to 10MB
              </p>

            </div>

          </div>

        </div>

        {/* ========================== */}
        {/* NOMOR RESI */}
        {/* ========================== */}
        <div className="mt-6 bg-white border border-[#CBD5E1] rounded-2xl p-6 sm:p-8">

          <h2 className="text-[20px] font-bold text-[#0F172A]">
            Nomor Resi
          </h2>

          {/* EKSPEDISI */}
          <div className="mt-8">

            <label className="block text-[18px] font-semibold text-[#0F172A] mb-3">
              Ekspedisi Pengiriman
            </label>

            <input
              type="text"
              placeholder="Masukkan ekspedisi pengiriman"
              className="w-full h-[54px] rounded-xl border border-[#CBD5E1] px-4 text-[16px] outline-none focus:border-[#59D3B4]"
            />

          </div>

          {/* RESI */}
          <div className="mt-6">

            <label className="block text-[18px] font-semibold text-[#0F172A] mb-3">
              Nomor Resi
            </label>

            <input
              type="text"
              placeholder="Masukkan nomor resi pengiriman"
              className="w-full h-[54px] rounded-xl border border-[#CBD5E1] px-4 text-[16px] outline-none focus:border-[#59D3B4]"
            />

          </div>

        </div>

        {/* BUTTON */}
        <button className="mt-8 w-full h-[58px] rounded-xl bg-[#59D3B4] hover:bg-[#4CC2A5] text-white font-bold text-[20px] shadow-lg shadow-[#59D3B433] transition-all">
          Kirim Bukti Pembelian & Pengiriman
        </button>

        {/* FOOTNOTE */}
        <p className="mt-6 text-center text-[16px] text-[#64748B] leading-relaxed">
          Dana akan cair otomatis setelah buyer
          mengonfirmasi penerimaan barang.
        </p>

      </div>
    </main>
  )
}