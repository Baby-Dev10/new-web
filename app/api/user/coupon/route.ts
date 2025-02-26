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

// Apply Coupon
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { couponCode } = await request.json();
    const coupon = await CouponModel.findOne({
      code: couponCode,
      expiresAt: { $gt: new Date() },
    });
    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid or expired coupon" },
        { status: 400 }
      );
    }

    const cart = await CartItemModel.find({ user: user.id }).populate(
      "product"
    );
    if (cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    let totalPrice = cart.reduce(
      (total: number, item: any) =>
        total + item.product.discountPrice * item.quantity,
      0
    );
    if (coupon.discountType === "PERCENTAGE") {
      totalPrice -= totalPrice * (coupon.discount / 100);
    } else if (coupon.discountType === "FLAT") {
      totalPrice -= coupon.discount;
    }

    return NextResponse.json({ totalPrice, coupon });
  } catch (error) {
    console.error("Apply Coupon Error:", error);
    return NextResponse.json(
      { error: "Failed to apply coupon" },
      { status: 500 }
    );
  }
}

// Remove Coupon
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cart = await CartItemModel.find({ user: user.id }).populate(
      "product"
    );
    if (cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const totalPrice = cart.reduce(
      (total: number, item: any) =>
        total + item.product.discountPrice * item.quantity,
      0
    );
    return NextResponse.json({ totalPrice });
  } catch (error) {
    console.error("Remove Coupon Error:", error);
    return NextResponse.json(
      { error: "Failed to remove coupon" },
      { status: 500 }
    );
  }
}
