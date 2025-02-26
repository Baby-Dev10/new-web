import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import { UserModel, ProductModel, WishlistModel } from "@/lib/models";
import { getAuthenticatedUser } from "@/lib/auth";

// Add to Wishlist
export async function POST(request: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { productId } = await request.json();

        // Ensure the productId is valid
        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        const product = await ProductModel.findById(productId);
        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        let wishlist = await WishlistModel.findOne({ user: user.id });
        if (!wishlist) {
            wishlist = new WishlistModel({ user: user.id, products: [] });
        }

        if (!wishlist.products.includes(productId)) {
            wishlist.products.push(productId);
            await wishlist.save();
        }

        return NextResponse.json({ message: "Product added to wishlist", wishlist });
    } catch (error) {
        console.error("Add to Wishlist Error:", error);
        return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
    }
}

// Remove from Wishlist
export async function DELETE(request: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { productId } = await request.json();

        // Ensure the productId is valid
        if (!productId) {
            return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
        }

        let wishlist = await WishlistModel.findOne({ user: user.id });

        if (!wishlist || wishlist.products.length === 0) {
            return NextResponse.json({ error: "Wishlist is empty or not found" }, { status: 404 });
        }

        const updatedProducts = wishlist.products.filter((id: any) => id.toString() !== productId);
        wishlist.products = updatedProducts;

        await wishlist.save();

        return NextResponse.json({ message: "Product removed from wishlist successfully", wishlist });
    } catch (error) {
        console.error("Remove from Wishlist Error:", error);
        return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
    }
}

// Get Wishlist
export async function GET(request: NextRequest) {
    try {
        await dbConnect();
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        let wishlist = await WishlistModel.findOne({ user: user.id }).populate("products");

        // If no wishlist exists, return an empty array
        if (!wishlist) {
            return NextResponse.json({ products: [] });
        }

        return NextResponse.json(wishlist);
    } catch (error) {
        console.error("Get Wishlist Error:", error);
        return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
    }
}
