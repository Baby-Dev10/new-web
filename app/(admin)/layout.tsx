import type React from "react"
import "@/app/globals.css"

import Sidebar from "@/components/admin/AdminSidebar"



export const metadata = {
  title: "Admin Panel",
  description: "E-commerce Admin Panel",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body >
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1 overflow-auto">
            <main className="p-4">{children}</main>
          </div>
        </div>
      </body>
    </html>
  )
}
