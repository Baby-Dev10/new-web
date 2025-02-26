export interface User {
    _id: string;
    email: string;
    password: string;
    name: string;
    isVerified: boolean;
    registrationCompleted: boolean;  // New field
    otp?: {
      code: string;
      generatedAt: Date;
      expiresAt: Date;
      attempts: number;  // New field
    };
    createdAt: Date;
}