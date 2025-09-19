// apps/backend/src/services/razorpay.ts

import Razorpay from 'razorpay';
import 'dotenv/config';

// Ensure the environment variables are loaded and present
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay Key ID or Key Secret is not defined in .env file');
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});