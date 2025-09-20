// apps/frontend/app/page.tsx
import { MetricCard } from "@/components/MetricCard";
import { DollarSign, Users, TrendingDown } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold md:text-2xl">
            SaaSMetrics Engine Dashboard
          </h1>
        </div>
        
        {/* Key Metric Cards */}
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
          <MetricCard
            title="Monthly Recurring Revenue"
            value="Loading..."
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            description="Total MRR from active subscriptions"
          />
          <MetricCard
            title="Active Customers"
            value="Loading..."
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
            description="Total number of paying customers"
          />
          <MetricCard
            title="Churn Rate"
            value="Loading..."
            icon={<TrendingDown className="h-4 w-4 text-muted-foreground" />}
            description="Previous month's customer churn"
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-4 md:gap-8 lg:grid-cols-2">
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="font-semibold">MRR Trend (Last 30 Days)</h3>
              <div className="mt-4 h-[300px] w-full text-center text-muted-foreground">
                Chart will be displayed here...
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card text-card-foreground shadow">
            <div className="p-6">
              <h3 className="font-semibold">Churn Rate (Last 6 Months)</h3>
              <div className="mt-4 h-[300px] w-full text-center text-muted-foreground">
                Chart will be displayed here...
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}