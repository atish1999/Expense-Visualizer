import { useState } from "react";
import { Layout } from "@/components/Layout";
import { StatsCards } from "@/components/StatsCards";
import { Charts } from "@/components/Charts";
import { ExpenseForm } from "@/components/ExpenseForm";
import { useStats, useExpenses } from "@/hooks/use-expenses";
import { useCurrency } from "@/hooks/use-currency";
import { Button } from "@/components/ui/button";
import { Plus, ReceiptText } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Dashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: recentExpenses, isLoading: expensesLoading } = useExpenses();
  const { formatShort } = useCurrency();

  const isLoading = statsLoading || expensesLoading;

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
        </div>
      )}

      <ExpenseForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </Layout>
  );
}
