import dbConnect from "@/lib/database"
import { BannerModel } from "@/lib/models"
import { NextResponse } from "next/server"

export async function GET() {
    try {
        await dbConnect()
        const banners = await BannerModel.find({})
        return NextResponse.json({
            success: true,
            banners: banners
        })
    } catch (error) {
        console.error('Error fetching banners:', error)
        return NextResponse.json(
            { error: 'Failed to fetch banners',
                success: false
             },
            { status: 500 }
        )
    }
}
