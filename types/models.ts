// Interface for User model
export interface User {
    _id?: string;
    name: string;
    email: string;
    password: string;
    role: "USER" | "ADMIN";
    wishlist?: string; // Ref ID
    orders?: string[]; // Array of Order IDs
    cart?: string[];   // Array of CartItem IDs
    reviews?: string[]; // Array of Review IDs
    isVerified: boolean;
    registrationCompleted: boolean;
    otp?: {
        code: string;
        generatedAt: Date;
        expiresAt: Date;
        attempts: number;
    };
    createdAt: Date;
    updatedAt: Date;
}

// Interface for Product model
export interface Product {
    _id?: string;
    name: string;
    description: string;
    image: string[];
    category: string;
    size: string[];
    mrpPrice: number;
    discountPrice: number;
    discountPercent?: string;
    bestSeller?: boolean;
    reviews?: string[]; // Array of Review IDs
    createdAt: Date;
    updatedAt: Date;
}

// Interface for Wishlist model
export interface Wishlist {
    _id?: string;
    user: string; // User ID
    products: string[]; // Array of Product IDs
    createdAt: Date;
    updatedAt: Date;
}

// Interface for Coupon model
export interface Coupon {
    _id?: string;
    code: string;
    discount: number;
    expiresAt: Date;
    minimumOrderAmount: number;
    discountType: "PERCENT" | "FLAT";
    createdAt?: Date;
    updatedAt?: Date;
}

// Interface for Order model
export interface Order {
    _id?: string;
    user: string; // User ID
    totalPrice: number;
    status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    orderItems: string[]; // Array of OrderItem IDs
    paymentMethod: "RAZORPAY" | "COD";
    isPaid: boolean;
    address: {
        street: string;
        city: string;
        state: string;
        pinCode: string;
        country: string;
        phoneNumber: string;
    };
    price: number;
    createdAt: Date;
    updatedAt: Date;
}

// Interface for CartItem model
export interface CartItem {
    _id?: string;
    product: string; // Product ID
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

// Interface for Review model
export interface Review {
    _id?: string;
    user: string; // User ID
    product: string; // Product ID
    rating: number;
    comment: string;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

// Interface for Banner model
export interface Banner {
    _id?: string;
    title: string;
    description?: string;
    imageUrl: string;
    createdAt: Date;
    updatedAt: Date;
}