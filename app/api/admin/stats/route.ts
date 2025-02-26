import { NextResponse } from "next/server"
import dbConnect from "@/lib/database"
import { ProductModel, OrderModel, ReviewModel, UserModel } from "@/lib/models"

export async function GET(request: Request) {
  try {
    await dbConnect()

    const url = new URL(request.url)
    const fromDateStr = url.searchParams.get("fromDate")
    const toDateStr = url.searchParams.get("toDate")
    const fromDate = fromDateStr ? new Date(fromDateStr) : new Date(new Date().setDate(new Date().getDate() - 30))
    const toDate = toDateStr ? new Date(toDateStr) : new Date()

    const orderFilter: Record<string, any> = {
      createdAt: { $gte: fromDate, $lte: toDate },
    }

    const [
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
      averageRating,
      productStats,
      categoryStats,
      dailySales,
      topSellingProducts,
      userGrowth,
    ] = await Promise.all([
      UserModel.countDocuments(),
      ProductModel.countDocuments(),
      OrderModel.countDocuments(orderFilter),
      OrderModel.aggregate([{ $match: orderFilter }, { $group: { _id: null, total: { $sum: "$totalPrice" } } }]),
      ReviewModel.aggregate([{ $group: { _id: null, avg: { $avg: "$rating" } } }]),
      ProductModel.aggregate([{ $group: { _id: "$category", count: { $sum: 1 } } }]),
      OrderModel.aggregate([
        { $match: orderFilter },
        { $unwind: "$orderItems" },
        { $lookup: { from: "products", localField: "orderItems.product", foreignField: "_id", as: "product" } },
        { $unwind: "$product" },
        { $group: { _id: "$product.category", totalSales: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
      ]),
      OrderModel.aggregate([
        { $match: orderFilter },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            totalSales: { $sum: "$totalPrice" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      OrderModel.aggregate([
        { $match: orderFilter },
        { $unwind: "$orderItems" },
        { $lookup: { from: "products", localField: "orderItems.product", foreignField: "_id", as: "product" } },
        { $unwind: "$product" },
        {
          $group: {
            _id: "$product._id",
            name: { $first: "$product.name" },
            totalSales: { $sum: "$totalPrice" },
            count: { $sum: 1 },
          },
        },
        { $sort: { totalSales: -1 } },
        { $limit: 5 },
      ]),
      UserModel.aggregate([
        { $match: { createdAt: { $gte: fromDate, $lte: toDate } } },
        { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
    ])

    return NextResponse.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: totalRevenue[0]?.total || 0,
      averageRating: averageRating[0]?.avg || 0,
      productStats,
      categoryStats,
      dailySales,
      topSellingProducts,
      userGrowth,
    })
  } catch (error) {
    console.error("Stats API Error:", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}

