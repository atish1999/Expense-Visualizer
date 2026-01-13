import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { BillReminder, InsertBillReminder } from "@shared/schema";

export function useBillReminders() {
  return useQuery<BillReminder[]>({
    queryKey: ["/api/bill-reminders"],
  });
}

export function useUpcomingBills(daysAhead: number = 7) {
  return useQuery<BillReminder[]>({
    queryKey: [`/api/bill-reminders/upcoming?days=${daysAhead}`],
  });
}

export function useCreateBillReminder() {
  return useMutation({
    mutationFn: async (data: InsertBillReminder) => {
      const res = await apiRequest("POST", "/api/bill-reminders", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bill-reminders"] });
    },
  });
}

export function useUpdateBillReminder() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertBillReminder> }) => {
      const res = await apiRequest("PUT", `/api/bill-reminders/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bill-reminders"] });
    },
  });
}

export function useDeleteBillReminder() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/bill-reminders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bill-reminders"] });
    },
  });
}
