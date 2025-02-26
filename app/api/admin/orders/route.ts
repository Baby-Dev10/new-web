import { NextResponse } from "next/server"
import dbConnect from "@/lib/database"
import { OrderModel } from "@/lib/models"

export async function GET() {
    try {
        await dbConnect()
        const orders = await OrderModel.find({}).populate("user", "name")
        return NextResponse.json(orders)
    } catch (error) {
        console.error('Failed to fetch orders:', error)
        return NextResponse.json(
            { error: 'Failed to fetch orders' },
            { status: 500 }
        )
    }
}
