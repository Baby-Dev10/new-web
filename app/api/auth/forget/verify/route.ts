import { UserModel } from "@/lib/models";
import connectDB from "@/lib/database";
import bcrypt from "bcryptjs";
export async function POST(req: Request) {
    try {
        connectDB();
        const { email, otp, password } = await req.json();
        if (!email || !otp || !password) {
            return new Response(JSON.stringify({
                success: false,
                message: "Invalid request"
            }), {
                status: 400
            });
        }
        const user = await UserModel.findOne({
            email
        });
        if (!user) {
            return new Response(JSON.stringify({
                success: false,
                message: "User not found"
            }), {
                status: 404
            });
        }
        if (user.otp.code !== otp) {
            return new Response(JSON.stringify({
                success: false,
                message: "Invalid OTP"
            }), {
                status: 400
            });
        }
        if (user.otp.expiresAt < new Date()) {
            return new Response(JSON.stringify({
                success: false,
                message: "OTP expired"
            }), {
                status: 400
            });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        return new Response(JSON.stringify({
            success: true,
            message: "Password reset successfully"
        }), {
            status: 200
        });

    } catch (error) {
        return new Response(JSON.stringify({
            success: false,
            message: "Internal server error"
        }), {
            status: 500
        });
    }
}