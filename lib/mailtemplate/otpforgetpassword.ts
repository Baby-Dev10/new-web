export const otpForgetPasswordTemplate = (otp: string) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>TheRainPoint - Password Reset</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #333;">TheRainPoint</h1>
        </div>
        <div style="padding: 20px; background-color: #f8f9fa; border-radius: 5px;">
            <h2 style="color: #333;">Password Reset Code</h2>
            <p>Your password reset code is:</p>
            <div style="background-color: #e9ecef; padding: 10px; text-align: center; font-size: 24px; font-weight: bold;">
                ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this code, please ignore this email.</p>
        </div>
        <div style="margin-top: 20px; text-align: center; color: #666;">
            <p>&copy; ${new Date().getFullYear()} TheRainPoint. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
`;
