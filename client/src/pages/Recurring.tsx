import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { format, parseISO } from "date-fns";
import { Plus, Edit2, Trash2, Repeat, Calendar, CalendarCheck } from "lucide-react";
import {
  useRecurringTransactions,
  useCreateRecurringTransaction,
  useUpdateRecurringTransaction,
  useDeleteRecurringTransaction,
} from "@/hooks/use-recurring";
import { useCurrency } from "@/hooks/use-currency";
import type { RecurringTransaction } from "@shared/schema";

const CATEGORIES = [
  "Food",
  "Transport",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Health",
  "Education",
  "Subscription",
  "Insurance",
  "Rent",
  "Other",
];

const FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const formSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  category: z.string().min(1, "Category is required"),
  frequency: z.string().min(1, "Frequency is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof formSchema>;

export default function Recurring() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransaction | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: transactions, isLoading } = useRecurringTransactions();
  const createMutation = useCreateRecurringTransaction();
  const updateMutation = useUpdateRecurringTransaction();
  const deleteMutation = useDeleteRecurringTransaction();
  const { formatShort } = useCurrency();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: 0,
      category: "Subscription",
      frequency: "monthly",
      startDate: "",
      endDate: "",
      isActive: true,
    },
  });

  const handleOpenForm = (transaction?: RecurringTransaction) => {
    if (transaction) {
      setEditingTransaction(transaction);
      form.reset({
        description: transaction.description,
        amount: transaction.amount / 100,
        category: transaction.category,
        frequency: transaction.frequency,
        startDate: transaction.startDate,
        endDate: transaction.endDate || "",
        isActive: transaction.isActive,
      });
    } else {
      setEditingTransaction(null);
      form.reset({
        description: "",
        amount: 0,
        category: "Subscription",
        frequency: "monthly",
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: "",
        isActive: true,
      });
    }
    setIsFormOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      amount: Math.round(data.amount * 100),
      endDate: data.endDate || undefined,
    };

    if (editingTransaction) {
      await updateMutation.mutateAsync({ id: editingTransaction.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setIsFormOpen(false);
    setEditingTransaction(null);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  const getStatusBadge = (transaction: RecurringTransaction) => {
    if (!transaction.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    if (transaction.endDate && parseISO(transaction.endDate) < new Date()) {
      return <Badge variant="outline">Ended</Badge>;
    }
    return <Badge className="bg-emerald-500 text-white">Active</Badge>;
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">
            Recurring Transactions
          </h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Manage your recurring expenses that automatically generate transactions.
          </p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          className="shadow-lg shadow-primary/25 hover:shadow-primary/30 transition-all w-full sm:w-auto"
          data-testid="button-add-recurring"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Recurring
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : transactions && transactions.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {transactions.map((transaction) => (
            <Card key={transaction.id} className="p-5" data-testid={`card-recurring-${transaction.id}`}>
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      transaction.isActive ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-muted"
                    }`}
                  >
                    <Repeat
                      className={`w-5 h-5 ${
                        transaction.isActive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-medium" data-testid={`text-recurring-description-${transaction.id}`}>
                      {transaction.description}
                    </h3>
                    <p className="text-sm text-muted-foreground">{transaction.category}</p>
                  </div>
                </div>
                {getStatusBadge(transaction)}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Amount</span>
                  <span className="font-mono font-medium" data-testid={`text-recurring-amount-${transaction.id}`}>
                    {formatShort(transaction.amount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Frequency</span>
                  <span className="text-sm capitalize">{transaction.frequency}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Start Date</span>
                  <span className="text-sm flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(parseISO(transaction.startDate), "MMM dd, yyyy")}
                  </span>
                </div>
                {transaction.endDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">End Date</span>
                    <span className="text-sm flex items-center gap-1">
                      <CalendarCheck className="w-3 h-3" />
                      {format(parseISO(transaction.endDate), "MMM dd, yyyy")}
                    </span>
                  </div>
                )}
                {transaction.lastGenerated && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Last Generated</span>
                    <span className="text-sm">
                      {format(parseISO(transaction.lastGenerated), "MMM dd, yyyy")}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-3 border-t border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleOpenForm(transaction)}
                  data-testid={`button-edit-recurring-${transaction.id}`}
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-destructive hover:text-destructive"
                  onClick={() => setDeletingId(transaction.id)}
                  data-testid={`button-delete-recurring-${transaction.id}`}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Repeat className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-medium text-lg mb-2">No recurring transactions yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first recurring transaction to automate your expense tracking.
          </p>
          <Button onClick={() => handleOpenForm()} data-testid="button-add-first-recurring">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Recurring Transaction
          </Button>
        </Card>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTransaction ? "Edit Recurring Transaction" : "Add Recurring Transaction"}
            </DialogTitle>
            <DialogDescription>
              {editingTransaction
                ? "Update the details of your recurring transaction."
                : "Set up a new recurring transaction to automatically track expenses."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="e.g., Netflix Subscription, Gym Membership"
                  {...form.register("description")}
                  data-testid="input-recurring-description"
                />
                {form.formState.errors.description && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.description.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    {...form.register("amount", { valueAsNumber: true })}
                    data-testid="input-recurring-amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={form.watch("category")}
                    onValueChange={(value) => form.setValue("category", value)}
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
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select
                  value={form.watch("frequency")}
                  onValueChange={(value) => form.setValue("frequency", value)}
                >
                  <SelectTrigger data-testid="select-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((freq) => (
                      <SelectItem key={freq.value} value={freq.value}>
                        {freq.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...form.register("startDate")}
                    data-testid="input-start-date"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date (optional)</Label>
                  <Input
                    id="endDate"
                    type="date"
                    {...form.register("endDate")}
                    data-testid="input-end-date"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) => form.setValue("isActive", checked)}
                  data-testid="switch-is-active"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                data-testid="button-submit-recurring"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingTransaction
                  ? "Update"
                  : "Add Recurring"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this recurring transaction? This action cannot be
              undone.
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
