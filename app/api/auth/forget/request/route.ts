import { UserModel } from "@/lib/models";
import connectDB from "@/lib/database";
import {  sendOTPEmail } from "@/lib/email";
import { otpForgetPasswordTemplate } from "@/lib/mailtemplate/otpforgetpassword";

//generate otp
export async function POST(req: Request) {
    try {
        connectDB();
        const { email } = await req.json();
        const user = await UserModel.findOne({ email });
        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                message: "User not found"
            }), { status: 404 });
        }
        const otp = Math.floor(100000 + Math.random() * 900000);
        user.otp ={
            code: otp,
            expiresAt: new Date(new Date().getTime() + 5 * 60000)
        }
        await user.save();
        await sendOTPEmail(email, otp.toString(), otpForgetPasswordTemplate);
        return new Response(JSON.stringify({
            success: true,
            message: "OTP sent successfully"
        }), { status: 200 });
    }
    catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: "An error occurred"
        }), { status: 500 });
    }}