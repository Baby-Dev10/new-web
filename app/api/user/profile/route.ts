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
// Get User Profile
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userProfile = await UserModel.findById(user.id).select(
      "-password -otp"
    );
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error("GET User Profile Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 500 }
    );
  }
}

// Update User Profile
export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, email } = await request.json();
    const updatedUser = await UserModel.findByIdAndUpdate(
      user.id,
      { name, email },
      { new: true }
    ).select("-password -otp");
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Update User Profile Error:", error);
    return NextResponse.json(
      { error: "Failed to update user profile" },
      { status: 500 }
    );
  }
}
