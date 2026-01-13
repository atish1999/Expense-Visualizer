import { useQuery } from "@tanstack/react-query";
import type { FinancialHealthScore } from "@shared/schema";

export function useFinancialHealthScore() {
  return useQuery<FinancialHealthScore>({
    queryKey: ["/api/financial-health"],
  });
}
