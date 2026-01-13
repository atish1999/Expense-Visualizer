import { useState } from "react";
import { Layout } from "@/components/Layout";
import { StatsCards } from "@/components/StatsCards";
import { Charts } from "@/components/Charts";
import { ExpenseForm } from "@/components/ExpenseForm";
import { useStats, useExpenses } from "@/hooks/use-expenses";
import { useUpcomingBills } from "@/hooks/use-bill-reminders";
import { useFinancialHealthScore } from "@/hooks/use-financial-health";
import { useCurrency } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Plus, ReceiptText, Bell, BellRing, Calendar, Heart, TrendingUp, Target, CreditCard, PiggyBank } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "wouter";

export default function Dashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: recentExpenses, isLoading: expensesLoading } = useExpenses();
  const { data: upcomingBills, isLoading: billsLoading } = useUpcomingBills(14);
  const { data: healthScore, isLoading: healthLoading } = useFinancialHealthScore();
  const { formatShort } = useCurrency();

  const isLoading = statsLoading || expensesLoading;

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case "A": return "text-emerald-600 dark:text-emerald-400";
      case "B": return "text-green-600 dark:text-green-400";
      case "C": return "text-amber-600 dark:text-amber-400";
      case "D": return "text-orange-600 dark:text-orange-400";
      case "F": return "text-red-600 dark:text-red-400";
      default: return "text-muted-foreground";
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-amber-500";
    return "bg-red-500";
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = parseISO(dueDate);
    return differenceInDays(due, today);
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Here's what's happening with your finances.
          </p>
        </div>
        <Button 
          onClick={() => setIsFormOpen(true)}
          className="shadow-lg shadow-primary/25 hover:shadow-primary/30 transition-all active:scale-95 w-full sm:w-auto"
          data-testid="button-add-transaction"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Transaction
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
            <Skeleton className="lg:col-span-4 h-[300px] md:h-[400px] rounded-xl" />
            <Skeleton className="lg:col-span-3 h-[300px] md:h-[400px] rounded-xl" />
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-500">
          {stats && <StatsCards stats={stats} />}
          {stats && <Charts stats={stats} />}

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
              <div className="p-4 md:p-6 border-b border-border/50 flex items-center justify-between gap-2">
                <h3 className="font-display font-bold text-base md:text-lg">Recent Activity</h3>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/expenses" className="text-muted-foreground hover:text-primary text-sm">
                    View All <ReceiptText className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
              <div className="p-0">
                {recentExpenses && recentExpenses.length > 0 ? (
                  <ScrollArea className="h-[280px] md:h-[300px]">
                    <div className="divide-y divide-border/30">
                      {recentExpenses.slice(0, 5).map((expense) => (
                        <div key={expense.id} className="p-3 md:p-4 flex items-center justify-between hover:bg-muted/30 transition-colors gap-3">
                          <div className="flex items-center gap-3 md:gap-4 min-w-0">
                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium text-xs shrink-0">
                              {format(new Date(expense.date), "dd")}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm md:text-base truncate">{expense.description}</p>
                              <p className="text-xs md:text-sm text-muted-foreground">{expense.category}</p>
                            </div>
                          </div>
                          <span className="font-mono font-medium text-sm md:text-base shrink-0">
                            -{formatShort(expense.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="p-8 md:p-12 text-center text-muted-foreground text-sm md:text-base">
                    No transactions yet. Start by adding one!
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
              <div className="p-4 md:p-6 border-b border-border/50 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-bold text-base md:text-lg">Upcoming Bills</h3>
                  {upcomingBills && upcomingBills.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {upcomingBills.length}
                    </Badge>
                  )}
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/bills" className="text-muted-foreground hover:text-primary text-sm">
                    Manage <Bell className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
              <div className="p-0">
                {billsLoading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 rounded-lg" />
                    ))}
                  </div>
                ) : upcomingBills && upcomingBills.length > 0 ? (
                  <ScrollArea className="h-[280px] md:h-[300px]">
                    <div className="divide-y divide-border/30">
                      {upcomingBills.slice(0, 5).map((bill) => {
                        const daysUntil = getDaysUntilDue(bill.dueDate);
                        const isUrgent = daysUntil <= 3;
                        return (
                          <div
                            key={bill.id}
                            className="p-3 md:p-4 flex items-center justify-between hover:bg-muted/30 transition-colors gap-3"
                            data-testid={`dashboard-bill-${bill.id}`}
                          >
                            <div className="flex items-center gap-3 md:gap-4 min-w-0">
                              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                isUrgent
                                  ? "bg-amber-100 dark:bg-amber-900/30"
                                  : "bg-muted"
                              }`}>
                                {isUrgent ? (
                                  <BellRing className="w-4 h-4 md:w-5 md:h-5 text-amber-600 dark:text-amber-400" />
                                ) : (
                                  <Calendar className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-medium text-sm md:text-base truncate">{bill.name}</p>
                                <p className="text-xs md:text-sm text-muted-foreground">
                                  {daysUntil === 0
                                    ? "Due today"
                                    : daysUntil === 1
                                    ? "Due tomorrow"
                                    : `Due in ${daysUntil} days`}
                                </p>
                              </div>
                            </div>
                            <span className="font-mono font-medium text-sm md:text-base shrink-0">
                              {formatShort(bill.amount)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="p-8 md:p-12 text-center text-muted-foreground text-sm md:text-base">
                    <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No upcoming bills</p>
                    <Link href="/bills">
                      <Button variant="ghost" size="sm" className="mt-2 text-primary">
                        Add a bill reminder
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden" data-testid="financial-health-card">
            <div className="p-4 md:p-6 border-b border-border/50 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <h3 className="font-display font-bold text-base md:text-lg">Financial Health</h3>
              </div>
            </div>
            <div className="p-4 md:p-6">
              {healthLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-20 w-20 rounded-full mx-auto" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : healthScore ? (
                <div className="space-y-6">
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full border-8 border-muted flex items-center justify-center">
                        <span className={`text-3xl font-bold ${getGradeColor(healthScore.grade)}`} data-testid="text-health-grade">{healthScore.grade}</span>
                      </div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-background px-2 py-0.5 rounded-full border border-border">
                        <span className="text-sm font-medium" data-testid="text-health-score">{healthScore.overall}/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2" data-testid="metric-budget-adherence">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Target className="w-4 h-4" />
                        <span>Budget</span>
                      </div>
                      <Progress value={healthScore.budgetAdherence} className="h-2" />
                      <span className="text-xs text-muted-foreground" data-testid="text-budget-adherence">{healthScore.budgetAdherence}%</span>
                    </div>
                    <div className="space-y-2" data-testid="metric-savings-rate">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <PiggyBank className="w-4 h-4" />
                        <span>Savings</span>
                      </div>
                      <Progress value={healthScore.savingsRate} className="h-2" />
                      <span className="text-xs text-muted-foreground" data-testid="text-savings-rate">{healthScore.savingsRate}%</span>
                    </div>
                    <div className="space-y-2" data-testid="metric-spending-consistency">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="w-4 h-4" />
                        <span>Consistency</span>
                      </div>
                      <Progress value={healthScore.spendingConsistency} className="h-2" />
                      <span className="text-xs text-muted-foreground" data-testid="text-spending-consistency">{healthScore.spendingConsistency}%</span>
                    </div>
                    <div className="space-y-2" data-testid="metric-bill-payment">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CreditCard className="w-4 h-4" />
                        <span>Bills</span>
                      </div>
                      <Progress value={healthScore.billPaymentScore} className="h-2" />
                      <span className="text-xs text-muted-foreground" data-testid="text-bill-payment">{healthScore.billPaymentScore}%</span>
                    </div>
                  </div>

                  {healthScore.insights.length > 0 && (
                    <div className="pt-4 border-t border-border/50 space-y-2" data-testid="health-insights">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Insights</p>
                      {healthScore.insights.slice(0, 2).map((insight, index) => (
                        <p key={index} className="text-sm text-foreground" data-testid={`text-insight-${index}`}>{insight}</p>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Add expenses and budgets to see your financial health score</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl shadow-primary/30 hover:shadow-primary/40 transition-all active:scale-95 z-50 md:hidden"
        size="icon"
        data-testid="button-quick-add"
      >
        <Plus className="w-6 h-6" />
      </Button>

      <ExpenseForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </Layout>
  );
}
