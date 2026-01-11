import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { api, type InsightsQuery } from "@shared/routes";
import type { InsightsResponse } from "@shared/schema";

export function useInsights(query: InsightsQuery) {
  // Create a stable serialized key to prevent unnecessary re-fetches
  const stableKey = useMemo(() => {
    return JSON.stringify({
      granularity: query.granularity || 'month',
      startDate: query.startDate || null,
      endDate: query.endDate || null,
    });
  }, [query.granularity, query.startDate, query.endDate]);

  const url = useMemo(() => {
    const params = new URLSearchParams();
    if (query.granularity) params.set('granularity', query.granularity);
    if (query.startDate) params.set('startDate', query.startDate);
    if (query.endDate) params.set('endDate', query.endDate);
    const queryString = params.toString();
    return queryString ? `${api.insights.get.path}?${queryString}` : api.insights.get.path;
  }, [query.granularity, query.startDate, query.endDate]);

  return useQuery<InsightsResponse>({
    queryKey: [api.insights.get.path, stableKey],
    queryFn: async () => {
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch insights");
      return res.json();
    },
  });
}
