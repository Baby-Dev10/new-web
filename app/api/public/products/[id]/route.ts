import { NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import { ProductModel } from "@/lib/models";

export async function GET(_: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect();
        const product = await ProductModel.findById(params.id).populate("reviews");
        if (!product) return NextResponse.json({ error: "Product not found" }, { status: 404 });

        return NextResponse.json(product);
    } catch (error) {
        console.error("GET Error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}