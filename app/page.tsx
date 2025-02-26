"use client";

import Link from "next/link";
import { Grid2X2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ProductGrid from "@/components/ProductGrid";
import HeroCarousel from "@/components/HeroCarousel";

export default function Home() {
  const categories = [
    {
      id: "tshirts",
      name: "T-Shirts",
      image:
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800",
      description: "Comfortable and stylish t-shirts for everyone",
    },
    {
      id: "rainwear",
      name: "Rainwear",
      image:
        "https://images.unsplash.com/photo-1583745087329-2a6e6e5a2428?auto=format&fit=crop&q=80&w=800",
      description: "Stay dry in style with our rainwear collection",
    },
  ];

  return (
    <div>
      {/* Hero Section */}
      <HeroCarousel />

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 mb-12">
            <Grid2X2 className="h-8 w-8" />
            <h2 className="text-3xl font-bold text-center">Shop by Category</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {categories.map((category) => (
              <Link href={`/category/${category.id}`} key={category.id}>
                <Card className="group overflow-hidden transition-transform duration-300 hover:scale-105">
                  <div className="relative aspect-[16/9]">
                    <img
                      src={category.image}
                      alt={category.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <h2 className="text-3xl font-bold text-white">
                        {category.name}
                      </h2>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Featured Products
          </h2>
          <ProductGrid />
        </div>
      </section>
    </div>
  );
}
