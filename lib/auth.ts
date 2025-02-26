import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { UserModel } from "@/lib/models";
import connect from "@/lib/database";

// Define the user data structure
interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
}

// Helper function to verify the JWT token
export async function verifyToken(token: string): Promise<UserData | null> {
    try {
        
        const decoded = jwt.verify(token,process.env.JWT_SECRET! ) as UserData;
        return decoded;
    } catch (error) {
        console.error('Token verification error:', error);
        return null;
    }
}

// Helper function to get the authenticated user
export async function getAuthenticatedUser(request?: NextRequest): Promise<UserData | null> {
    try {
        await connect();

        // Get the token from cookies
        const cookieStore = cookies();
        const token = (await cookieStore).get("token")?.value;
        console.log('Token:', token);
        if (!token) {
            return null;
        }

        // Verify the token
        const userData = await verifyToken(token);
        console.log('User Data:', userData);
        if (!userData) {
            return null;
        }

        // Fetch the user from the database to ensure they exist and are verified
        const user = await UserModel.findOne({
            _id: userData.id, // Use _id instead of id
            isVerified: true,
            registrationCompleted: true,
        }).select("_id name email role"); // Use _id here as well
        console.log('User:', user);
        if (!user) {
            return null;
        }

        return {
            id: user._id.toString(), // Use _id here as well
            name: user.name,
            email: user.email,
            role: user.role,
        };
    } catch (error) {
        console.error('Authentication error:', error);
        return null;
    }
}