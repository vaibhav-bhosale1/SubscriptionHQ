// apps/backend/src/index.ts

import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import subscriptionRoutes from './routes/subscriptionRoutes';

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is healthy' });
});

app.use('/api/subscriptions', subscriptionRoutes); // [cite: 80]

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});