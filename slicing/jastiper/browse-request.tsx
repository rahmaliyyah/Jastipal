"use client"

import { useMemo, useState } from "react"
import { Info, Search, X } from "lucide-react"

export default function BrowseRequestPage() {

  /*
    Dummy data sementara.
    Backend nanti tinggal replace dari API/database.
  */
  const requests = [
    {
      id: 1,
      title: "IVE Album REVIVE+ Vinyl LP (Limited Edition)",
      link: "https://www.ktown4u.com/iteminfo?goods_no=161392",
      deadline: "27 April 2026",
      deliveryMethod: "Kirim Paket",
      budget: 900000,
      quantity: "1 Pcs",
      note: "Pastikan barang yang dibeli original",
    },

    {
      id: 2,
      title: "Nintendo Switch OLED White Edition",
      link: "https://www.nintendo.com/switch",
      deadline: "10 Mei 2026",
      deliveryMethod: "Kirim Paket",
      budget: 5500000,
      quantity: "1 Unit",
      note: "Box harus mulus dan segel aman",
    },
  ]

  const [searchQuery, setSearchQuery] = useState("")

  const filteredRequests = requests.filter((request) =>
    request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.note.toLowerCase().includes(searchQuery.toLowerCase()) ||
    request.link.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [dealPrice, setDealPrice] = useState("")

  const [showSuccessPopup, setShowSuccessPopup] = useState(false)
  const [showValidationPopup, setShowValidationPopup] = useState(false)


  /*
    Parsing harga.
    Aman untuk backend integration nanti.
  */
  const numericDealPrice = Number(
    dealPrice.replace(/\./g, "").replace(/,/g, "")
  ) || 0

  /*
    Platform fee 5%
  */
  const platformFee = useMemo(() => {
    return Math.round(numericDealPrice * 0.05)
  }, [numericDealPrice])

  /*
    Total tagihan buyer
  */
  const totalInvoice = useMemo(() => {
    return numericDealPrice + platformFee
  }, [numericDealPrice, platformFee])

  /*
    Formatter IDR
  */
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID").format(value)
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-6 py-8">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-[36px] font-bold text-[#1E293B]">
            Cari Permintaan
          </h1>

          <p className="mt-2 text-[18px] text-[#64748B]">
            Temukan permintaan titip yang bisa kamu ambil
          </p>
        </div>

        {/* SEARCH */}
        <div className="relative mb-6">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            size={22}
          />

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari produk, link, atau catatan permintaan"
            className="w-full h-[56px] rounded-xl border border-[#CBD5E1] bg-white pl-14 pr-4 text-[16px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#59D3B4]"
          />
        </div>

        {/* REQUEST LIST */}
        <div className="space-y-6">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bg-white border border-[#CBD5E1] rounded-2xl p-5"
            >

              {/* TITLE */}
              <h2 className="text-[18px] md:text-[20px] font-bold text-[#0F172A]">
                {request.title}
              </h2>

              {/* LINK */}
              <a
                href={request.link}
                target="_blank"
                className="mt-2 inline-block text-[#64748B] text-[15px] break-all hover:underline"
              >
                {request.link}
              </a>

              {/* GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

                <div className="bg-[#F8FAFC] rounded-xl p-4">
                  <p className="text-[14px] text-[#94A3B8] font-medium">
                    Batas Waktu
                  </p>

                  <h3 className="mt-1 text-[18px] font-bold text-[#1E293B]">
                    {request.deadline}
                  </h3>
                </div>

                <div className="bg-[#F8FAFC] rounded-xl p-4">
                  <p className="text-[14px] text-[#94A3B8] font-medium">
                    Metode Pengiriman
                  </p>

                  <h3 className="mt-1 text-[18px] font-bold text-[#1E293B]">
                    {request.deliveryMethod}
                  </h3>
                </div>

                <div className="bg-[#F8FAFC] rounded-xl p-4">
                  <p className="text-[14px] text-[#94A3B8] font-medium">
                    Maksimal Budget (IDR)
                  </p>

                  <h3 className="mt-1 text-[18px] font-bold text-[#1E293B]">
                    Rp {formatRupiah(request.budget)}
                  </h3>
                </div>

                <div className="bg-[#F8FAFC] rounded-xl p-4">
                  <p className="text-[14px] text-[#94A3B8] font-medium">
                    Jumlah
                  </p>

                  <h3 className="mt-1 text-[18px] font-bold text-[#1E293B]">
                    {request.quantity}
                  </h3>
                </div>

              </div>

              {/* NOTE + BUTTON */}
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mt-6">

                <div>
                  <h3 className="text-[18px] font-bold text-[#0F172A]">
                    Catatan:
                  </h3>

                  <p className="mt-2 text-[16px] text-[#64748B] leading-relaxed">
                    {request.note}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedRequest(request)
                    setDealPrice("")
                  }}
                  className="w-full md:w-auto bg-[#34D399] hover:bg-[#26B89A] transition-all text-white font-semibold text-[18px] px-8 py-4 rounded-xl shadow-lg shadow-teal-200"
                >
                  Ambil Permintaan
                </button>

              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {selectedRequest && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">

            <div className="w-full max-w-[600px] bg-white rounded-3xl p-5 md:p-6">

              {/* HEADER */}
              <div className="flex items-center justify-between">
                <h2 className="text-[18px] font-bold text-[#0F172A]">
                  Ambil Permintaan
                </h2>

                <button
                  onClick={() => setSelectedRequest(null)}
                >
                  <X className="text-[#59D3B4]" size={30} />
                </button>
              </div>

              {/* FORM */}
              <div className="mt-1 space-y-1">

                {/* NAMA BARANG */}
                <div className="border border-[#E2E8F0] rounded-2xl px-3 py-2 bg-[#F8FAFC]">
                  <p className="text-[14px] text-[#94A3B8] font-medium">
                    Nama Barang
                  </p>

                  <h3 className="mt-1 text-[16px] font-bold text-[#1E293B]">
                    {selectedRequest.title}
                  </h3>
                </div>

                {/* BUDGET */}
                <div className="border border-[#E2E8F0] rounded-2xl p-3 bg-[#F8FAFC]">
                  <p className="text-[14px] text-[#94A3B8] font-medium">
                    Batas Budget
                  </p>

                  <h3 className="mt-1 text-[16px] font-bold text-[#1E293B]">
                    Rp {formatRupiah(selectedRequest.budget)}
                  </h3>
                </div>

                {/* DEAL PRICE */}
                <div>
                  <label className="text-[14px] font-medium text-[#1E293B]">
                    Masukkan harga deal (IDR)
                  </label>

                  <div className="mt-2 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-[16px]">
                      Rp
                    </span>

                    <input
                      type="text"
                      value={dealPrice}
                      onChange={(e) => {
                        const rawValue = e.target.value.replace(/\D/g, "")

                        setDealPrice(
                          rawValue
                            ? Number(rawValue).toLocaleString("id-ID")
                            : ""
                        )
                      }}
                      placeholder="Masukkan harga deal"
                      className="w-full h-[42px] rounded-2xl border border-[#CBD5E1] bg-white pl-14 pr-4 text-[18px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none focus:border-[#59D3B4]"
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-2 text-[#64748B]">
                    <Info size={16} />

                    <p className="text-[14px]">
                      Harga tidak boleh melebihi budget pembeli
                    </p>
                  </div>
                </div>

                {/* PRICE SUMMARY */}
                {numericDealPrice > 0 && (
                  <div className="border border-[#CBD5E1] rounded-2xl p-3">

                    <h3 className="text-[18px] font-bold text-[#0F172A]">
                      Ringkasan Harga
                    </h3>

                    <div className="mt-2 space-y-2">

                      <div className="flex items-center justify-between gap-3">
                        <p className="text-[18px] text-[#64748B]">
                          Harga (Produk & Fee Jastiper)
                        </p>

                        <p className="text-[18px] font-medium text-[#1E293B]">
                          Rp {formatRupiah(numericDealPrice)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        <p className="text-[16px] text-[#64748B]">
                          Platform Fee (5%)
                        </p>

                        <p className="text-[16px] font-medium text-[#1E293B]">
                          Rp {formatRupiah(platformFee)}
                        </p>
                      </div>

                    </div>

                    <div className="border-t border-[#E2E8F0] mt-1 pt-1 flex items-center justify-between gap-4">

                      <h3 className="text-[18px] font-bold text-[#0F172A]">
                        Total Tagihan
                      </h3>

                      <h3 className="text-[18px] font-bold text-[#59D3B4]">
                        IDR {formatRupiah(totalInvoice)}
                      </h3>

                    </div>

                  </div>
                )}

                {/* INFO BOX */}
                <div className="bg-[#EEF4FF] border border-[#D6E4FF] rounded-2xl p-4 flex items-start gap-3">

                  <Info
                    className="text-[#1D4ED8] flex-shrink-0 mt-1"
                    size={22}
                  />

                  <p className="text-[15px] text-[#1D4ED8] leading-relaxed">
                    Tagihan akan otomatis dikirim ke pembeli setelah request diambil,
                    dan pembayaran harus diselesaikan dalam 24 jam sebelum order
                    dibatalkan otomatis.
                  </p>

                </div>

                {/* BUTTON */}
                <div className="flex flex-col-reverse md:flex-row justify-end gap-4 pt-2">

                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="w-full md:w-[160px] h-[52px] rounded-2xl border border-[#CBD5E1] text-[#64748B] text-[20px] font-medium hover:bg-gray-50 transition-all"
                  >
                    Kembali
                  </button>

                  <button
                    onClick={() => {
                      // VALIDASI KOSONG
                      if (!numericDealPrice) {
                        setShowValidationPopup(true)
                        return
                      }

                      // VALIDASI LEBIH DARI BUDGET
                      if (numericDealPrice > selectedRequest.budget) {
                        setShowValidationPopup(true)
                        return
                      }

                      // SUCCESS
                      setSelectedRequest(null)
                      setShowSuccessPopup(true)
                    }}
                    className="w-full md:w-[160px] h-[46px] rounded-2xl bg-[#59D3B4] hover:bg-[#4CC2A5] text-white text-[20px] font-semibold shadow-lg shadow-teal-100 transition-all"
                  >
                    Ambil
                  </button>

                </div>

              </div>
            </div>
          </div>
        )}

      </div>
        {/* SUCCESS POPUP */}
        {showSuccessPopup && (
          <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">

            <div className="w-full max-w-[340px] bg-white rounded-2xl p-5 text-center">

              {/* ICON */}
              <div className="w-14 h-14 rounded-full bg-[#DCFCE7] flex items-center justify-center mx-auto">
                <span className="text-[28px]">✅</span>
              </div>

              {/* TITLE */}
              <h2 className="mt-4 text-[20px] font-bold text-[#0F172A]">
                Permintaan Berhasil Diambil
              </h2>

              {/* DESC */}
              <p className="mt-2 text-[14px] text-[#64748B] leading-relaxed">
                Tagihan otomatis akan dikirim ke pembeli dan menunggu pembayaran.
              </p>

              {/* BUTTON */}
              <button
                onClick={() => setShowSuccessPopup(false)}
                className="mt-5 w-full h-[42px] rounded-xl bg-[#59D3B4] hover:bg-[#4CC2A5] text-white font-semibold transition-all"
              >
                Oke
              </button>

            </div>
          </div>
        )}

        {/* VALIDATION POPUP */}
        {showValidationPopup && (
          <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">

            <div className="w-full max-w-[320px] bg-white rounded-2xl p-5 text-center">

              {/* ICON */}
              <div className="w-14 h-14 rounded-full bg-[#FEE2E2] flex items-center justify-center mx-auto">
                <span className="text-[26px]">⚠️</span>
              </div>

              {/* TITLE */}
              <h2 className="mt-4 text-[18px] font-bold text-[#0F172A]">
                Harga Deal Tidak Valid
              </h2>

              {/* DESC */}
              <p className="mt-2 text-[14px] text-[#64748B] leading-relaxed">
                Pastikan harga deal sudah diisi dan tidak melebihi budget pembeli.
              </p>

              {/* BUTTON */}
              <button
                onClick={() => setShowValidationPopup(false)}
                className="mt-5 w-full h-[42px] rounded-xl bg-[#EF4444] hover:bg-[#DC2626] text-white font-semibold transition-all"
              >
                Mengerti
              </button>

            </div>
          </div>
        )}

    </main>
  )
}



