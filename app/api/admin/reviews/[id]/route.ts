import { NextResponse } from "next/server"
import dbConnect from "@/lib/database"
import { ReviewModel } from "@/lib/models"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {

    await dbConnect()
    
    // Validate ID
    if (!params.id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 })
    }

    // Parse request body
    let data
    try {
      data = await request.json()
    } catch (error) {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
    }

    // Only allow updating isVisible field
    const updateData = {
      isVisible: Boolean(data.isVisible)
    }

    // Update review
    const review = await ReviewModel.findByIdAndUpdate(
      params.id, 
      updateData, 
      { new: true }
    )
    
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json(review)

  } catch (error) {
    console.error("Error updating review:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE({ params }: { params: { id: string } }) {
  try {

    await dbConnect()
    
    // Validate ID
    if (!params.id) {
      return NextResponse.json({ error: "Review ID is required" }, { status: 400 })
    }

    // Delete review
    const review = await ReviewModel.findByIdAndDelete(params.id)
    
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Review deleted" })

  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

