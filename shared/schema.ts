import { pgTable, text, serial, integer, boolean, timestamp, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

// Re-export auth models so they are available
export * from "./models/auth";

// === TABLE DEFINITIONS ===
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // stored in cents
  description: text("description").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  category: text("category").notNull(), // e.g. "Food", "Transport"
});

export const billReminders = pgTable("bill_reminders", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  amount: integer("amount").notNull(), // stored in cents
  dueDate: date("due_date").notNull(), // next due date
  frequency: text("frequency").notNull(), // 'once', 'weekly', 'monthly', 'yearly'
  category: text("category").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  notifyDaysBefore: integer("notify_days_before").default(3).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Budgets table - spending limits per category
export const budgets = pgTable("budgets", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  category: text("category").notNull(),
  amount: integer("amount").notNull(), // monthly budget in cents
  period: text("period").notNull().default("monthly"), // 'weekly', 'monthly', 'yearly'
  alertThreshold: integer("alert_threshold").default(80), // percentage to alert at
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Recurring transactions - auto-generate expenses
export const recurringTransactions = pgTable("recurring_transactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  amount: integer("amount").notNull(), // in cents
  description: text("description").notNull(),
  category: text("category").notNull(),
  frequency: text("frequency").notNull(), // 'daily', 'weekly', 'monthly', 'yearly'
  startDate: date("start_date").notNull(),
  endDate: date("end_date"), // optional end date
  lastGenerated: date("last_generated"), // track when last expense was created
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Savings goals
export const savingsGoals = pgTable("savings_goals", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  targetAmount: integer("target_amount").notNull(), // in cents
  currentAmount: integer("current_amount").default(0).notNull(), // in cents
  deadline: date("deadline"), // optional target date
  icon: text("icon").default("piggy-bank"), // lucide icon name
  color: text("color").default("#10b981"), // hex color
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Savings challenges - gamified savings
export const savingsChallenges = pgTable("savings_challenges", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // '52-week', 'no-spend', 'round-up', 'custom'
  name: text("name").notNull(),
  targetAmount: integer("target_amount"), // in cents (optional for some challenge types)
  currentAmount: integer("current_amount").default(0).notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date"),
  progress: text("progress").default("{}"), // JSON string for tracking (e.g., weeks completed)
  isActive: boolean("is_active").default(true).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Custom categories
export const customCategories = pgTable("custom_categories", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("folder"), // lucide icon name
  color: text("color").notNull().default("#6b7280"), // hex color
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Category rules for auto-categorization
export const categoryRules = pgTable("category_rules", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id),
  pattern: text("pattern").notNull(), // text pattern to match in description
  category: text("category").notNull(), // category to assign
  isActive: boolean("is_active").default(true).notNull(),
  matchCount: integer("match_count").default(0).notNull(), // track usage
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// === RELATIONS ===
export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

export const billRemindersRelations = relations(billReminders, ({ one }) => ({
  user: one(users, {
    fields: [billReminders.userId],
    references: [users.id],
  }),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  user: one(users, {
    fields: [budgets.userId],
    references: [users.id],
  }),
}));

export const recurringTransactionsRelations = relations(recurringTransactions, ({ one }) => ({
  user: one(users, {
    fields: [recurringTransactions.userId],
    references: [users.id],
  }),
}));

export const savingsGoalsRelations = relations(savingsGoals, ({ one }) => ({
  user: one(users, {
    fields: [savingsGoals.userId],
    references: [users.id],
  }),
}));

export const savingsChallengesRelations = relations(savingsChallenges, ({ one }) => ({
  user: one(users, {
    fields: [savingsChallenges.userId],
    references: [users.id],
  }),
}));

export const customCategoriesRelations = relations(customCategories, ({ one }) => ({
  user: one(users, {
    fields: [customCategories.userId],
    references: [users.id],
  }),
}));

export const categoryRulesRelations = relations(categoryRules, ({ one }) => ({
  user: one(users, {
    fields: [categoryRules.userId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertExpenseSchema = createInsertSchema(expenses, {
  date: z.coerce.date(),
}).omit({ id: true, userId: true });

// Full insert schema including userId (for internal use)
export const fullInsertExpenseSchema = createInsertSchema(expenses, {
  date: z.coerce.date(),
}).omit({ id: true });

// Bill reminder schemas
export const insertBillReminderSchema = createInsertSchema(billReminders, {
  dueDate: z.string(),
}).omit({ id: true, userId: true, createdAt: true });

export const fullInsertBillReminderSchema = createInsertSchema(billReminders, {
  dueDate: z.string(),
}).omit({ id: true, createdAt: true });

// Budget schemas
export const insertBudgetSchema = createInsertSchema(budgets).omit({ id: true, userId: true, createdAt: true });
export const fullInsertBudgetSchema = createInsertSchema(budgets).omit({ id: true, createdAt: true });

// Recurring transaction schemas
export const insertRecurringTransactionSchema = createInsertSchema(recurringTransactions, {
  startDate: z.string(),
  endDate: z.string().optional(),
  lastGenerated: z.string().optional(),
}).omit({ id: true, userId: true, createdAt: true });

// Savings goal schemas
export const insertSavingsGoalSchema = createInsertSchema(savingsGoals, {
  deadline: z.string().optional(),
}).omit({ id: true, userId: true, createdAt: true, isCompleted: true });

// Savings challenge schemas
export const insertSavingsChallengeSchema = createInsertSchema(savingsChallenges, {
  startDate: z.string(),
  endDate: z.string().optional(),
}).omit({ id: true, userId: true, createdAt: true, isCompleted: true, currentAmount: true });

// Custom category schemas
export const insertCustomCategorySchema = createInsertSchema(customCategories).omit({ id: true, userId: true, createdAt: true });

// Category rule schemas
export const insertCategoryRuleSchema = createInsertSchema(categoryRules).omit({ id: true, userId: true, createdAt: true, matchCount: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type FullInsertExpense = z.infer<typeof fullInsertExpenseSchema>;

export type BillReminder = typeof billReminders.$inferSelect;
export type InsertBillReminder = z.infer<typeof insertBillReminderSchema>;
export type FullInsertBillReminder = z.infer<typeof fullInsertBillReminderSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type RecurringTransaction = typeof recurringTransactions.$inferSelect;
export type InsertRecurringTransaction = z.infer<typeof insertRecurringTransactionSchema>;

export type SavingsGoal = typeof savingsGoals.$inferSelect;
export type InsertSavingsGoal = z.infer<typeof insertSavingsGoalSchema>;

export type SavingsChallenge = typeof savingsChallenges.$inferSelect;
export type InsertSavingsChallenge = z.infer<typeof insertSavingsChallengeSchema>;

export type CustomCategory = typeof customCategories.$inferSelect;
export type InsertCustomCategory = z.infer<typeof insertCustomCategorySchema>;

export type CategoryRule = typeof categoryRules.$inferSelect;
export type InsertCategoryRule = z.infer<typeof insertCategoryRuleSchema>;

// Request types
export type CreateExpenseRequest = InsertExpense;
export type UpdateExpenseRequest = Partial<InsertExpense>;

export type CreateBillReminderRequest = InsertBillReminder;
export type UpdateBillReminderRequest = Partial<InsertBillReminder>;

// Response types
export type ExpenseResponse = Expense;
export type BillReminderResponse = BillReminder;

// Budget with spending info
export interface BudgetWithSpending extends Budget {
  spent: number;
  remaining: number;
  percentUsed: number;
}

// Financial Health Score
export interface FinancialHealthScore {
  overall: number; // 0-100
  budgetAdherence: number; // 0-100
  savingsRate: number; // 0-100
  spendingConsistency: number; // 0-100
  billPaymentScore: number; // 0-100
  grade: "A" | "B" | "C" | "D" | "F";
  insights: string[];
}

export interface CategoryStat {
  category: string;
  total: number;
}

export interface MonthlyStat {
  month: string; // "YYYY-MM"
  total: number;
}

export interface StatsResponse {
  total: number;
  byCategory: CategoryStat[];
  monthly: MonthlyStat[];
}

// Insights Types
export interface PeriodBucket {
  label: string; // e.g., "Jan 2026", "Q1 2026"
  startDate: string;
  endDate: string;
  total: number;
}

export interface CategoryTrend {
  category: string;
  currentTotal: number;
  previousTotal: number;
  change: number; // absolute change
  changePercent: number; // percentage change
  trend: "up" | "down" | "stable";
  periodData: { period: string; total: number }[];
}

export interface FinancialPattern {
  avgMonthlySpend: number;
  highestSpendCategory: string;
  highestSpendAmount: number;
  lowestSpendCategory: string;
  lowestSpendAmount: number;
  spendingTrend: "increasing" | "decreasing" | "stable";
  spendingTrendPercent: number;
  topGrowingCategory: string | null;
  topGrowingPercent: number;
  topShrinkingCategory: string | null;
  topShrinkingPercent: number;
}

export interface InsightsResponse {
  periodBuckets: PeriodBucket[];
  categoryTrends: CategoryTrend[];
  totalCurrentPeriod: number;
  totalPreviousPeriod: number;
  overallChange: number;
  overallChangePercent: number;
  overallTrend: "up" | "down" | "stable";
  financialPattern: FinancialPattern;
}
