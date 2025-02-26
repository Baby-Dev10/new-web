"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Image, Package, Star, Tag, ShoppingCart, Menu, X } from "lucide-react"

const navItems = [
  { href: "/admin", icon: Home, label: "Dashboard" },
  { href: "/admin/banners", icon: Image, label: "Banners" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/reviews", icon: Star, label: "Reviews" },
  { href: "/admin/coupons", icon: Tag, label: "Coupons" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const toggleSidebar = () => setIsOpen(!isOpen)

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white px-4 py-3 shadow-md z-50 flex items-center justify-between">
        <div className="text-xl font-bold">Admin Panel</div>
        <button onClick={toggleSidebar}>
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`
          bg-white w-64 min-h-screen flex flex-col
          fixed top-0 left-0 z-40 transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:block
        `}
      >
        <div className="p-4 text-xl font-bold border-b md:hidden mt-16">Admin Panel</div>
        <div className="hidden md:block p-4 text-xl font-bold border-b">Admin Panel</div>
        <nav className="flex-1">
          <ul>
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 ${
                    pathname === item.href ? "bg-gray-200" : ""
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-2" />
                  <span className="text-sm md:text-base">{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  )
}