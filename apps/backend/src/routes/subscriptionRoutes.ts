// apps/backend/src/routes/subscriptionRoutes.ts

import { Router, Request, Response } from 'express';
import { PrismaClient } from 'db';
import { razorpay } from '../services/razorpay';

const prisma = new PrismaClient();
const router = Router();

// Endpoint to create a new user and subscription
// POST /api/subscriptions
router.post('/', async (req: Request, res: Response) => {
  const { email, name, planId } = req.body; // [cite: 81]

  if (!email || !name || !planId) {
    return res.status(400).json({ error: 'Email, name, and planId are required.' });
  }

  try {
    // 1. Find the plan in our database to get the Razorpay Plan ID
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      return res.status(404).json({ error: 'Plan not found.' });
    }

    // 2. Create a Customer in Razorpay [cite: 89]
    const razorpayCustomer = await razorpay.customers.create({
      name,
      email,
    });

    // 3. Create a Subscription in Razorpay [cite: 90]
    const razorpaySubscription = await razorpay.subscriptions.create({
      plan_id: plan.razorpayPlanId,
      customer_id: razorpayCustomer.id,
      total_count: 12, // For a yearly plan; adjust as needed
      quantity: 1,
    });

    // 4. Save the new User and Subscription in our database [cite: 91]
    const user = await prisma.user.create({
      data: {
        email,
        name,
        razorpayCustomerId: razorpayCustomer.id,
        Subscription: {
          create: {
            razorpaySubscriptionId: razorpaySubscription.id,
            status: 'active', // Set status to active [cite: 92]
            planId: plan.id,
            // Razorpay returns period end in seconds, convert to ISOString
            currentPeriodEnd: new Date(razorpaySubscription.current_end * 1000),
          },
        },
      },
      include: {
        Subscription: true,
      },
    });

    // 5. Send the response back to the client [cite: 82]
    res.status(201).json({
      subscriptionId: user.Subscription?.razorpaySubscriptionId,
      status: user.Subscription?.status,
    });

  } catch (error) {
    console.error('Subscription creation failed:', error);
    res.status(500).json({ error: 'Failed to create subscription.' });
  }
});

export default router;