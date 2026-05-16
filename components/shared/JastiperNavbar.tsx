"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell } from "lucide-react"

export default function JastiperNavbar() {
  const pathname = usePathname()
  const avatar = null

  const isActive = (path: string) => pathname === path

  return (
    <nav className="w-full bg-white border-b border-gray-200">
      <div className="max-w-[1280px] mx-auto px-6 flex items-center justify-between h-[87px]">

        {/* LEFT */}
        <div className="flex items-center gap-12">

          {/* LOGO */}
          <div className="flex items-center gap-2">
            <img
              src="/Logo Jastipal.svg"
              alt="Jastipal Logo"
              className="w-12 h-12 object-contain"
            />

            <span className="font-semibold text-gray-900 text-lg">
              Jastipal
            </span>
          </div>

          {/* MENU */}
          <div className="flex items-center gap-8 text-sm">

            {/* DASHBOARD */}
            <Link
              href="/preview/jastiper/jastiper-dashboard"
              className={`relative font-medium ${
                isActive("/preview/jastiper/jastiper-dashboard")
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Dashboard

              {isActive("/preview/jastiper/jastiper-dashboard") && (
                <span className="absolute -bottom-[28px] left-0 right-0 h-[2px] bg-gray-900" />
              )}
            </Link>

            {/* PESANAN */}
            <Link
              href="/preview/jastiper/orders"
              className={`relative font-medium ${
                isActive("/preview/jastiper/orders")
                  ? "text-gray-900"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              Pesanan

              {isActive("/preview/jastiper/orders") && (
                <span className="absolute -bottom-[28px] left-0 right-0 h-[2px] bg-gray-900" />
              )}
            </Link>

          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-5">

          {/* NOTIFICATION */}
          <div className="relative cursor-pointer">
            <Bell size={20} className="text-gray-600" />

            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500" />
          </div>

          {/* PROFILE */}
          <div className="flex items-center gap-2 text-sm text-[#374151]">
            <img
              src={avatar || "/Vector.svg"}
              alt="User Avatar"
              className="w-9 h-9 rounded-full object-cover border border-gray-200"
            />

            <span className="font-medium">
              Rora
            </span>
          </div>

        </div>
      </div>
    </nav>
  )
}