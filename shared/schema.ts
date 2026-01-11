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

// === RELATIONS ===
export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
}));

// === BASE SCHEMAS ===
export const insertExpenseSchema = createInsertSchema(expenses, {
  date: z.coerce.date(),
}).omit({ id: true, userId: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Expense = typeof expenses.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;

// Request types
export type CreateExpenseRequest = InsertExpense;
export type UpdateExpenseRequest = Partial<InsertExpense>;

// Response types
export type ExpenseResponse = Expense;

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
