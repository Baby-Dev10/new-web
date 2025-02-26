"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/old_lib/auth";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function CheckoutPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [shippingDetails, setShippingDetails] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
  });

  // Mock order details - In production, this would come from your cart/backend
  const orderDetails = {
    subtotal: 99.98,
    discount: 20,
    shipping: 10,
    tax: 8.99,
    total: 98.97,
  };

  const handleCouponApply = () => {
    // Implement coupon validation logic
    toast({
      title: "Coupon applied",
      description: "Discount has been applied to your order",
    });
  };

  const validateFields = () => {
    const requiredFields = [
      "fullName",
      "address",
      "city",
      "state",
      "zipCode",
      "phone",
    ];
    const emptyFields = requiredFields.filter(
      (field) => !shippingDetails[field as keyof typeof shippingDetails]
    );

    if (emptyFields.length > 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    try {
      if (!user) {
        toast({
          title: "Please login",
          description: "You need to login to complete the purchase",
          variant: "destructive",
        });
        router.push("/auth/login");
        return;
      }

      if (!validateFields()) {
        return;
      }

      setLoading(true);

      // Create order on the backend
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...shippingDetails,
          amount: orderDetails.total,
          email: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create order");
      }

      const { orderId, amount, currency } = await response.json();

      // Initialize Razorpay payment
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount,
        currency,
        name: "Elegance Store",
        description: "Purchase from Elegance Store",
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch("/api/checkout/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            if (!verifyResponse.ok) {
              throw new Error("Payment verification failed");
            }

            toast({
              title: "Payment successful",
              description: "Your order has been placed successfully",
            });
            router.push("/orders");
          } catch (error) {
            console.error("Verification error:", error);
            toast({
              title: "Payment verification failed",
              description: "Please contact support if amount was deducted",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: shippingDetails.fullName,
          email: user.email,
          contact: shippingDetails.phone,
        },
        theme: {
          color: "#ca8a04",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment failed",
        description: "Unable to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Shipping Details */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Shipping Details</h2>
          <Card className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <Input
                value={shippingDetails.fullName}
                onChange={(e) =>
                  setShippingDetails({
                    ...shippingDetails,
                    fullName: e.target.value,
                  })
                }
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <Input
                value={shippingDetails.address}
                onChange={(e) =>
                  setShippingDetails({
                    ...shippingDetails,
                    address: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <Input
                  value={shippingDetails.city}
                  onChange={(e) =>
                    setShippingDetails({
                      ...shippingDetails,
                      city: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">State</label>
                <Input
                  value={shippingDetails.state}
                  onChange={(e) =>
                    setShippingDetails({
                      ...shippingDetails,
                      state: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  ZIP Code
                </label>
                <Input
                  value={shippingDetails.zipCode}
                  onChange={(e) =>
                    setShippingDetails({
                      ...shippingDetails,
                      zipCode: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input
                  value={shippingDetails.phone}
                  onChange={(e) =>
                    setShippingDetails({
                      ...shippingDetails,
                      phone: e.target.value,
                    })
                  }
                  required
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Order Summary */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${orderDetails.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-${orderDetails.discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>${orderDetails.shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax</span>
                <span>${orderDetails.tax.toFixed(2)}</span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${orderDetails.total.toFixed(2)}</span>
                </div>
              </div>

              <div className="pt-4">
                <label className="block text-sm font-medium mb-2">
                  Apply Coupon
                </label>
                <div className="flex gap-2">
                  <Input
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    placeholder="Enter coupon code"
                  />
                  <Button
                    variant="outline"
                    onClick={handleCouponApply}
                    className="whitespace-nowrap"
                  >
                    Apply
                  </Button>
                </div>
              </div>

              <Button
                className="w-full bg-yellow-600 hover:bg-yellow-700"
                onClick={handlePayment}
                disabled={loading}
              >
                {loading ? "Processing..." : "Proceed to Payment"}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
