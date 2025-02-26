import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      user: "atharva.atwork45@gmail.com",
      pass: "gppcjkpguxztrrhw",
    },
  });
  

export const sendEmail = async (to: string, subject: string, html: string) => {
    try {
        await transporter.sendMail({
            from: `"TheRainPoint" <atharva.atwork45@gmail.com>`,
            to,
            subject,
            html,
        });
        return true;
    } catch (error) {
        console.error('Email sending failed:', error);
        return false;
    }
};

export const sendOTPEmail = async (to: string, otp: string, template: (otp: string) => string) => {
    return sendEmail(
        to,
        'TheRainPoint - Verification Code',
        template(otp)
    );
};
