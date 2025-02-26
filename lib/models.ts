import mongoose from "mongoose";

const { Schema, model } = mongoose;


const UserSchema = new Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      unique: true,
      required: true,
      validate: {
        validator: function (v: string) {
          return /\S+@\S+\.\S+/.test(v);
        }
      }
    },
    password: { type: String, required: true },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    wishlist: { type: mongoose.Schema.Types.ObjectId, ref: "Wishlist" },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
    cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "CartItem" }],
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    isVerified: { type: Boolean, default: false },
    registrationCompleted: { type: Boolean, default: false },
    otp: {
      code: String,
      generatedAt: Date,
      expiresAt: Date,
      attempts: { type: Number, default: 0 }
    },
  },
  { timestamps: true }
);

// Add a TTL index to automatically delete unverified users after 30 minutes
UserSchema.index({ createdAt: 1 }, {
  expireAfterSeconds: 10 * 60,
  partialFilterExpression: { registrationCompleted: false }
});


const ProductSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: Array, required: true },
    category: { type: String, required: true },
    subCategory: { type: String, required: true },
    colors:{ type: Array, required: true },
    sizes: { type: Array, required: true },
    mrpPrice: { type: Number, required: true },
    discountPrice: { type: Number, required: true },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
    discountPercent: {
      type: Number,
      get(this: { discountPrice: number; mrpPrice: number }) {
        return ((1 - this.discountPrice / this.mrpPrice) * 100).toFixed(2);
      },
    },
    bestSeller: { type: Boolean, default: false },
  },
  { timestamps: true }
);


const WishlistSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", unique: true },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);


const CouponSchema = new Schema(
  {
    code: { type: String, unique: true, required: true },
    discount: { type: Number, required: true },
    discountType: { type: String, enum: ['PERCENTAGE', 'FLAT'], required: true },
    expiresAt: { type: Date, required: true },
    minimumOrderAmount: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);


const OrderSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"],
      default: "PENDING",
    },
    orderItems: [{ type: mongoose.Schema.Types.ObjectId, ref: "OrderItem" }],
    paymentMethod: {
      type: String,
      enum: ["RAZORPAY", "COD"],
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pinCode: { type: String, required: true },
      country: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    price: { type: Number, required: true }
  },
  { timestamps: true }
);


const CartItemSchema = new Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true },
  },
  { timestamps: true }
);

const ReviewSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const BannerSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String, required: true }
  },
  { timestamps: true }
);

export const BannerModel = mongoose.models.Banner || model("Banner", BannerSchema);
export const UserModel = mongoose.models.User || model("User", UserSchema);
export const ProductModel = mongoose.models.Product || model("Product", ProductSchema);
export const WishlistModel = mongoose.models.Wishlist || model("Wishlist", WishlistSchema);
export const CouponModel = mongoose.models.Coupon || model("Coupon", CouponSchema);
export const OrderModel = mongoose.models.Order || model("Order", OrderSchema);
export const CartItemModel = mongoose.models.CartItem || model("CartItem", CartItemSchema);
export const ReviewModel = mongoose.models.Review || model("Review", ReviewSchema);
