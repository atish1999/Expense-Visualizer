import { TrendingUp, Wallet, Coins } from "lucide-react";
import { type StatsResponse } from "@shared/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/hooks/use-currency";

interface StatsCardsProps {
  stats: StatsResponse;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const { formatAmount, currency } = useCurrency();
  const totalSpent = stats.total;
  
  const currentDay = new Date().getDate();
  const dailyAverage = totalSpent / (currentDay || 1);

  const topCategory = stats.byCategory.length > 0 
    ? stats.byCategory.reduce((prev, current) => (prev.total > current.total) ? prev : current)
    : { category: "N/A", total: 0 };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="shadow-sm border-border/50 hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Spent
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Coins className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-display tracking-tight">
            {formatAmount(totalSpent)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Lifetime spending
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50 hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Top Category
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            <TrendingUp className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-display tracking-tight truncate">
            {topCategory.category}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatAmount(topCategory.total)} spent
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border/50 hover:shadow-md transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Daily Average
          </CardTitle>
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
            <Wallet className="h-4 w-4" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold font-display tracking-tight">
            {formatAmount(dailyAverage)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            This month so far
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
