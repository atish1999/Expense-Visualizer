import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { CustomCategory, InsertCustomCategory, CategoryRule, InsertCategoryRule } from "@shared/schema";

export function useCustomCategories() {
  return useQuery<CustomCategory[]>({
    queryKey: ["/api/custom-categories"],
  });
}

export function useCreateCustomCategory() {
  return useMutation({
    mutationFn: async (data: InsertCustomCategory) => {
      const res = await apiRequest("POST", "/api/custom-categories", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-categories"] });
    },
  });
}

export function useUpdateCustomCategory() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCustomCategory> }) => {
      const res = await apiRequest("PUT", `/api/custom-categories/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-categories"] });
    },
  });
}

export function useDeleteCustomCategory() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/custom-categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/custom-categories"] });
    },
  });
}

export function useCategoryRules() {
  return useQuery<CategoryRule[]>({
    queryKey: ["/api/category-rules"],
  });
}

export function useCreateCategoryRule() {
  return useMutation({
    mutationFn: async (data: InsertCategoryRule) => {
      const res = await apiRequest("POST", "/api/category-rules", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/category-rules"] });
    },
  });
}

export function useUpdateCategoryRule() {
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCategoryRule> }) => {
      const res = await apiRequest("PUT", `/api/category-rules/${id}`, data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/category-rules"] });
    },
  });
}

export function useDeleteCategoryRule() {
  return useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/category-rules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/category-rules"] });
    },
  });
}
