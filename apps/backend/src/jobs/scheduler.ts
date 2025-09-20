// apps/backend/src/jobs/scheduler.ts

import cron from 'node-cron';
import { calculateDailyMetrics, calculateMonthlyChurn } from '../services/metricsCalculator';

export function startScheduler() {
  console.log('Scheduler started.');

  // Schedule the daily metrics job to run every day at 1:00 AM
  // Cron format: minute hour day-of-month month day-of-week
  cron.schedule('0 1 * * *', () => {
    console.log('--- Triggering Daily Metrics Job ---');
    calculateDailyMetrics().catch(console.error);
  });

  // Schedule the monthly churn job to run on the 1st day of every month at 2:00 AM
  cron.schedule('0 2 1 * *', () => {
    console.log('--- Triggering Monthly Churn Job ---');
    calculateMonthlyChurn().catch(console.error);
  });
}