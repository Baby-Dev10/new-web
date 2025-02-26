import { NextResponse } from "next/server"
import dbConnect from "@/lib/database"
import { ReviewModel } from "@/lib/models"

export async function GET() {
  try {
    await dbConnect()
    const reviews = await ReviewModel.find({}).populate("user", "name").populate("product", "name")
    return NextResponse.json(reviews)
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}
