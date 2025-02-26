import connect from "@/lib/database";
import { CouponModel } from "@/lib/models";
import { Coupon } from "@/types/models";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        await connect();
        const coupons = await CouponModel.find({});
        return NextResponse.json(coupons);
    } catch (error) {
        console.error("GET Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await connect();
        const data:Coupon = await request.json();
        const newCoupon = await CouponModel.create(data);
        return NextResponse.json(newCoupon, { status: 201 });
    } catch (error) {
        console.error("POST Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}