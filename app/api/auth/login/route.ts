export const dynamic = "force-dynamic"; // ✅ Add this at the top of your API route

import {User} from "@/types/index"
import connect from "@/lib/database";
import { UserModel } from "@/lib/models";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        await connect();
        const body: User = await req.json();
        const { email, password } = body;

        if (!email || !password) {
            return new Response("Please fill all fields", { status: 400 });
        }

        const user = await UserModel.findOne({ 
            email,
            registrationCompleted: true  // Only allow verified users to login
        });

        if (!user) {
            return new Response("User not found", { status: 404 });
        }

        const isMatch = await bcryptjs.compare(password, user.password);
        if (!isMatch) {
            return new Response("Invalid credentials", { status: 401 });
        }

        const tokenData = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        const token = jwt.sign(tokenData, process.env.JWT_SECRET!, {
            expiresIn: "30d"
        });

        const response = NextResponse.json({
            message: "Login successful",
            success: true,
            role: user.role
        });

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 // 30 days in seconds
        });

        return response;
    } catch (error) {
        console.error('Login error:', error);
        return new Response(JSON.stringify({ error: "Invalid credentials" }), {
            status: 401,
            headers: { "Content-Type": "application/json" }, // Ensure JSON response
          });    }
}