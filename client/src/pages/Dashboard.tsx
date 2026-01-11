import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { StatsCards } from "@/components/StatsCards";
import { Charts } from "@/components/Charts";
import { ExpenseForm } from "@/components/ExpenseForm";
import { useStats, useExpenses } from "@/hooks/use-expenses";
import { Button } from "@/components/ui/button";
import { Plus, ReceiptText } from "lucide-react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Dashboard() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: recentExpenses, isLoading: expensesLoading } = useExpenses();

  const isLoading = statsLoading || expensesLoading;

  return (
    <div className="min-h-screen bg-muted/10">
      <Sidebar />
      
      <main className="ml-64 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Here's what's happening with your finances.
            </p>
          </div>
          <Button 
            onClick={() => setIsFormOpen(true)}
            className="shadow-lg shadow-primary/25 hover:shadow-primary/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Transaction
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
              <Skeleton className="col-span-4 h-[400px] rounded-xl" />
              <Skeleton className="col-span-3 h-[400px] rounded-xl" />
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            {stats && <StatsCards stats={stats} />}
            {stats && <Charts stats={stats} />}

            {/* Recent Transactions Preview */}
            <div className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-border/50 flex items-center justify-between">
                <h3 className="font-display font-bold text-lg">Recent Activity</h3>
                <Button variant="ghost" size="sm" asChild>
                  <a href="/expenses" className="text-muted-foreground hover:text-primary">
                    View All <ReceiptText className="w-4 h-4 ml-2" />
                  </a>
                </Button>
              </div>
              <div className="p-0">
                {recentExpenses && recentExpenses.length > 0 ? (
                  <ScrollArea className="h-[300px]">
                    <div className="divide-y divide-border/30">
                      {recentExpenses.slice(0, 5).map((expense) => (
                        <div key={expense.id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground font-medium text-xs">
                              {format(new Date(expense.date), "dd")}
                            </div>
                            <div>
                              <p className="font-medium">{expense.description}</p>
                              <p className="text-sm text-muted-foreground">{expense.category}</p>
                            </div>
                          </div>
                          <span className="font-mono font-medium">
                            -${(expense.amount / 100).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="p-12 text-center text-muted-foreground">
                    No transactions yet. Start by adding one!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <ExpenseForm open={isFormOpen} onOpenChange={setIsFormOpen} />
    </div>
  );
}
