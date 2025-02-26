"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Coupons() {
  const { data, error, mutate } = useSWR("/api/admin/coupon", fetcher)
  const [newCoupon, setNewCoupon] = useState({
    code: "",
    discount: "",
    discountType: "PERCENTAGE",
    minimumOrderAmount: "",
    expiresAt: "",
  })

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch("/api/admin/coupon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newCoupon),
    })
    mutate()
    setNewCoupon({ code: "", discount: "", discountType: "PERCENTAGE", minimumOrderAmount: "", expiresAt: "" })
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/coupon/${id}`, { method: "DELETE" })
    mutate()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Coupons</h1>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          placeholder="Code"
          value={newCoupon.code}
          onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
        />
        <Input
          placeholder="Discount"
          type="number"
          value={newCoupon.discount}
          onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })}
        />
        <Select
          value={newCoupon.discountType}
          onValueChange={(value) => setNewCoupon({ ...newCoupon, discountType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Discount Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="PERCENTAGE">Percentage</SelectItem>
            <SelectItem value="FLAT">Flat</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder="Minimum Order Amount"
          type="number"
          value={newCoupon.minimumOrderAmount}
          onChange={(e) => setNewCoupon({ ...newCoupon, minimumOrderAmount: e.target.value })}
        />
        <Input
          placeholder="Expires At"
          type="datetime-local"
          value={newCoupon.expiresAt}
          onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: e.target.value })}
        />
        <Button type="submit">Add Coupon</Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Discount</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Minimum Order</TableHead>
            <TableHead>Expires At</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((coupon: any) => (
            <TableRow key={coupon._id}>
              <TableCell>{coupon.code}</TableCell>
              <TableCell>{coupon.discount}</TableCell>
              <TableCell>{coupon.discountType}</TableCell>
              <TableCell>{coupon.minimumOrderAmount}</TableCell>
              <TableCell>{new Date(coupon.expiresAt).toLocaleString()}</TableCell>
              <TableCell>
                <Button variant="destructive" onClick={() => handleDelete(coupon._id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

