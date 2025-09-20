// apps/backend/src/routes/metricsRoutes.ts

import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { subDays } from 'date-fns';

const prisma = new PrismaClient();
const router = Router();

/**
 * GET /api/metrics/latest
 * Fetches the most recently calculated metrics for the dashboard's key stats.
 */
router.get('/latest', async (req: Request, res: Response) => {
  try {
    const latestMetric = await prisma.metric.findFirst({
      orderBy: {
        date: 'desc',
      },
    });

    if (!latestMetric) {
      return res.status(404).json({ error: 'No metrics data found.' });
    }

    res.json(latestMetric);
  } catch (error) {
    console.error('Failed to fetch latest metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * GET /api/metrics/historical
 * Fetches a time series of metrics for dashboard charts.
 * Supports a `days` query parameter to specify the lookback period (e.g., ?days=30).
 */
router.get('/historical', async (req: Request, res: Response) => {
  try {
    const daysQuery = req.query.days as string;
    const days = parseInt(daysQuery, 10) || 30; // Default to 30 days

    const startDate = subDays(new Date(), days);

    const historicalMetrics = await prisma.metric.findMany({
      where: {
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'asc', // Return in chronological order for charting
      },
    });

    res.json(historicalMetrics);
  } catch (error) {
    console.error('Failed to fetch historical metrics:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;