'use client';

import { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/old_lib/cart';
import Link from 'next/link';

type Product = {
  _id: string;
  name: string;
  image: string[];
  category: string;
  price: number;
  discountPrice: number;
  mrpPrice: number;
};

export default function WishlistPage() {
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const { addItem } = useCart();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
    const fetchWishlist = async () => {
      try {
        const response = await fetch('/api/user/wishlist', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch wishlist');
        }

        const data = await response.json();
        setWishlistProducts(data.products);
        setWishlist(data.products.map((product: Product) => product._id));
      } catch (error) {
        console.error('Error fetching wishlist:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch wishlist items.',
          variant: 'destructive',
        });
      }
    };

    fetchWishlist();
  }, [toast]);

  const toggleWishlist = async (productId: string, productName: string) => {
    try {
      if (wishlist.includes(productId)) {
        const response = await fetch('/api/user/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
          throw new Error('Failed to remove from wishlist');
        }

        setWishlist((prev) => prev.filter((id) => id !== productId));
        setWishlistProducts((prev) => prev.filter((product) => product._id !== productId));

        toast({
          title: 'Removed from wishlist',
          description: `${productName} has been removed from your wishlist.`,
        });
      } else {
        const response = await fetch('/api/user/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId }),
        });

        if (!response.ok) {
          throw new Error('Failed to add to wishlist');
        }

        setWishlist((prev) => [...prev, productId]);
        toast({
          title: 'Added to wishlist',
          description: `${productName} has been added to your wishlist.`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleAddToCart = (product: Product) => {
    // addItem(product);
    toast({
      title: 'Added to cart',
      description: `${product.name} has been added to your cart.`,
    });
  };

  if (wishlistProducts.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Heart className="h-16 w-16 text-gray-400 mb-4" />
        <h2 className="text-2xl font-semibold mb-4">Your wishlist is empty</h2>
        <p className="text-gray-600 mb-8">
          Add items to your wishlist while shopping to save them for later.
        </p>
        <Button asChild className="bg-yellow-600 hover:bg-yellow-700">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {wishlistProducts.map((product) => (
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
                        ? 'fill-red-500 text-red-500'
                        : 'text-gray-500'
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
                  ${product.discountPrice}{' '}
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
    </div>
  );
}