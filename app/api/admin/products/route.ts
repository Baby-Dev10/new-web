import { NextResponse } from "next/server"
import dbConnect from "@/lib/database"
import { ProductModel } from "@/lib/models"
import cloudinary from "@/lib/cloudinary"
import streamifier from "streamifier"

export async function GET() {
    try {
        await dbConnect()
        const products = await ProductModel.find({})
        return NextResponse.json(products)
    } catch (error) {
        console.error('GET Error:', error)
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        )
    }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;
    const data = await request.formData();

    // Validate the ID
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Find the product
    const product = await ProductModel.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Update product fields
    product.name = data.get("name")?.toString() || product.name;
    product.description = data.get("description")?.toString() || product.description;
    product.category = data.get("category")?.toString() || product.category;
    product.subCategory = data.get("subCategory")?.toString() || product.subCategory;
    product.mrpPrice = Number(data.get("mrpPrice")) || product.mrpPrice;
    product.discountPrice = Number(data.get("discountPrice")) || product.discountPrice;
    product.sizes = JSON.parse(data.get("sizes")?.toString() || "[]");
    product.colors = JSON.parse(data.get("colors")?.toString() || "[]");

    // Handle image updates (if new images are provided)
    const images = data.getAll("images") as File[];
    if (images.length > 0) {
      const uploadImage = async (file: File): Promise<string> => {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "products", resource_type: "auto", timeout: 60000 },
            (error, result) => {
              if (error) {
                reject(error);
              } else if (!result?.secure_url) {
                reject(new Error("No URL received from Cloudinary"));
              } else {
                resolve(result.secure_url);
              }
            }
          );
          streamifier.createReadStream(buffer).pipe(uploadStream);
        });
      };

      const imageUrls = await Promise.all(images.map((image) => uploadImage(image)));
      product.image = imageUrls;
    }

    // Save the updated product
    await product.save();

    return NextResponse.json(product);
  } catch (error: any) {
    console.error("PUT Error:", error);
    return NextResponse.json(
      { error: "Failed to update product: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await dbConnect();

    const { id } = params;

    // Validate the ID
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Find and delete the product
    const deletedProduct = await ProductModel.findByIdAndDelete(id);

    if (!deletedProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Product deleted successfully", deletedProduct },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("DELETE Error:", error);
    return NextResponse.json(
      { error: "Failed to delete product: " + error.message },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
    try {
        await dbConnect()
        
        const data = await request.formData()
        
        // Validate required fields
        const requiredFields = ['name', 'category','subCategory', 'mrpPrice', 'discountPrice', 'sizes', 'colors']
        for (const field of requiredFields) {
            if (!data.get(field)) {
                return NextResponse.json(
                    { error: `Missing required field: ${field}` },
                    { status: 400 }
                )
            }
        }

        const images = data.getAll('images') as File[]
        if (images.length === 0) {
            return NextResponse.json(
                { error: "No images provided" },
                { status: 400 }
            )
        }

        const uploadImage = (file: File): Promise<string> => {
            return new Promise(async (resolve, reject) => {
                try {
                    const arrayBuffer = await file.arrayBuffer()
                    const buffer = Buffer.from(arrayBuffer)
                    
                    const uploadStream = cloudinary.uploader.upload_stream(
                        {
                            folder: 'products',
                            resource_type: 'auto',
                            timeout: 60000
                        },
                        (error, result) => {
                            if (error) {
                                console.error('Cloudinary upload error:', error);
                                reject(error);
                            } else if (!result?.secure_url) {
                                reject(new Error('No URL received from Cloudinary'));
                            } else {
                                resolve(result.secure_url);
                            }
                        }
                    );

                    streamifier.createReadStream(buffer).pipe(uploadStream);
                } catch (error) {
                    console.error('Upload preparation error:', error);
                    reject(error);
                }
            });
        };

        // Upload all images
        let imageUrls: string[] = []
        try {
            imageUrls = await Promise.all(
                images.map(image => uploadImage(image))
            );
            console.log('Uploaded image URLs:', imageUrls);
        } catch (error: any) {
            console.error('Image upload error:', error);
            return NextResponse.json(
                { error: "Image upload failed: " + error.message },
                { status: 500 }
            );
        }

        // Create product with uploaded image URLs
        const productData = {
            name: data.get('name')?.toString(),
            description: data.get('description')?.toString(),
            category: data.get('category')?.toString(),
            subCategory: data.get('subCategory')?.toString(),
            brand: data.get('brand')?.toString(),
            mrpPrice: Number(data.get('mrpPrice')),
            discountPrice: Number(data.get('discountPrice')),
            image: imageUrls,
            sizes: JSON.parse(data.get('sizes')?.toString() || '[]'),
            colors: JSON.parse(data.get('colors')?.toString() || '[]')
        };

        const product = new ProductModel(productData);
        await product.save();

        return NextResponse.json(product);
    } catch (error: any) {
        console.error('POST Error:', error);
        return NextResponse.json(
            { error: "Failed to create product: " + error.message },
            { status: 500 }
        );
    }
}
