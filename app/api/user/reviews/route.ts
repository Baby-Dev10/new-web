import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import {
  UserModel,
  ProductModel,
  WishlistModel,
  CartItemModel,
  OrderModel,
  CouponModel,
  ReviewModel,
} from "@/lib/models";
import { getAuthenticatedUser } from "@/lib/auth";
// Get Reviews
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reviews = await ReviewModel.find({ user: user.id }).populate(
      "product"
    );
    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Get Reviews Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// Write Review
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, rating, comment } = await request.json();
    const product = await ProductModel.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const review = new ReviewModel({
      user: user.id,
      product: productId,
      rating,
      comment,
    });
    await review.save();

    return NextResponse.json(review);
  } catch (error) {
    console.error("Write Review Error:", error);
    return NextResponse.json(
      { error: "Failed to write review" },
      { status: 500 }
    );
  }
}

// Update Review
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId, rating, comment } = await request.json();
    const review = await ReviewModel.findOneAndUpdate(
      { id: reviewId, user: user.id },
      { rating, comment },
      { new: true }
    );
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json(review);
  } catch (error) {
    console.error("Update Review Error:", error);
    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 }
    );
  }
}

// Delete Review
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reviewId } = await request.json();
    const review = await ReviewModel.findOneAndDelete({
      id: reviewId,
      user: user.id,
    });
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Review deleted successfully" });
  } catch (error) {
    console.error("Delete Review Error:", error);
    return NextResponse.json(
      { error: "Failed to delete review" },
      { status: 500 }
    );
  }
}
