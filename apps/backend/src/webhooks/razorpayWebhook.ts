import { Request, Response } from 'express';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const razorpayWebhookHandler = async (req: Request, res: Response) => {
  // 1. Validate the webhook signature
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;
  const signature = req.headers['x-razorpay-signature'] as string;

  if (!signature) {
    console.error('Webhook signature validation failed: No signature header.');
    return res.status(400).send('Bad Request: Signature missing');
  }

  try {
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(req.body); // req.body is the raw buffer
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      console.error('Webhook signature validation failed: Signature mismatch.');
      return res.status(400).send('Bad Request: Invalid signature');
    }
  } catch (error) {
    console.error('Error during signature verification:', error);
    return res.status(500).send('Internal Server Error');
  }

  // 2. Signature is verified. Now process the event.
  const event = JSON.parse(req.body.toString());
  const subscriptionEntity = event.payload.subscription.entity;
  const razorpaySubscriptionId = subscriptionEntity.id;

  try {
    // --- FIX APPLIED HERE ---
    // Before processing any event, first check if we have this subscription in our database.
    const subscriptionInDb = await prisma.subscription.findUnique({
      where: { razorpaySubscriptionId },
    });

    if (!subscriptionInDb) {
      // If we don't have this subscription, log it and send a 200 OK.
      // This prevents Razorpay from retrying a webhook for a subscription we don't care about.
      console.warn(`Webhook received for a subscription not found in our DB: ${razorpaySubscriptionId}. Ignoring.`);
      return res.status(200).json({ status: 'ok, ignored' });
    }

    // If the subscription exists, proceed with the event logic.
    switch (event.event) {
      case 'subscription.charged':
        console.log(`Processing 'subscription.charged' for sub_id: ${razorpaySubscriptionId}`);
        await prisma.subscription.update({
          where: { razorpaySubscriptionId },
          data: {
            status: 'active',
            currentPeriodEnd: new Date(subscriptionEntity.current_end * 1000),
          },
        });
        console.log(`Subscription ${razorpaySubscriptionId} updated to 'active'.`);
        break;

      case 'subscription.cancelled':
        console.log(`Processing 'subscription.cancelled' for sub_id: ${razorpaySubscriptionId}`);
        await prisma.subscription.update({
          where: { razorpaySubscriptionId },
          data: {
            status: 'canceled',
          },
        });
        console.log(`Subscription ${razorpaySubscriptionId} updated to 'canceled'.`);
        break;

      default:
        console.log(`Received unhandled event: ${event.event}`);
    }

    // 3. Acknowledge receipt of the event
    res.status(200).json({ status: 'ok' });

  } catch (error) {
    console.error(`Error processing webhook event '${event.event}':`, error);
    res.status(500).json({ error: 'Failed to process webhook event.' });
  }
};

export default razorpayWebhookHandler;
