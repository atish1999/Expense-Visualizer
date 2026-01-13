import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { SavingsGoal, InsertSavingsGoal, SavingsChallenge, InsertSavingsChallenge } from "@shared/schema";

export function useSavingsGoals() {
  return useQuery<SavingsGoal[]>({
    queryKey: ["/api/savings-goals"],
  });
}

export function useCreateSavingsGoal() {
  return useMutation({
    mutationFn: async (data: InsertSavingsGoal) => {
      const res = await apiRequest("POST", "/api/savings-goals", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
    },
  });
}

export function useUpdateSavingsGoal() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertSavingsGoal> & { currentAmount?: number; isCompleted?: boolean } }) => {
      const res = await apiRequest("PUT", `/api/savings-goals/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
    },
  });
}

export function useDeleteSavingsGoal() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/savings-goals/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings-goals"] });
    },
  });
}

export function useSavingsChallenges() {
  return useQuery<SavingsChallenge[]>({
    queryKey: ["/api/savings-challenges"],
  });
}

export function useCreateSavingsChallenge() {
  return useMutation({
    mutationFn: async (data: InsertSavingsChallenge) => {
      const res = await apiRequest("POST", "/api/savings-challenges", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings-challenges"] });
    },
  });
}

export function useUpdateSavingsChallenge() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertSavingsChallenge> & { currentAmount?: number; progress?: string; isCompleted?: boolean } }) => {
      const res = await apiRequest("PUT", `/api/savings-challenges/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings-challenges"] });
    },
  });
}

export function useDeleteSavingsChallenge() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/savings-challenges/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/savings-challenges"] });
    },
  });
}
