import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import shortid from "shortid";
import { z } from "zod";

const checkoutSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  address: z.string().min(5, "Address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  zipCode: z.string().min(5, "Valid ZIP code is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  amount: z.number().positive("Amount must be positive"),
  email: z.string().email("Valid email is required"),
});

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = checkoutSchema.parse(body);

    // Create Razorpay order
    const options = {
      amount: Math.round(validatedData.amount * 100), // Convert to paise
      currency: "INR",
      receipt: `order_${shortid.generate()}`,
      payment_capture: 1,
      notes: {
        shipping_address: `${validatedData.address}, ${validatedData.city}, ${validatedData.state} ${validatedData.zipCode}`,
        customer_name: validatedData.fullName,
        customer_phone: validatedData.phone,
        customer_email: validatedData.email,
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Checkout error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid checkout data", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to process checkout" },
      { status: 500 }
    );
  }
}
