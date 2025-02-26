import { NextResponse } from "next/server";
import dbConnect from "@/lib/database";
import { ProductModel } from "@/lib/models";


export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const subCategory = searchParams.get("subCategory");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const bestSeller = searchParams.get("bestSeller");

    if (
      !search &&
      !category &&
      !subCategory &&
      !minPrice &&
      !maxPrice &&
      !bestSeller
    ) {
      // No filters provided, fetch all products
    //   try {
    //     const products = await ProductModel.find({}).select(
    //       "name mrpPrice discountPrice image category subCategory _id"
    //     );
    //     return NextResponse.json(products);
    //   } catch (error) {
    //     console.error("Error fetching all products:", error);
    //     throw new Error("Failed to fetch products");
    //   }
    }

    const filter: any = {};
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }
    if (category) {
      filter.category = category;
    }
    if (subCategory) {
      filter.subCategory = subCategory;
    }
    if (minPrice || maxPrice) {
      filter.mrpPrice = {};
      if (minPrice) filter.mrpPrice.$gte = Number(minPrice);
      if (maxPrice) filter.mrpPrice.$lte = Number(maxPrice);
    }
    if (bestSeller && bestSeller.toLowerCase() === "true") {
      filter.bestSeller = true;
    }

    const products = await ProductModel.find(filter).select(
      "name mrpPrice discountPrice image category subCategory _id"
    );
    return NextResponse.json(products);
  } catch (error) {
    console.error("GET Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
