import { UserModel } from '@/lib/models';
export async function POST(req: Request) {
    try {
        const { email, otp } = await req.json();
        const user = await UserModel.findOne({ email });

        if (!user) {
            return new Response(JSON.stringify({ 
                message: "User not found" 
            }), { status: 404 });
        }

        if (!user.otp) {
            return new Response(JSON.stringify({ 
                message: "No OTP request found" 
            }), { status: 400 });
        }

        // Increment attempts
        user.otp.attempts = (user.otp.attempts || 0) + 1;
        
        // Check max attempts (3)
        if (user.otp.attempts >= 3) {
            await UserModel.deleteOne({ _id: user._id });
            return new Response(JSON.stringify({ 
                message: "Max OTP attempts exceeded. Please signup again." 
            }), { status: 400 });
        }

        if (new Date() > user.otp.expiresAt) {
            return new Response(JSON.stringify({ 
                message: "OTP expired" 
            }), { status: 400 });
        }

        if (user.otp.code !== otp) {
            console.log('Invalid OTP:', otp);
            console.log('User:', user.otp.code);
            await user.save(); // Save the incremented attempts
            return new Response(JSON.stringify({ 
                message: "Invalid OTP",
                remainingAttempts: 3 - user.otp.attempts
            }), { status: 400 });
        }

        // Mark user as verified and registration completed
        user.isVerified = true;
        user.registrationCompleted = true;
        user.otp = undefined;
        await user.save();

        return new Response(JSON.stringify({ 
            message: "Email verified successfully" 
        }), { status: 200 });
    } catch (error) {
        console.error('OTP verification error:', error);
        return new Response(JSON.stringify({ 
            message: "Something went wrong" 
        }), { status: 500 });
    }
}