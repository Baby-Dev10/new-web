"use client"

import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Reviews() {
  const { data, error, mutate } = useSWR("/api/admin/reviews", fetcher)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  const handleVisibilityToggle = async (id: string, isVisible: boolean) => {
    await fetch(`/api/admin/review/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isVisible }),
    })
    mutate()
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/review/${id}`, { method: "DELETE" })
    mutate()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Reviews</h1>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>User</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Visible</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((review: any) => (
            <TableRow key={review._id}>
              <TableCell>{review.user.name}</TableCell>
              <TableCell>{review.product.name}</TableCell>
              <TableCell>{review.rating}</TableCell>
              <TableCell>{review.comment}</TableCell>
              <TableCell>
                <Switch
                  checked={review.isVisible}
                  onCheckedChange={(checked) => handleVisibilityToggle(review._id, checked)}
                />
              </TableCell>
              <TableCell>
                <Button variant="destructive" onClick={() => handleDelete(review._id)}>
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

