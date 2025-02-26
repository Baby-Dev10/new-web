import { NextResponse } from "next/server"
import dbConnect from "@/lib/database"
import { BannerModel } from "@/lib/models"
import cloudinary from "@/lib/cloudinary" // new import

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect()

        if (!params.id) {
            return NextResponse.json({ error: "Banner ID is required" }, { status: 400 })
        }

        const banner = await BannerModel.findByIdAndDelete(params.id)
        if (!banner) {
            return NextResponse.json({ error: "Banner not found" }, { status: 404 })
        }
        
        // New: Delete image from Cloudinary if cloudinaryId exists
        if (banner.cloudinaryId) {
            await new Promise((resolve, reject) => {
                cloudinary.uploader.destroy(banner.cloudinaryId, (error, result) => {
                    if (error) {
                        console.error("Cloudinary deletion error:", error)
                        reject(error)
                    } else {
                        resolve(result)
                    }
                })
            })
        }
        
        return NextResponse.json({ message: "Banner deleted successfully" })
    } catch (error) {
        console.error('Error deleting banner:', error)
        return NextResponse.json(
            { error: "Failed to delete banner" },
            { status: 500 }
        )
    }
}
