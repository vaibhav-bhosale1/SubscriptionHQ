import dotenv from "dotenv";
import path from 'path';


dotenv.config({ path: path.resolve(__dirname, '../.env') });


import express from 'express';
import cors from 'cors';
import subscriptionRoutes from './routes/subscriptionRoutes';

console.log('Loaded RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Yes' : 'No');
console.log('Loaded RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Yes' : 'No');


const app = express();
const PORT = process.env.PORT || 4000;


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy' });
});

app.use('/api/subscriptions', subscriptionRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

