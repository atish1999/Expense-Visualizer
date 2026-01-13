import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Edit2, Trash2, Wallet, AlertTriangle } from "lucide-react";
import { useBudgetsWithSpending, useCreateBudget, useUpdateBudget, useDeleteBudget } from "@/hooks/use-budgets";
import { useCurrency } from "@/hooks/use-currency";
import type { BudgetWithSpending } from "@shared/schema";

const CATEGORIES = [
  "Food",
  "Transport",
  "Entertainment",
  "Shopping",
  "Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Subscription",
  "Other",
];

const PERIODS = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const formSchema = z.object({
  category: z.string().min(1, "Category is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  period: z.string().min(1, "Period is required"),
  alertThreshold: z.number().min(0).max(100).default(80),
});

type FormData = z.infer<typeof formSchema>;

export default function Budgets() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetWithSpending | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [customCategory, setCustomCategory] = useState("");

  const { data: budgets, isLoading } = useBudgetsWithSpending();
  const createMutation = useCreateBudget();
  const updateMutation = useUpdateBudget();
  const deleteMutation = useDeleteBudget();
  const { formatShort } = useCurrency();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: "",
      amount: 0,
      period: "monthly",
      alertThreshold: 80,
    },
  });

  const handleOpenForm = (budget?: BudgetWithSpending) => {
    if (budget) {
      setEditingBudget(budget);
      const isCustomCategory = !CATEGORIES.includes(budget.category);
      if (isCustomCategory) {
        setCustomCategory(budget.category);
        form.reset({
          category: "custom",
          amount: budget.amount / 100,
          period: budget.period,
          alertThreshold: budget.alertThreshold ?? 80,
        });
      } else {
        setCustomCategory("");
        form.reset({
          category: budget.category,
          amount: budget.amount / 100,
          period: budget.period,
          alertThreshold: budget.alertThreshold ?? 80,
        });
      }
    } else {
      setEditingBudget(null);
      setCustomCategory("");
      form.reset({
        category: "",
        amount: 0,
        period: "monthly",
        alertThreshold: 80,
      });
    }
    setIsFormOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    const finalCategory = data.category === "custom" ? customCategory : data.category;
    const payload = {
      category: finalCategory,
      amount: Math.round(data.amount * 100),
      period: data.period,
      alertThreshold: data.alertThreshold,
    };

    if (editingBudget) {
      await updateMutation.mutateAsync({ id: editingBudget.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setIsFormOpen(false);
    setEditingBudget(null);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  const getStatusBadge = (budget: BudgetWithSpending) => {
    if (!budget.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (budget.percentUsed >= 100) {
      return <Badge variant="destructive">Over Budget</Badge>;
    }
    if (budget.percentUsed >= (budget.alertThreshold ?? 80)) {
      return <Badge className="bg-amber-500 text-white">Near Limit</Badge>;
    }
    return <Badge variant="outline">On Track</Badge>;
  };

  const getProgressColor = (percentUsed: number, alertThreshold: number) => {
    if (percentUsed >= 100) return "bg-destructive";
    if (percentUsed >= alertThreshold) return "bg-amber-500";
    return "bg-primary";
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Budgets</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Set spending limits and track your budget progress.
          </p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          className="shadow-lg shadow-primary/25 hover:shadow-primary/30 transition-all w-full sm:w-auto"
          data-testid="button-add-budget"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Budget
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : budgets && budgets.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => {
            const progressPercent = Math.min(budget.percentUsed, 100);
            return (
              <Card key={budget.id} className="p-5" data-testid={`card-budget-${budget.id}`}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      budget.percentUsed >= (budget.alertThreshold ?? 80)
                        ? "bg-amber-100 dark:bg-amber-900/30"
                        : "bg-muted"
                    }`}>
                      {budget.percentUsed >= (budget.alertThreshold ?? 80) ? (
                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <Wallet className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium" data-testid={`text-budget-category-${budget.id}`}>{budget.category}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{budget.period}</p>
                    </div>
                  </div>
                  {getStatusBadge(budget)}
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-muted-foreground">Spent</span>
                    <span className="text-sm font-medium">
                      <span data-testid={`text-budget-spent-${budget.id}`}>{formatShort(budget.spent)}</span>
                      {" / "}
                      <span data-testid={`text-budget-amount-${budget.id}`}>{formatShort(budget.amount)}</span>
                    </span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`absolute left-0 top-0 h-full rounded-full transition-all ${getProgressColor(budget.percentUsed, budget.alertThreshold ?? 80)}`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs text-muted-foreground">
                      {budget.percentUsed.toFixed(0)}% used
                    </span>
                    <span className="text-xs text-muted-foreground" data-testid={`text-budget-remaining-${budget.id}`}>
                      {budget.remaining >= 0 ? `${formatShort(budget.remaining)} remaining` : `${formatShort(Math.abs(budget.remaining))} over`}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Alert at</span>
                    <span className="text-sm">{budget.alertThreshold ?? 80}%</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenForm(budget)}
                    data-testid={`button-edit-budget-${budget.id}`}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => setDeletingId(budget.id)}
                    data-testid={`button-delete-budget-${budget.id}`}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-medium text-lg mb-2">No budgets yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first budget to start tracking your spending limits.
          </p>
          <Button onClick={() => handleOpenForm()} data-testid="button-add-first-budget">
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Budget
          </Button>
        </Card>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingBudget ? "Edit Budget" : "Create Budget"}</DialogTitle>
            <DialogDescription>
              {editingBudget
                ? "Update your budget settings."
                : "Set a spending limit for a category."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={form.watch("category")}
                  onValueChange={(value) => {
                    form.setValue("category", value);
                    if (value !== "custom") {
                      setCustomCategory("");
                    }
                  }}
                >
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
                {form.watch("category") === "custom" && (
                  <Input
                    placeholder="Enter custom category"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    data-testid="input-custom-category"
                  />
                )}
                {form.formState.errors.category && (
                  <p className="text-sm text-destructive">{form.formState.errors.category.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Budget Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register("amount", { valueAsNumber: true })}
                    data-testid="input-budget-amount"
                  />
                  {form.formState.errors.amount && (
                    <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Period</Label>
                  <Select
                    value={form.watch("period")}
                    onValueChange={(value) => form.setValue("period", value)}
                  >
                    <SelectTrigger data-testid="select-period">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      {PERIODS.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alertThreshold">Alert Threshold (%)</Label>
                <Input
                  id="alertThreshold"
                  type="number"
                  min="0"
                  max="100"
                  {...form.register("alertThreshold", { valueAsNumber: true })}
                  data-testid="input-alert-threshold"
                />
                <p className="text-xs text-muted-foreground">
                  Get notified when spending reaches this percentage of your budget.
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit-budget"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingBudget
                  ? "Update Budget"
                  : "Create Budget"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Budget</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this budget? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
