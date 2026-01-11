import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import {
  expenses,
  type Expense,
  type InsertExpense,
  type UpdateExpenseRequest,
  type StatsResponse,
  type CategoryStat,
  type MonthlyStat
} from "@shared/schema";

export interface IStorage {
  // Expenses
  getExpenses(userId: string): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, updates: UpdateExpenseRequest): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;
  getStats(userId: string): Promise<StatsResponse>;
}

export class DatabaseStorage implements IStorage {
  async getExpenses(userId: string): Promise<Expense[]> {
    return await db.select()
      .from(expenses)
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.date));
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense;
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db.insert(expenses).values(insertExpense).returning();
    return expense;
  }

  async updateExpense(id: number, updates: UpdateExpenseRequest): Promise<Expense> {
    const [updated] = await db.update(expenses)
      .set(updates)
      .where(eq(expenses.id, id))
      .returning();
    return updated;
  }

  async deleteExpense(id: number): Promise<void> {
    await db.delete(expenses).where(eq(expenses.id, id));
  }

  async getStats(userId: string): Promise<StatsResponse> {
    // Total expenses
    const [totalResult] = await db.select({
      total: sql<number>`sum(${expenses.amount})`
    })
    .from(expenses)
    .where(eq(expenses.userId, userId));

    // By Category
    const byCategory = await db.select({
      category: expenses.category,
      total: sql<number>`sum(${expenses.amount})`
    })
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .groupBy(expenses.category);

    // Monthly
    // Use to_char for simple month grouping
    const monthly = await db.select({
      month: sql<string>`to_char(${expenses.date}, 'YYYY-MM')`,
      total: sql<number>`sum(${expenses.amount})`
    })
    .from(expenses)
    .where(eq(expenses.userId, userId))
    .groupBy(sql`to_char(${expenses.date}, 'YYYY-MM')`)
    .orderBy(sql`to_char(${expenses.date}, 'YYYY-MM')`);

    return {
      total: Number(totalResult?.total || 0),
      byCategory: byCategory.map(c => ({ category: c.category, total: Number(c.total) })),
      monthly: monthly.map(m => ({ month: m.month, total: Number(m.total) })),
    };
  }
}

export const storage = new DatabaseStorage();
