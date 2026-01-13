import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { BudgetWithSpending, InsertBudget } from "@shared/schema";

export function useBudgetsWithSpending() {
  return useQuery<BudgetWithSpending[]>({
    queryKey: ["/api/budgets/with-spending"],
  });
}

export function useCreateBudget() {
  return useMutation({
    mutationFn: async (data: InsertBudget) => {
      const res = await apiRequest("POST", "/api/budgets", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets/with-spending"] });
    },
  });
}

export function useUpdateBudget() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertBudget> }) => {
      const res = await apiRequest("PUT", `/api/budgets/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets/with-spending"] });
    },
  });
}

export function useDeleteBudget() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/budgets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/budgets/with-spending"] });
    },
  });
}
