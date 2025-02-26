"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useToast } from "@/hooks/use-toast";

interface Product {
  _id: string;
  name: string;
  category: string;
  subCategory: string;
  mrpPrice: number;
  discountPrice: number;
  image: string[];
}

interface ProductGridProps {
  category: string;
  subcategory: string;
  searchQuery: string;
}

export default function ProductGrid({
  category,
  subcategory,
  searchQuery,
}: ProductGridProps) {
  const [mounted, setMounted] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    fetchWishlist(); // Fetch the user's wishlist when the component mounts
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const url = new URL("http://localhost:3000/api/public/products");
        if (category) url.searchParams.append("category", category);
        if (subcategory) url.searchParams.append("subcategory", subcategory);
        if (searchQuery) url.searchParams.append("search", searchQuery);

        const response = await fetch(url.toString());
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        toast({
          title: "Error",
          description: "Failed to fetch products. Please try again later.",
        });
      }
    };

    fetchProducts();
  }, [category, subcategory, searchQuery, toast]);

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/user/wishlist", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch wishlist");
      }

      const data = await response.json();
      setWishlist(data.products.map((product: Product) => product._id));
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      toast({
        title: "Error",
        description: "Failed to fetch wishlist items.",
      });
    }
  };

  const toggleWishlist = async (productId: string, productName: string) => {
    try {
      if (wishlist.includes(productId)) {
        // Remove from wishlist
        const response = await fetch("/api/user/wishlist", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
          throw new Error("Failed to remove from wishlist");
        }

        setWishlist((prev) => prev.filter((id) => id !== productId));
        toast({
          title: "Removed from wishlist",
          description: `${productName} has been removed from your wishlist.`,
        });
      } else {
        // Add to wishlist
        const response = await fetch("/api/user/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
          throw new Error("Failed to add to wishlist");
        }

        setWishlist((prev) => [...prev, productId]);
        toast({
          title: "Added to wishlist",
          description: `${productName} has been added to your wishlist.`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">No products found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product._id} className="group">
          <div className="relative">
            <img
              src={product.image[0]} // Use the first image in the array
              alt={product.name}
              className="w-full aspect-square object-cover rounded-t-lg"
            />
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={() => toggleWishlist(product._id, product.name)}
              >
                <Heart
                  className={`h-5 w-5 ${
                    wishlist.includes(product._id)
                      ? "fill-red-500 text-red-500"
                      : "text-gray-500"
                  }`}
                />
              </Button>
            )}
          </div>
          <div className="p-4">
            <Link href={`/product/${product._id}`}>
              <h3 className="text-lg font-semibold mb-2 group-hover:text-yellow-600">
                {product.name}
              </h3>
            </Link>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold">
                ${product.discountPrice}{" "}
                <span className="text-sm line-through text-gray-500">
                  ${product.mrpPrice}
                </span>
              </span>
              <Button
                className="bg-yellow-600 hover:bg-yellow-700"
                onClick={() => handleAddToCart(product)}
              >
                Add to Cart
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}