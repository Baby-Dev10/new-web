"use client"

import type React from "react"

import { useState } from "react"
import useSWR from "swr"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Banners() {
  const { data, error, mutate } = useSWR("/api/admin/banners", fetcher)
  const [newBanner, setNewBanner] = useState({ title: "", description: "", imageFile: null })

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append("title", newBanner.title)
    formData.append("description", newBanner.description)
    if (newBanner.imageFile) formData.append("image", newBanner.imageFile)
    await fetch("/api/admin/banners", { // updated endpoint to plural
      method: "POST",
      body: formData,
    })
    mutate()
    setNewBanner({ title: "", description: "", imageFile: null })
  }

  const handleDelete = async (id: string) => {
    await fetch(`/api/admin/banners/${id}`, { method: "DELETE" }) // updated endpoint to plural
    mutate()
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Banners</h1>

      <form onSubmit={handleSubmit} className="space-y-2">
        <Input
          placeholder="Title"
          value={newBanner.title}
          onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
        />
        <Input
          placeholder="Description"
          value={newBanner.description}
          onChange={(e) => setNewBanner({ ...newBanner, description: e.target.value })}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setNewBanner({ ...newBanner, imageFile: e.target.files ? e.target.files[0] : null })
          }
        />
        <Button type="submit">Add Banner</Button>
      </form>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Image</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((banner: any) => (
            <TableRow key={banner._id}>
              <TableCell>{banner.title}</TableCell>
              <TableCell>
                <img src={banner.imageUrl} alt={banner.title} style={{ width: "100px", height: "auto" }} />
              </TableCell>
              <TableCell>
                <Button variant="destructive" onClick={() => handleDelete(banner._id)}>
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

