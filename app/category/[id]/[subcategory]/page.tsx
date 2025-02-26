import Link from "next/link";
import { Input } from "@/components/ui/input";

// Define available categories and subcategories
const categories = ["tshirts", "rainwear"];
const subcategories = ["men", "women", "kids"];

// This function is required for static site generation with dynamic routes
export function generateStaticParams() {
  const params = [];

  for (const id of categories) {
    for (const subcategory of subcategories) {
      params.push({
        id,
        subcategory,
      });
    }
  }

  return params;
}

export default function SubcategoryPage({
  params,
}: {
  params: { id: string; subcategory: string };
}) {
  const categoryNames = {
    tshirts: "T-Shirts",
    rainwear: "Rainwear",
  };

  const subcategoryNames = {
    men: "Men",
    women: "Women",
    kids: "Kids",
  };

  const categoryName =
    categoryNames[params.id as keyof typeof categoryNames] || "Category";
  const subcategoryName =
    subcategoryNames[params.subcategory as keyof typeof subcategoryNames] ||
    "Subcategory";

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
          <Link
            href={`/category/${params.id}`}
            className="text-muted-foreground hover:text-foreground"
          >
            {categoryName}
          </Link>
          <span className="text-muted-foreground">/</span>
          <h1 className="text-2xl font-bold">{subcategoryName}</h1>
        </div>
      </div>
    </div>
  );
}
