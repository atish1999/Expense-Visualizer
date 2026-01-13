import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { format, differenceInDays, parseISO } from "date-fns";
import { Plus, Edit2, Trash2, Bell, BellRing, Calendar, AlertCircle } from "lucide-react";
import { useBillReminders, useCreateBillReminder, useUpdateBillReminder, useDeleteBillReminder } from "@/hooks/use-bill-reminders";
import { useCurrency } from "@/hooks/use-currency";
import type { BillReminder } from "@shared/schema";

const CATEGORIES = [
  "Utilities",
  "Subscription",
  "Insurance",
  "Rent",
  "Internet",
  "Phone",
  "Streaming",
  "Loan",
  "Credit Card",
  "Other",
];

const FREQUENCIES = [
  { value: "once", label: "One-time" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.number().min(1, "Amount must be greater than 0"),
  dueDate: z.string().min(1, "Due date is required"),
  frequency: z.string().min(1, "Frequency is required"),
  category: z.string().min(1, "Category is required"),
  isActive: z.boolean().default(true),
  notifyDaysBefore: z.number().min(0).max(30).default(3),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function BillReminders() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<BillReminder | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: bills, isLoading } = useBillReminders();
  const createMutation = useCreateBillReminder();
  const updateMutation = useUpdateBillReminder();
  const deleteMutation = useDeleteBillReminder();
  const { formatShort } = useCurrency();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
      dueDate: "",
      frequency: "monthly",
      category: "Utilities",
      isActive: true,
      notifyDaysBefore: 3,
      notes: "",
    },
  });

  const handleOpenForm = (bill?: BillReminder) => {
    if (bill) {
      setEditingBill(bill);
      form.reset({
        name: bill.name,
        amount: bill.amount / 100,
        dueDate: bill.dueDate,
        frequency: bill.frequency,
        category: bill.category,
        isActive: bill.isActive,
        notifyDaysBefore: bill.notifyDaysBefore,
        notes: bill.notes || "",
      });
    } else {
      setEditingBill(null);
      form.reset({
        name: "",
        amount: 0,
        dueDate: format(new Date(), "yyyy-MM-dd"),
        frequency: "monthly",
        category: "Utilities",
        isActive: true,
        notifyDaysBefore: 3,
        notes: "",
      });
    }
    setIsFormOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      amount: Math.round(data.amount * 100),
      notes: data.notes || null,
    };

    if (editingBill) {
      await updateMutation.mutateAsync({ id: editingBill.id, data: payload });
    } else {
      await createMutation.mutateAsync(payload);
    }
    setIsFormOpen(false);
    setEditingBill(null);
  };

  const handleDelete = async () => {
    if (deletingId) {
      await deleteMutation.mutateAsync(deletingId);
      setDeletingId(null);
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = parseISO(dueDate);
    return differenceInDays(due, today);
  };

  const getStatusBadge = (bill: BillReminder) => {
    if (!bill.isActive) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    const daysUntil = getDaysUntilDue(bill.dueDate);
    if (daysUntil < 0) {
      return <Badge variant="destructive">Overdue</Badge>;
    }
    if (daysUntil <= bill.notifyDaysBefore) {
      return <Badge className="bg-amber-500 text-white">Due Soon</Badge>;
    }
    return <Badge variant="outline">Upcoming</Badge>;
  };

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Bill Reminders</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Track and manage your recurring bills and payments.
          </p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          className="shadow-lg shadow-primary/25 hover:shadow-primary/30 transition-all w-full sm:w-auto"
          data-testid="button-add-bill"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Bill
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : bills && bills.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {bills.map((bill) => {
            const daysUntil = getDaysUntilDue(bill.dueDate);
            return (
              <Card key={bill.id} className="p-5" data-testid={`card-bill-${bill.id}`}>
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      daysUntil <= (bill.notifyDaysBefore || 3) && bill.isActive
                        ? "bg-amber-100 dark:bg-amber-900/30"
                        : "bg-muted"
                    }`}>
                      {daysUntil <= (bill.notifyDaysBefore || 3) && bill.isActive ? (
                        <BellRing className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <Bell className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-medium" data-testid={`text-bill-name-${bill.id}`}>{bill.name}</h3>
                      <p className="text-sm text-muted-foreground">{bill.category}</p>
                    </div>
                  </div>
                  {getStatusBadge(bill)}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Amount</span>
                    <span className="font-mono font-medium" data-testid={`text-bill-amount-${bill.id}`}>
                      {formatShort(bill.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Due Date</span>
                    <span className="text-sm flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {format(parseISO(bill.dueDate), "MMM dd, yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Frequency</span>
                    <span className="text-sm capitalize">{bill.frequency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Notify</span>
                    <span className="text-sm">{bill.notifyDaysBefore} days before</span>
                  </div>
                </div>

                {bill.notes && (
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2">{bill.notes}</p>
                )}

                <div className="flex gap-2 pt-3 border-t border-border/50">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenForm(bill)}
                    data-testid={`button-edit-bill-${bill.id}`}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive"
                    onClick={() => setDeletingId(bill.id)}
                    data-testid={`button-delete-bill-${bill.id}`}
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
          <Bell className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="font-medium text-lg mb-2">No bill reminders yet</h3>
          <p className="text-muted-foreground mb-4">
            Add your first bill reminder to start tracking your recurring payments.
          </p>
          <Button onClick={() => handleOpenForm()} data-testid="button-add-first-bill">
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Bill
          </Button>
        </Card>
      )}

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingBill ? "Edit Bill Reminder" : "Add Bill Reminder"}</DialogTitle>
            <DialogDescription>
              {editingBill
                ? "Update the details of your bill reminder."
                : "Set up a new bill reminder to track your payments."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Bill Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Netflix, Electricity"
                  {...form.register("name")}
                  data-testid="input-bill-name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
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
                    data-testid="input-bill-amount"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    {...form.register("dueDate")}
                    data-testid="input-bill-due-date"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="notifyDaysBefore">Notify Days Before</Label>
                <Input
                  id="notifyDaysBefore"
                  type="number"
                  min="0"
                  max="30"
                  {...form.register("notifyDaysBefore", { valueAsNumber: true })}
                  data-testid="input-notify-days"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes..."
                  {...form.register("notes")}
                  data-testid="input-bill-notes"
                />
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
                data-testid="button-submit-bill"
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Saving..."
                  : editingBill
                  ? "Update Bill"
                  : "Add Bill"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill Reminder</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bill reminder? This action cannot be undone.
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
