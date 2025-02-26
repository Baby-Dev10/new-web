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

// Place Order
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cartItems, address, paymentMethod, couponCode } =
      await request.json();
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
    let coupon = null;
    if (couponCode) {
      coupon = await CouponModel.findOne({
        code: couponCode,
        expiresAt: { $gt: new Date() },
      });
      if (coupon) {
        if (coupon.discountType === "PERCENTAGE") {
          totalPrice -= totalPrice * (coupon.discount / 100);
        } else if (coupon.discountType === "FLAT") {
          totalPrice -= coupon.discount;
        }
      }
    }

    const order = new OrderModel({
      user: user.id,
      totalPrice,
      status: "PENDING",
      orderItems: cart.map((item: any) => item.id),
      paymentMethod,
      address,
      isPaid: paymentMethod === "RAZORPAY" ? false : true,
    });
    await order.save();

    // Clear the cart after placing the order
    await CartItemModel.deleteMany({ user: user.id });

    return NextResponse.json(order);
  } catch (error) {
    console.error("Place Order Error:", error);
    return NextResponse.json(
      { error: "Failed to place order" },
      { status: 500 }
    );
  }
}

// Get Orders
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await OrderModel.find({ user: user.id }).populate(
      "orderItems"
    );
    return NextResponse.json(orders);
  } catch (error) {
    console.error("Get Orders Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// Get Order Details
// export async function GET(request: NextRequest) {
//     try {
//         await dbConnect();
//         const user = await getAuthenticatedUser(request);
//         if (!user) {
//             return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
//         }

//         const { orderId } = await request.json();
//         const order = await OrderModel.findById(orderId).populate("orderItems");
//         if (!order) {
//             return NextResponse.json({ error: "Order not found" }, { status: 404 });
//         }

//         return NextResponse.json(order);
//     } catch (error) {
//         console.error('Get Order Details Error:', error);
//         return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 });
//     }
// }

// Cancel Order
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await request.json();
    const order = await OrderModel.findByIdAndUpdate(
      orderId,
      { status: "CANCELLED" },
      { new: true }
    );
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error("Cancel Order Error:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
