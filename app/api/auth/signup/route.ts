import { NextResponse } from "next/server";
import { UserModel } from "@/lib/models";
import connectDB from "@/lib/database";
import bcryptjs from "bcryptjs";
import { sendOTPEmail } from '@/lib/email';
import { otpRegistrationTemplate } from '@/lib/mailtemplate/otpregisteration';

export async function POST(req: Request) {
    try {
        await connectDB();
        console.log("Signup route hit");

        const { email, password, name } = await req.json();

        if (!email || !password || !name) {
            return NextResponse.json({ error: "Please fill all fields" }, { status: 400 });
        }

        // Check if a verified user already exists
        const existingVerifiedUser = await UserModel.findOne({ email, registrationCompleted: true });
        if (existingVerifiedUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Delete any unverified user before creating a new one
        await UserModel.deleteOne({ email, registrationCompleted: false });

        const hashedPassword = await bcryptjs.hash(password, 10);
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 10 * 60000);

        const newUser = new UserModel({
            email,
            password: hashedPassword,
            name,
            isVerified: false,
            registrationCompleted: false,
            otp: {
                code: otp,
                generatedAt: now,
                expiresAt,
                attempts: 0
            },
            createdAt: now
        });

        await newUser.save();
        await sendOTPEmail(email, otp, otpRegistrationTemplate);

        return NextResponse.json({ message: "Signup successful, OTP sent" }, { status: 200 });
    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
    }
}
