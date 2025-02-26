'use client';

import { useEffect, useState } from 'react';
import { Heart, Ruler, Package2, RefreshCw, Truck, Star, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/old_lib/cart';
import { useWishlist } from '@/old_lib/wishlist';
import { usePathname } from 'next/navigation';

interface Product {
  _id: string; // Assuming the API returns `id` as a string
  name: string;
  description: string;
  image: string[];
  category: string;
  subCategory: string;
  colors: string[];
  sizes: string[];
  mrpPrice: number;
  discountPrice: number;
  reviews: {
    id: string;
    user: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  bestSeller: boolean;
  shipping?: {
    freeShipping: boolean;
    estimatedDelivery: string;
  };
}

export default function ProductPage() {
  const pathname = usePathname();
  const productId = pathname.split('/').pop(); // Extract the product ID from the URL
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { addItem } = useCart();
  const { addItem: addToWishlist, removeItem: removeFromWishlist, hasItem: isInWishlist } = useWishlist();
  const { toast } = useToast();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/public/products/${productId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        // console.log(data);
        setProduct(data);
        setSelectedImage(data.image[0]); // Set the first image as the default selected image
        setSelectedSize(data.sizes[0]); // Set the first size as the default selected size
        setSelectedColor(data.colors[0]); // Set the first color as the default selected color
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch product details. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    }
  }, [productId, toast]);

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      id: product._id,
      name: product.name,
      price: product.discountPrice, // Use discounted price for the cart
      image: product.image[0],
      category: product.category,
      size: selectedSize,
      color: selectedColor,
    });

    toast({
      title: 'Added to cart',
      description: `${product.name} (Size: ${selectedSize}, Color: ${selectedColor}) has been added to your cart.`,
    });
  };

  const toggleWishlist = async () => {
    if (!product) return;
    //  console.log(product)
    try {
      setIsLoading(true);

      if (isInWishlist(product._id)) {
        removeFromWishlist(product._id);

        const response = await fetch('/api/user/wishlist', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product._id.toString() }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to remove from wishlist');
        }

        toast({
          title: 'Removed from wishlist',
          description: `${product.name} has been removed from your wishlist.`,
        });
      } else {
        const response = await fetch('/api/user/wishlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId: product._id.toString() }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to add to wishlist');
        }

        addToWishlist(product._id);
        toast({
          title: 'Added to wishlist',
          description: `${product.name} has been added to your wishlist.`,
        });
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <p className="text-center text-lg text-muted-foreground">
          {isLoading ? 'Loading product details...' : 'Product not found.'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Card className="overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square relative">
              <img
                src={selectedImage}
                alt={product.name}
                className="w-full h-full object-cover rounded-lg"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4"
                onClick={toggleWishlist}
                disabled={isLoading}
              >
                <Heart
                  className={`h-6 w-6 ${
                    isInWishlist(product._id)
                      ? 'fill-red-500 text-red-500'
                      : 'text-gray-500'
                  }`}
                />
              </Button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.image.map((image, i) => (
                <img
                  key={i}
                  src={image}
                  alt={`${product.name} view ${i + 1}`}
                  className={`aspect-square object-cover rounded-md cursor-pointer hover:opacity-80 ${
                    selectedImage === image ? 'ring-2 ring-black' : ''
                  }`}
                  onClick={() => setSelectedImage(image)}
                />
              ))}
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500 mb-2">{product.category}</p>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <div className="text-2xl font-bold mb-4">
                ${product.discountPrice.toFixed(2)}{' '}
                <span className="text-sm line-through text-gray-500">
                  ${product.mrpPrice.toFixed(2)}
                </span>
              </div>
              <p className="text-gray-600">{product.description}</p>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="text-sm font-medium mb-2">Color</h3>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <Button
                    key={color}
                    variant={selectedColor === color ? 'default' : 'outline'}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </Button>
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-sm font-medium mb-2">Size</h3>
              <div className="grid grid-cols-5 gap-2">
                {product.sizes.map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? 'default' : 'outline'}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <Button
                className="w-full bg-yellow-600 hover:bg-yellow-700 h-12"
                onClick={handleAddToCart}
              >
                Add to Cart
              </Button>
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={toggleWishlist}
                disabled={isLoading}
              >
                {isInWishlist(product._id) ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>

            {/* Shipping Info */}
            {product.shipping && (
              <div className="space-y-4 pt-6 border-t">
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium">
                      {product.shipping.freeShipping ? 'Free Shipping' : 'Standard Shipping'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Estimated delivery: {product.shipping.estimatedDelivery}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <RefreshCw className="h-5 w-5 text-gray-400" />
                  <div>
                    <h3 className="font-medium">Free Returns</h3>
                    <p className="text-sm text-gray-600">
                      Within 30 days of delivery
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Information Tabs */}
        <div className="border-t">
          <Tabs defaultValue="details" className="p-6">
            <TabsList className="grid grid-cols-3 w-full max-w-md">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="shipping">Shipping</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="shipping" className="mt-6 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Package2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium">Delivery Information</h4>
                    <p className="text-gray-600 mt-1">
                      {product.shipping?.freeShipping
                        ? 'Free standard shipping on all orders'
                        : 'Standard shipping rates apply'}
                    </p>
                    <p className="text-gray-600 mt-1">
                      Estimated delivery: {product.shipping?.estimatedDelivery || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <RefreshCw className="h-5 w-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium">Returns</h4>
                    <p className="text-gray-600 mt-1">
                      Free returns within 30 days. See our return policy for more details.
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="mt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Customer Reviews</h3>
                  <Button>Write a Review</Button>
                </div>

                <div className="space-y-4">
                  {product.reviews.map((review) => (
                    <Card key={review.id} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-2">
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= review.rating
                                      ? 'text-yellow-400 fill-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(review.date).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="font-medium mt-1">{review.user}</p>
                          <p className="text-gray-600 mt-2">{review.comment}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}