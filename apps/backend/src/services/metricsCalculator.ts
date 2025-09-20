// apps/backend/src/services/metricsCalculator.ts

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Calculates and stores daily metrics: MRR and Active Customers.
 */
export async function calculateDailyMetrics() {
  console.log('Running daily metrics calculation job...');

  // 1. Calculate Active Customers
  const activeCustomers = await prisma.subscription.count({
    where: { status: 'active' },
  });

  // 2. Calculate MRR (Monthly Recurring Revenue)
  const activeSubscriptions = await prisma.subscription.findMany({
    where: { status: 'active' },
    include: { plan: true },
  });

  const mrr = activeSubscriptions.reduce((total, sub) => total + sub.plan.price, 0);

  // 3. Store the results for today
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to the beginning of the day

  await prisma.metric.upsert({
    where: { date: today },
    update: {
      mrr,
      activeCustomers,
    },
    create: {
      date: today,
      mrr,
      activeCustomers,
      churnRate: 0, // Churn is calculated monthly
    },
  });

  console.log(`Daily metrics calculated and stored for ${today.toISOString().split('T')[0]}`);
  console.log(`MRR: ${mrr / 100}, Active Customers: ${activeCustomers}`);
}


/**
 * Calculates and stores the previous month's churn rate.
 * This is more complex and runs on the 1st of each month.
 */
export async function calculateMonthlyChurn() {
  console.log('Running monthly churn calculation job...');

  const today = new Date();
  const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfPreviousMonth = new Date(firstDayOfCurrentMonth.getTime() - 1);
  const firstDayOfPreviousMonth = new Date(lastDayOfPreviousMonth.getFullYear(), lastDayOfPreviousMonth.getMonth(), 1);

  // 1. Customers who canceled in the previous month
  const canceledLastMonth = await prisma.subscription.count({
    where: {
      status: 'canceled',
      updatedAt: {
        gte: firstDayOfPreviousMonth,
        lte: lastDayOfPreviousMonth,
      },
    },
  });

  // 2. Active customers at the start of the previous month.
  // This is an approximation. For perfect accuracy, you would need a historical log of subscription statuses.
  // We calculate it as (current active customers) + (customers who canceled last month).
  const activeAtStartOfMonth = await prisma.subscription.count({
    where: {
      OR: [
        { status: 'active' },
        {
          status: 'canceled',
          updatedAt: {
            gte: firstDayOfPreviousMonth,
            lte: lastDayOfPreviousMonth,
          },
        },
      ],
      createdAt: {
        lt: firstDayOfPreviousMonth,
      }
    }
  });

  if (activeAtStartOfMonth === 0) {
    console.log('No active customers at the start of the previous month. Churn rate is 0.');
    return;
  }

  // 3. Calculate Churn Rate
  const churnRate = (canceledLastMonth / activeAtStartOfMonth);

  // 4. Store the result for the last day of the previous month
  await prisma.metric.upsert({
    where: { date: lastDayOfPreviousMonth },
    update: {
      churnRate,
    },
    create: {
      date: lastDayOfPreviousMonth,
      churnRate,
      // We assume MRR and active customers were already recorded by the daily job
      mrr: 0,
      activeCustomers: 0,
    },
  });

  console.log(`Monthly churn calculated for ${firstDayOfPreviousMonth.toISOString().split('T')[0]} to ${lastDayOfPreviousMonth.toISOString().split('T')[0]}`);
  console.log(`Churn Rate: ${(churnRate * 100).toFixed(2)}%`);
}