import dotenv from "dotenv";
import path from 'path';




dotenv.config({ path: path.resolve(__dirname, '../.env') });


import express from 'express';
import cors from 'cors';
import subscriptionRoutes from './routes/subscriptionRoutes';
import razorpayWebhookHandler from './webhooks/razorpayWebhook';
import { startScheduler } from './jobs/scheduler';
import { calculateDailyMetrics, calculateMonthlyChurn } from './services/metricsCalculator';

console.log('Loaded RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Yes' : 'No');
console.log('Loaded RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Yes' : 'No');


const app = express();
const PORT = process.env.PORT || 4000;


app.use(cors());

app.post(
  '/api/webhooks/razorpay',
  express.raw({ type: 'application/json' }), 
  razorpayWebhookHandler
);
app.post('/api/webhooks/razorpay', express.raw({ type: 'application/json' }), razorpayWebhookHandler);
app.get('/api/test/run-jobs', async (req, res) => {
  try {
    await calculateDailyMetrics();
    await calculateMonthlyChurn();
    res.json({ message: 'Metric calculation jobs triggered successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to run jobs.' });
  }
});
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
    startScheduler();
});

