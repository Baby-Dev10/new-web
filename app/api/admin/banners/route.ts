import { NextResponse } from "next/server"
import dbConnect from "@/lib/database"
import { BannerModel } from "@/lib/models"
import cloudinary from "@/lib/cloudinary"
import streamifier from "streamifier"

export async function GET() {
  await dbConnect()
  const banners = await BannerModel.find({})
  return NextResponse.json(banners)
}

export async function POST(request: Request) {
  await dbConnect()
  const data = await request.formData()
  const image = data.get("image") as File | null

  let imageUrl = ""
  let publicId = ""
  if (image && image.size > 0) {
    const uploadImage = (file: File): Promise<{ url: string; public_id: string }> => {
      return new Promise(async (resolve, reject) => {
        try {
          const arrayBuffer = await file.arrayBuffer()
          const buffer = Buffer.from(arrayBuffer)
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'banners',
              resource_type: 'auto',
              timeout: 60000
            },
            (error, result) => {
              if (error) {
                console.error('Cloudinary upload error:', error)
                reject(error)
              } else if (!result?.secure_url || !result.public_id) {
                reject(new Error('Incomplete upload result from Cloudinary'))
              } else {
                resolve({ url: result.secure_url, public_id: result.public_id })
              }
            }
          )
          streamifier.createReadStream(buffer).pipe(uploadStream)
        } catch (error) {
          console.error('Upload preparation error:', error)
          reject(error)
        }
      })
    }

    try {
      const uploadResult = await uploadImage(image)
      imageUrl = uploadResult.url
      publicId = uploadResult.public_id
      console.log('Uploaded banner image URL:', imageUrl)
    } catch (error: any) {
      console.error('Image upload error:', error)
      return NextResponse.json(
        { error: "Image upload failed: " + error.message },
        { status: 500 }
      )
    }
  }
  
  const bannerData = {
    title: data.get("title")?.toString(),
    description: data.get("description")?.toString(),
    imageUrl,
    cloudinaryId: publicId || ""
  }

  const banner = new BannerModel(bannerData)
  await banner.save()

  return NextResponse.json(banner)
}


