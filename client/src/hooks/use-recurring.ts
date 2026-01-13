import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { RecurringTransaction, InsertRecurringTransaction } from "@shared/schema";

export function useRecurringTransactions() {
  return useQuery<RecurringTransaction[]>({
    queryKey: ["/api/recurring-transactions"],
  });
}

export function useCreateRecurringTransaction() {
  return useMutation({
    mutationFn: async (data: InsertRecurringTransaction) => {
      const res = await apiRequest("POST", "/api/recurring-transactions", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-transactions"] });
    },
  });
}

export function useUpdateRecurringTransaction() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertRecurringTransaction> }) => {
      const res = await apiRequest("PUT", `/api/recurring-transactions/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-transactions"] });
    },
  });
}

export function useDeleteRecurringTransaction() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/recurring-transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recurring-transactions"] });
    },
  });
}
