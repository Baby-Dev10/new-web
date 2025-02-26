import { NextResponse } from "next/server"
import dbConnect from "@/lib/database"
import { OrderModel } from "@/lib/models"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        await dbConnect()

        if (!params.id) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 })
        }

        let data
        try {
            data = await request.json()
        } catch (error) {
            return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
        }

        const order = await OrderModel.findByIdAndUpdate(params.id, data, { new: true })
        if (!order) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 })
        }

        return NextResponse.json(order)
    } catch (error) {
        console.error('Error updating order:', error)
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        )
    }
}
