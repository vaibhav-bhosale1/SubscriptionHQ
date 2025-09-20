import { Router, Request, Response } from 'express';
import { PrismaClient, SubStatus } from '@prisma/client';
import { razorpay } from '../services/razorpay';

const prisma = new PrismaClient();
const router = Router();

interface RazorpaySubscriptionResponse {
  id: string;
  status: string;
  current_end?: number | null;
  [key: string]: any;
}

router.post('/', async (req: Request, res: Response) => {
  const { email, name, planId } = req.body;


  if (!email || !name || !planId) {
    return res.status(400).json({ error: 'Email, name, and planId are required.' });
  }

  try {
    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan || !plan.razorpayPlanId) {
        return res.status(404).json({ error: 'Plan not found or not configured correctly.' });
    }

    const existingSubscription = await prisma.subscription.findFirst({
      where: { user: { email: email } }
    });
    if (existingSubscription) {
      return res.status(409).json({ error: 'User is already subscribed.' });
    }

    const razorpayCustomer = await razorpay.customers.create({ name, email });

    const razorpaySubscription: RazorpaySubscriptionResponse = await razorpay.subscriptions.create({
      plan_id: plan.razorpayPlanId,
      customer_id: razorpayCustomer.id,
      total_count: 12,
      quantity: 1,
    } as any);

    const subscriptionStatus: SubStatus = 'active';

    const defaultEndDate = new Date();
    defaultEndDate.setMonth(defaultEndDate.getMonth() + 1);

    const periodEnd = razorpaySubscription.current_end
      ? new Date(razorpaySubscription.current_end * 1000)
      : defaultEndDate;
    const user = await prisma.user.upsert({
      where: { email },
      update: { name, razorpayCustomerId: razorpayCustomer.id },
      create: { email, name, razorpayCustomerId: razorpayCustomer.id },
    });

    await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        razorpaySubscriptionId: razorpaySubscription.id,
        status: subscriptionStatus,
        currentPeriodEnd: periodEnd,
      }
    });

    res.status(201).json({
      subscriptionId: razorpaySubscription.id,
      status: subscriptionStatus,
    });

  } catch (error: any) {
    console.error('Subscription creation failed:', error);
    res.status(error.statusCode || 500).json({
      message: 'Failed to create subscription.',
      error: error.error || { code: 'INTERNAL_SERVER_ERROR', description: error.message },
    });
  }
});


export default router;

