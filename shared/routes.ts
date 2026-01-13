import { z } from 'zod';
import { 
  insertExpenseSchema, 
  insertBillReminderSchema, 
  insertBudgetSchema,
  insertRecurringTransactionSchema,
  insertSavingsGoalSchema,
  insertSavingsChallengeSchema,
  insertCustomCategorySchema,
  insertCategoryRuleSchema,
  expenses, 
  billReminders,
  budgets,
  recurringTransactions,
  savingsGoals,
  savingsChallenges,
  customCategories,
  categoryRules,
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const insightsQuerySchema = z.object({
  granularity: z.enum(['month', 'quarter', 'year']).default('month'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type InsightsQuery = z.infer<typeof insightsQuerySchema>;

export const api = {
  expenses: {
    list: {
      method: 'GET' as const,
      path: '/api/expenses',
      responses: {
        200: z.array(z.custom<typeof expenses.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/expenses/:id',
      responses: {
        200: z.custom<typeof expenses.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/expenses',
      input: insertExpenseSchema,
      responses: {
        201: z.custom<typeof expenses.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/expenses/:id',
      input: insertExpenseSchema.partial(),
      responses: {
        200: z.custom<typeof expenses.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/expenses/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  stats: {
    get: {
      method: 'GET' as const,
      path: '/api/stats',
      responses: {
        200: z.object({
          total: z.number(),
          byCategory: z.array(z.object({
            category: z.string(),
            total: z.number(),
          })),
          monthly: z.array(z.object({
            month: z.string(),
            total: z.number(),
          })),
        }),
      },
    },
  },
  insights: {
    get: {
      method: 'GET' as const,
      path: '/api/insights',
      query: insightsQuerySchema,
      responses: {
        200: z.custom<import('./schema').InsightsResponse>(),
      },
    },
  },
  billReminders: {
    list: {
      method: 'GET' as const,
      path: '/api/bill-reminders',
      responses: {
        200: z.array(z.custom<typeof billReminders.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/bill-reminders/:id',
      responses: {
        200: z.custom<typeof billReminders.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/bill-reminders',
      input: insertBillReminderSchema,
      responses: {
        201: z.custom<typeof billReminders.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/bill-reminders/:id',
      input: insertBillReminderSchema.partial(),
      responses: {
        200: z.custom<typeof billReminders.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/bill-reminders/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    upcoming: {
      method: 'GET' as const,
      path: '/api/bill-reminders/upcoming',
      responses: {
        200: z.array(z.custom<typeof billReminders.$inferSelect>()),
      },
    },
  },
  budgets: {
    list: {
      method: 'GET' as const,
      path: '/api/budgets',
      responses: {
        200: z.array(z.custom<typeof budgets.$inferSelect>()),
      },
    },
    withSpending: {
      method: 'GET' as const,
      path: '/api/budgets/with-spending',
      responses: {
        200: z.array(z.custom<import('./schema').BudgetWithSpending>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/budgets/:id',
      responses: {
        200: z.custom<typeof budgets.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/budgets',
      input: insertBudgetSchema,
      responses: {
        201: z.custom<typeof budgets.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/budgets/:id',
      input: insertBudgetSchema.partial(),
      responses: {
        200: z.custom<typeof budgets.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/budgets/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  recurringTransactions: {
    list: {
      method: 'GET' as const,
      path: '/api/recurring-transactions',
      responses: {
        200: z.array(z.custom<typeof recurringTransactions.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/recurring-transactions/:id',
      responses: {
        200: z.custom<typeof recurringTransactions.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/recurring-transactions',
      input: insertRecurringTransactionSchema,
      responses: {
        201: z.custom<typeof recurringTransactions.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/recurring-transactions/:id',
      input: insertRecurringTransactionSchema.partial(),
      responses: {
        200: z.custom<typeof recurringTransactions.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/recurring-transactions/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  savingsGoals: {
    list: {
      method: 'GET' as const,
      path: '/api/savings-goals',
      responses: {
        200: z.array(z.custom<typeof savingsGoals.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/savings-goals/:id',
      responses: {
        200: z.custom<typeof savingsGoals.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/savings-goals',
      input: insertSavingsGoalSchema,
      responses: {
        201: z.custom<typeof savingsGoals.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/savings-goals/:id',
      input: insertSavingsGoalSchema.partial().extend({ currentAmount: z.number().optional(), isCompleted: z.boolean().optional() }),
      responses: {
        200: z.custom<typeof savingsGoals.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/savings-goals/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  savingsChallenges: {
    list: {
      method: 'GET' as const,
      path: '/api/savings-challenges',
      responses: {
        200: z.array(z.custom<typeof savingsChallenges.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/savings-challenges/:id',
      responses: {
        200: z.custom<typeof savingsChallenges.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/savings-challenges',
      input: insertSavingsChallengeSchema,
      responses: {
        201: z.custom<typeof savingsChallenges.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/savings-challenges/:id',
      input: insertSavingsChallengeSchema.partial().extend({ currentAmount: z.number().optional(), progress: z.string().optional(), isCompleted: z.boolean().optional() }),
      responses: {
        200: z.custom<typeof savingsChallenges.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/savings-challenges/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  customCategories: {
    list: {
      method: 'GET' as const,
      path: '/api/custom-categories',
      responses: {
        200: z.array(z.custom<typeof customCategories.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/custom-categories',
      input: insertCustomCategorySchema,
      responses: {
        201: z.custom<typeof customCategories.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/custom-categories/:id',
      input: insertCustomCategorySchema.partial(),
      responses: {
        200: z.custom<typeof customCategories.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/custom-categories/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  categoryRules: {
    list: {
      method: 'GET' as const,
      path: '/api/category-rules',
      responses: {
        200: z.array(z.custom<typeof categoryRules.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/category-rules',
      input: insertCategoryRuleSchema,
      responses: {
        201: z.custom<typeof categoryRules.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/category-rules/:id',
      input: insertCategoryRuleSchema.partial(),
      responses: {
        200: z.custom<typeof categoryRules.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/category-rules/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    match: {
      method: 'POST' as const,
      path: '/api/category-rules/match',
      input: z.object({ description: z.string() }),
      responses: {
        200: z.object({ category: z.string().nullable() }),
      },
    },
  },
  financialHealth: {
    get: {
      method: 'GET' as const,
      path: '/api/financial-health',
      responses: {
        200: z.custom<import('./schema').FinancialHealthScore>(),
      },
    },
  },
  export: {
    csv: {
      method: 'GET' as const,
      path: '/api/export/csv',
      responses: {
        200: z.string(),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type ExpenseInput = z.infer<typeof api.expenses.create.input>;
export type ExpenseResponse = z.infer<typeof api.expenses.create.responses[201]>;
export type StatsResponse = z.infer<typeof api.stats.get.responses[200]>;
