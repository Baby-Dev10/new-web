import { v2 as cloudinary } from "cloudinary";

if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
    !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || 
    !process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET) {
    throw new Error('Missing Cloudinary credentials in environment variables');
}

// cloudinary.config({
//     cloud_name: "dnlpbwrec",
//     api_key:"375958252472778",
//     api_secret:"ChMIFjIr6BcyKMLURc7DpSsLoG0",
// });
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
    api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

export default cloudinary;