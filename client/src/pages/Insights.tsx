import { useState } from "react";
import { Layout } from "@/components/Layout";
import { useInsights } from "@/hooks/use-insights";
import { useCurrency } from "@/hooks/use-currency";
import { useFinancialHealthScore } from "@/hooks/use-financial-health";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  CalendarIcon,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  PieChart as PieChartIcon,
  Activity,
  Target,
  AlertTriangle,
  Lightbulb,
  Download,
  Zap,
  AlertCircle,
} from "lucide-react";
import { format, subMonths, startOfMonth, endOfMonth, subQuarters, startOfQuarter, endOfQuarter, startOfYear } from "date-fns";
import { cn } from "@/lib/utils";
import type { InsightsQuery } from "@shared/routes";

const COLORS = [
  "#10b981", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6",
  "#ec4899", "#06b6d4", "#84cc16", "#f97316", "#6366f1",
];

type TimePreset = "this_month" | "last_3_months" | "last_quarter" | "this_year" | "custom";
type Granularity = "month" | "quarter" | "year";

export default function Insights() {
  const { formatAmount, currency } = useCurrency();
  const [timePreset, setTimePreset] = useState<TimePreset>("last_3_months");
  const [granularity, setGranularity] = useState<Granularity>("month");
  const [customRange, setCustomRange] = useState<{ start: Date | undefined; end: Date | undefined }>({
    start: undefined,
    end: undefined,
  });

  const getDateRange = (): { startDate?: string; endDate?: string } => {
    const now = new Date();
    switch (timePreset) {
      case "this_month":
        return {
          startDate: startOfMonth(now).toISOString(),
          endDate: endOfMonth(now).toISOString(),
        };
      case "last_3_months":
        return {
          startDate: startOfMonth(subMonths(now, 2)).toISOString(),
          endDate: endOfMonth(now).toISOString(),
        };
      case "last_quarter":
        const lastQ = subQuarters(now, 1);
        return {
          startDate: startOfQuarter(lastQ).toISOString(),
          endDate: endOfQuarter(lastQ).toISOString(),
        };
      case "this_year":
        return {
          startDate: startOfYear(now).toISOString(),
          endDate: now.toISOString(),
        };
      case "custom":
        return {
          startDate: customRange.start?.toISOString(),
          endDate: customRange.end?.toISOString(),
        };
      default:
        return {};
    }
  };

  const query: InsightsQuery = {
    granularity,
    ...getDateRange(),
  };

  const { data: insights, isLoading } = useInsights(query);
  const { data: financialHealth } = useFinancialHealthScore();

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-red-500" />;
      case "down": return <TrendingDown className="w-4 h-4 text-green-500" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendBadge = (trend: "up" | "down" | "stable", percent: number) => {
    const isIncrease = trend === "up";
    return (
      <Badge 
        variant="secondary" 
        className={cn(
          "gap-1",
          isIncrease ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
          trend === "down" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
          "bg-muted text-muted-foreground"
        )}
      >
        {isIncrease ? <ArrowUpRight className="w-3 h-3" /> : 
         trend === "down" ? <ArrowDownRight className="w-3 h-3" /> : 
         <Minus className="w-3 h-3" />}
        {Math.abs(percent).toFixed(1)}%
      </Badge>
    );
  };

  // Prepare chart data
  const spendingOverTimeData = insights?.periodBuckets.map(bucket => ({
    name: bucket.label,
    total: bucket.total / 100,
  })) || [];

  const categoryComparisonData = insights?.categoryTrends.slice(0, 8).map(cat => ({
    name: cat.category,
    current: cat.currentTotal / 100,
    previous: cat.previousTotal / 100,
  })) || [];

  // Multi-category trend data for line chart
  const multiCategoryData = insights?.periodBuckets.map(bucket => {
    const dataPoint: Record<string, any> = { name: bucket.label };
    insights.categoryTrends.slice(0, 5).forEach(cat => {
      const periodEntry = cat.periodData.find(p => p.period === bucket.label);
      dataPoint[cat.category] = (periodEntry?.total || 0) / 100;
    });
    return dataPoint;
  }) || [];

  // Pie chart data for category distribution
  const pieChartData = insights?.categoryTrends.map(cat => ({
    name: cat.category,
    value: cat.currentTotal / 100,
  })) || [];

  // Export functionality
  const handleExportData = () => {
    if (!insights) return;
    
    const csvData = [
      ["Period", "Total Spending"],
      ...insights.periodBuckets.map(b => [b.label, (b.total / 100).toFixed(2)]),
      [],
      ["Category", "Current Total", "Previous Total", "Change %"],
      ...insights.categoryTrends.map(c => [
        c.category,
        (c.currentTotal / 100).toFixed(2),
        (c.previousTotal / 100).toFixed(2),
        c.changePercent.toFixed(1) + "%"
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `expense-insights-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout>
      <div className="flex flex-col gap-4 md:gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Insights</h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Analyze your spending patterns and trends over time.
            </p>
          </div>
          {insights && (
            <Button onClick={handleExportData} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          )}
        </div>

        <Card className="shadow-sm border-border/50">
          <CardContent className="p-3 md:p-4">
            <div className="flex flex-col sm:flex-row flex-wrap items-start sm:items-center gap-3 md:gap-4">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-muted-foreground shrink-0">Period:</span>
                <Select value={timePreset} onValueChange={(v) => setTimePreset(v as TimePreset)}>
                  <SelectTrigger className="w-full sm:w-40" data-testid="select-time-preset">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="this_month">This Month</SelectItem>
                    <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                    <SelectItem value="last_quarter">Last Quarter</SelectItem>
                    <SelectItem value="this_year">This Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="text-sm text-muted-foreground shrink-0">View by:</span>
                <Select value={granularity} onValueChange={(v) => setGranularity(v as Granularity)}>
                  <SelectTrigger className="w-full sm:w-32" data-testid="select-granularity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Monthly</SelectItem>
                    <SelectItem value="quarter">Quarterly</SelectItem>
                    <SelectItem value="year">Yearly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {timePreset === "custom" && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-36 justify-start" data-testid="button-start-date">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customRange.start ? format(customRange.start, "MMM dd, yyyy") : "Start"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customRange.start}
                        onSelect={(date) => setCustomRange(prev => ({ ...prev, start: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                  <span className="text-muted-foreground hidden sm:inline">to</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full sm:w-36 justify-start" data-testid="button-end-date">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {customRange.end ? format(customRange.end, "MMM dd, yyyy") : "End"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={customRange.end}
                        onSelect={(date) => setCustomRange(prev => ({ ...prev, end: date }))}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-28 md:h-32 rounded-xl" />
              ))}
            </div>
            <Skeleton className="h-[300px] md:h-[400px] rounded-xl" />
          </div>
        ) : insights ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
              <Card className="shadow-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2 p-3 md:p-6 md:pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                    Total Spending
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  <div className="text-lg md:text-2xl font-bold font-display">
                    {formatAmount(insights.totalCurrentPeriod)}
                  </div>
                  <div className="flex flex-wrap items-center gap-1 md:gap-2 mt-1">
                    {getTrendBadge(insights.overallTrend, insights.overallChangePercent)}
                    <span className="text-[10px] md:text-xs text-muted-foreground hidden sm:inline">vs previous</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2 p-3 md:p-6 md:pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                    Monthly Average
                  </CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  <div className="text-lg md:text-2xl font-bold font-display">
                    {formatAmount(insights.financialPattern.avgMonthlySpend)}
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                    Per month
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2 p-3 md:p-6 md:pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                    Top Category
                  </CardTitle>
                  <PieChartIcon className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  <div className="text-lg md:text-2xl font-bold font-display truncate">
                    {insights.financialPattern.highestSpendCategory || "N/A"}
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                    {formatAmount(insights.financialPattern.highestSpendAmount)}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/50">
                <CardHeader className="flex flex-row items-center justify-between gap-1 space-y-0 pb-2 p-3 md:p-6 md:pb-2">
                  <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground">
                    Spending Trend
                  </CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground hidden sm:block" />
                </CardHeader>
                <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
                  <div className="flex items-center gap-2">
                    {getTrendIcon(insights.overallTrend)}
                    <span className="text-lg md:text-2xl font-bold font-display capitalize">
                      {insights.financialPattern.spendingTrend}
                    </span>
                  </div>
                  <p className="text-[10px] md:text-xs text-muted-foreground mt-1">
                    {insights.financialPattern.spendingTrendPercent > 0 ? "+" : ""}
                    {insights.financialPattern.spendingTrendPercent}%
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
              <Card className="shadow-sm border-border/50">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg">Spending Over Time</CardTitle>
                </CardHeader>
                <CardContent className="p-2 md:p-6 pt-0">
                  <div className="h-[250px] md:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={spendingOverTimeData}>
                        <defs>
                          <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${currency.symbol}${v}`} width={50} />
                        <Tooltip formatter={(value: number) => [`${currency.symbol}${value.toFixed(2)}`, "Total"]} />
                        <Area type="monotone" dataKey="total" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSpending)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/50">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg">Category Comparison</CardTitle>
                </CardHeader>
                <CardContent className="p-2 md:p-6 pt-0">
                  <div className="h-[250px] md:h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryComparisonData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e5e7eb" />
                        <XAxis type="number" stroke="#888888" fontSize={10} tickFormatter={(v) => `${currency.symbol}${v}`} />
                        <YAxis dataKey="name" type="category" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} width={70} />
                        <Tooltip formatter={(value: number) => `${currency.symbol}${value.toFixed(2)}`} />
                        <Legend wrapperStyle={{ fontSize: '12px' }} />
                        <Bar dataKey="current" name="Current" fill="#10b981" radius={[0, 4, 4, 0]} />
                        <Bar dataKey="previous" name="Previous" fill="#94a3b8" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Pie Chart for Category Distribution */}
            {pieChartData.length > 0 && (
              <Card className="shadow-sm border-border/50">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg">Category Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-2 md:p-6 pt-0">
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${currency.symbol}${value.toFixed(2)}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Financial Health Score */}
            {financialHealth && (
              <Card className="shadow-sm border-border/50">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    Financial Health Score
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Overall Score</span>
                        <span className={cn(
                          "text-2xl font-bold",
                          financialHealth.overall >= 80 ? "text-green-600" :
                          financialHealth.overall >= 60 ? "text-yellow-600" :
                          "text-red-600"
                        )}>
                          {financialHealth.overall}/100
                        </span>
                      </div>
                      <Progress value={financialHealth.overall} className="h-3" />
                      <div className="mt-2 text-xs text-muted-foreground">
                        Grade: <span className="font-semibold">{financialHealth.grade}</span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Budget Adherence</div>
                        <Progress value={financialHealth.budgetAdherence} className="h-2" />
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Savings Rate</div>
                        <Progress value={financialHealth.savingsRate} className="h-2" />
                      </div>
                    </div>
                    {financialHealth.insights.length > 0 && (
                      <div className="pt-2">
                        <div className="text-xs font-medium mb-2">Key Insights:</div>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {financialHealth.insights.slice(0, 3).map((insight, idx) => (
                            <li key={idx}>• {insight}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Spending Velocity */}
            {insights.spendingVelocity && (
              <Card className="shadow-sm border-border/50">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Spending Velocity
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Daily Average</div>
                      <div className="text-lg font-bold">{formatAmount(insights.spendingVelocity.dailyAverage)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Weekly Average</div>
                      <div className="text-lg font-bold">{formatAmount(insights.spendingVelocity.weeklyAverage)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Current Daily Rate</div>
                      <div className="text-lg font-bold">{formatAmount(insights.spendingVelocity.currentDailyRate)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Projected Total</div>
                      <div className={cn(
                        "text-lg font-bold",
                        insights.spendingVelocity.projectedPeriodTotal > insights.totalCurrentPeriod * 1.1
                          ? "text-red-600"
                          : "text-foreground"
                      )}>
                        {formatAmount(insights.spendingVelocity.projectedPeriodTotal)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                    {insights.spendingVelocity.daysElapsed} days elapsed, {insights.spendingVelocity.daysRemaining} days remaining
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Budget Comparisons */}
            {insights.budgetComparisons && insights.budgetComparisons.length > 0 && (
              <Card className="shadow-sm border-border/50">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg">Budget vs Actual</CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="space-y-4">
                    {insights.budgetComparisons.map((budget, idx) => (
                      <div key={budget.category} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{budget.category}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-mono">
                              {formatAmount(budget.spent)} / {formatAmount(budget.budgetAmount)}
                            </span>
                            {budget.isOverBudget && (
                              <Badge variant="destructive" className="text-xs">Over Budget</Badge>
                            )}
                          </div>
                        </div>
                        <Progress 
                          value={Math.min(budget.percentUsed, 100)} 
                          className={cn(
                            "h-2",
                            budget.isOverBudget ? "bg-red-500" : 
                            budget.percentUsed >= 80 ? "bg-yellow-500" : 
                            "bg-green-500"
                          )}
                        />
                        <div className="text-xs text-muted-foreground">
                          {budget.percentUsed}% used • {budget.isOverBudget ? "Exceeded by " : "Remaining: "}
                          {formatAmount(Math.abs(budget.remaining))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <Card className="shadow-sm border-border/50">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="space-y-3">
                    {insights.recommendations.map((rec, idx) => (
                      <Alert 
                        key={idx}
                        className={cn(
                          rec.priority === "high" ? "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800" :
                          rec.priority === "medium" ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800" :
                          "border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800"
                        )}
                      >
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle className="text-sm font-semibold">{rec.title}</AlertTitle>
                        <AlertDescription className="text-sm mt-1">
                          {rec.message}
                          {rec.action && (
                            <Button 
                              variant="link" 
                              className="h-auto p-0 ml-2 text-xs"
                              onClick={() => window.location.href = rec.action!}
                            >
                              View →
                            </Button>
                          )}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Anomalies */}
            {insights.anomalies && insights.anomalies.length > 0 && (
              <Card className="shadow-sm border-border/50">
                <CardHeader className="p-4 md:p-6">
                  <CardTitle className="text-base md:text-lg flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    Unusual Spending Detected
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0">
                  <div className="space-y-3">
                    {insights.anomalies.slice(0, 5).map((anomaly, idx) => (
                      <div key={idx} className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm">{anomaly.category}</div>
                            <div className="text-xs text-muted-foreground mt-1">{anomaly.description}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {format(new Date(anomaly.date), "MMM dd, yyyy")}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-sm">{formatAmount(anomaly.amount)}</div>
                            <div className="text-xs text-red-600">
                              {anomaly.deviationPercent > 0 ? "+" : ""}
                              {anomaly.deviationPercent.toFixed(0)}% above average
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

              {insights.categoryTrends.length > 1 && (
                <Card className="shadow-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Category Trends Over Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[350px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={multiCategoryData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                          <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${currency.symbol}${v}`} />
                          <Tooltip formatter={(value: number) => `${currency.symbol}${value.toFixed(2)}`} />
                          <Legend />
                          {insights.categoryTrends.slice(0, 5).map((cat, idx) => (
                            <Line
                              key={cat.category}
                              type="monotone"
                              dataKey={cat.category}
                              stroke={COLORS[idx % COLORS.length]}
                              strokeWidth={2}
                              dot={{ r: 4 }}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="shadow-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Category Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {insights.categoryTrends.map((cat, idx) => (
                        <div key={cat.category} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: COLORS[idx % COLORS.length] }} 
                            />
                            <span className="font-medium">{cat.category}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm">
                              {formatAmount(cat.currentTotal)}
                            </span>
                            {getTrendBadge(cat.trend, cat.changePercent)}
                          </div>
                        </div>
                      ))}
                      {insights.categoryTrends.length === 0 && (
                        <p className="text-center text-muted-foreground py-8">
                          No expense data for this period
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-sm border-border/50">
                  <CardHeader>
                    <CardTitle>Financial Patterns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Activity className="w-4 h-4 text-primary" />
                          Spending Behavior
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          Your spending is{" "}
                          <span className={cn(
                            "font-medium",
                            insights.financialPattern.spendingTrend === "increasing" ? "text-red-600" :
                            insights.financialPattern.spendingTrend === "decreasing" ? "text-green-600" :
                            "text-foreground"
                          )}>
                            {insights.financialPattern.spendingTrend}
                          </span>
                          {" "}by {Math.abs(insights.financialPattern.spendingTrendPercent)}% compared to the previous period.
                        </p>
                      </div>

                      {insights.financialPattern.topGrowingCategory && (
                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
                          <h4 className="font-medium mb-2 flex items-center gap-2 text-red-700 dark:text-red-400">
                            <TrendingUp className="w-4 h-4" />
                            Fastest Growing
                          </h4>
                          <p className="text-sm text-red-600 dark:text-red-300">
                            <span className="font-medium">{insights.financialPattern.topGrowingCategory}</span>
                            {" "}increased by {insights.financialPattern.topGrowingPercent.toFixed(1)}%
                          </p>
                        </div>
                      )}

                      {insights.financialPattern.topShrinkingCategory && (
                        <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
                          <h4 className="font-medium mb-2 flex items-center gap-2 text-green-700 dark:text-green-400">
                            <TrendingDown className="w-4 h-4" />
                            Most Reduced
                          </h4>
                          <p className="text-sm text-green-600 dark:text-green-300">
                            <span className="font-medium">{insights.financialPattern.topShrinkingCategory}</span>
                            {" "}decreased by {Math.abs(insights.financialPattern.topShrinkingPercent).toFixed(1)}%
                          </p>
                        </div>
                      )}

                      <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Target className="w-4 h-4 text-primary" />
                          Summary
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          You spend most on <span className="font-medium text-foreground">{insights.financialPattern.highestSpendCategory}</span>
                          {insights.financialPattern.lowestSpendCategory && insights.financialPattern.lowestSpendCategory !== "N/A" && (
                            <> and least on <span className="font-medium text-foreground">{insights.financialPattern.lowestSpendCategory}</span></>
                          )}.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No insights available. Start adding expenses to see your spending patterns!</p>
            </Card>
          )}
      </div>
    </Layout>
  );
}
