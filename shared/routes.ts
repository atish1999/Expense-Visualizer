import { z } from 'zod';
import { insertExpenseSchema, insertBillReminderSchema, expenses, billReminders } from './schema';

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
