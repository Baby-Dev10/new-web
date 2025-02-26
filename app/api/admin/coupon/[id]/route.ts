import { NextResponse } from "next/server";
import connect from "@/lib/database";
import { CouponModel } from "@/lib/models";


export async function DELETE( _:Request,{ params }: { params: { id: string } }) {
    console.log("DELETE"+params.id);
    try {
        await connect();
        const id: string = params.id;
        const deletedCoupon = await CouponModel.findByIdAndDelete(id);
        if (!deletedCoupon) return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
        return NextResponse.json(`sucessfully deleted ${deletedCoupon}`,{status:200});
    } catch (error) {
        console.error("DELETE Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}