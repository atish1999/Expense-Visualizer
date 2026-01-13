import { useState } from "react";
import { Layout } from "@/components/Layout";
import { StatsCards } from "@/components/StatsCards";
import { Charts } from "@/components/Charts";
import { ExpenseForm } from "@/components/ExpenseForm";
import { useStats, useExpenses } from "@/hooks/use-expenses";
import { useUpcomingBills } from "@/hooks/use-bill-reminders";
import { useCurrency } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ReceiptText, Bell, BellRing, Calendar } from "lucide-react";
import { format, parseISO, differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "wouter";

export default function Dashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: recentExpenses, isLoading: expensesLoading } = useExpenses();
  const { data: upcomingBills, isLoading: billsLoading } = useUpcomingBills(14);
  const { formatShort } = useCurrency();

  const isLoading = statsLoading || expensesLoading;

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
        </div>
      )}

      <ExpenseForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </Layout>
  );
}
