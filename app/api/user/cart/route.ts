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

// Add to Cart
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity } = await request.json();
    const product = await ProductModel.findById(productId);
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    let cartItem = await CartItemModel.findOne({
      user: user.id,
      product: productId,
    });
    if (cartItem) {
      cartItem.quantity += quantity;
    } else {
      cartItem = new CartItemModel({
        user: user.id,
        product: productId,
        quantity,
      });
    }
    await cartItem.save();

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("Add to Cart Error:", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

// Remove from Cart
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await request.json();
    const cartItem = await CartItemModel.findOneAndDelete({
      user: user.id,
      product: productId,
    });
    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Cart item removed successfully" });
  } catch (error) {
    console.error("Remove from Cart Error:", error);
    return NextResponse.json(
      { error: "Failed to remove from cart" },
      { status: 500 }
    );
  }
}

// Update Cart Item Quantity
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId, quantity } = await request.json();
    const cartItem = await CartItemModel.findOneAndUpdate(
      { user: user.id, product: productId },
      { quantity },
      { new: true }
    );
    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(cartItem);
  } catch (error) {
    console.error("Update Cart Item Quantity Error:", error);
    return NextResponse.json(
      { error: "Failed to update cart item quantity" },
      { status: 500 }
    );
  }
}

// Get Cart
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cartItems = await CartItemModel.find({ user: user.id }).populate(
      "product"
    );
    return NextResponse.json(cartItems);
  } catch (error) {
    console.error("Get Cart Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}
