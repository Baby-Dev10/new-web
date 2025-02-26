import Link from "next/link";
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";

const subcategories = [
  {
    id: "men",
    name: "Men",
    image:
      "https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "women",
    name: "Women",
    image:
      "https://images.unsplash.com/photo-1525845859779-54d477ff291f?auto=format&fit=crop&q=80&w=800",
  },
  {
    id: "kids",
    name: "Kids",
    image:
      "https://images.unsplash.com/photo-1514090458221-65bb69cf63e6?auto=format&fit=crop&q=80&w=800",
  },
];

// Define available categories
const categories = ["tshirts", "rainwear"];

// This function is required for static site generation with dynamic routes
export function generateStaticParams() {
  return categories.map((id) => ({
    id,
  }));
}

export default function CategoryPage({ params }: { params: { id: string } }) {
  const categoryNames = {
    tshirts: "T-Shirts",
    rainwear: "Rainwear",
  };

  const categoryName =
    categoryNames[params.id as keyof typeof categoryNames] || "Category";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Link
            href="/"
            className="text-muted-foreground hover:text-foreground"
          >
            Categories
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-2xl font-bold">{categoryName}</h1>
        </div>

        <div className="flex items-center gap-2 mb-8">
          <Users className="h-6 w-6" />
          <h2 className="text-xl font-semibold">Shop by Category</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {subcategories.map((subcategory) => (
            <Link
              href={`/category/${params.id}/${subcategory.id}`}
              key={subcategory.id}
            >
              <Card className="group overflow-hidden transition-transform duration-300 hover:scale-105">
                <div className="relative aspect-square">
                  <img
                    src={subcategory.image}
                    alt={subcategory.name}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <h3 className="text-2xl font-bold text-white">
                      {subcategory.name}
                    </h3>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
