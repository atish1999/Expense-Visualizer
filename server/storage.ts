import { db } from "./db";
import { eq, desc, and, sql, gte, lte, between, asc } from "drizzle-orm";
import {
  expenses,
  billReminders,
  type Expense,
  type FullInsertExpense,
  type UpdateExpenseRequest,
  type BillReminder,
  type FullInsertBillReminder,
  type UpdateBillReminderRequest,
  type StatsResponse,
  type CategoryStat,
  type MonthlyStat,
  type InsightsResponse,
  type PeriodBucket,
  type CategoryTrend,
  type FinancialPattern,
} from "@shared/schema";
import { type InsightsQuery } from "@shared/routes";

export interface IStorage {
  // Expenses
  getExpenses(userId: string): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: FullInsertExpense): Promise<Expense>;
  updateExpense(id: number, updates: UpdateExpenseRequest): Promise<Expense>;
  deleteExpense(id: number): Promise<void>;
  getStats(userId: string): Promise<StatsResponse>;
  getInsights(userId: string, query: InsightsQuery): Promise<InsightsResponse>;
  
  // Bill Reminders
  getBillReminders(userId: string): Promise<BillReminder[]>;
  getBillReminder(id: number): Promise<BillReminder | undefined>;
  createBillReminder(reminder: FullInsertBillReminder): Promise<BillReminder>;
  updateBillReminder(id: number, updates: UpdateBillReminderRequest): Promise<BillReminder>;
  deleteBillReminder(id: number): Promise<void>;
  getUpcomingBills(userId: string, daysAhead: number): Promise<BillReminder[]>;
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

  async createExpense(insertExpense: FullInsertExpense): Promise<Expense> {
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

  async getInsights(userId: string, query: InsightsQuery): Promise<InsightsResponse> {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    // Determine date ranges
    if (query.startDate && query.endDate) {
      startDate = new Date(query.startDate);
      endDate = new Date(query.endDate);
      const duration = endDate.getTime() - startDate.getTime();
      previousEndDate = new Date(startDate.getTime() - 1);
      previousStartDate = new Date(previousEndDate.getTime() - duration);
    } else {
      // Default: last 6 months
      endDate = now;
      startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      previousEndDate = new Date(startDate.getTime() - 1);
      previousStartDate = new Date(previousEndDate.getFullYear(), previousEndDate.getMonth() - 5, 1);
    }

    // Get expenses for current period
    const currentExpenses = await db.select()
      .from(expenses)
      .where(and(
        eq(expenses.userId, userId),
        gte(expenses.date, startDate),
        lte(expenses.date, endDate)
      ));

    // Get expenses for previous period (for comparison)
    const previousExpenses = await db.select()
      .from(expenses)
      .where(and(
        eq(expenses.userId, userId),
        gte(expenses.date, previousStartDate),
        lte(expenses.date, previousEndDate)
      ));

    // Calculate period buckets based on granularity
    const periodBuckets: PeriodBucket[] = [];
    const granularity = query.granularity || 'month';

    if (granularity === 'month') {
      const months = this.getMonthsBetween(startDate, endDate);
      for (const month of months) {
        const monthStart = new Date(month.year, month.month, 1);
        const monthEnd = new Date(month.year, month.month + 1, 0, 23, 59, 59);
        const total = currentExpenses
          .filter(e => {
            const d = new Date(e.date);
            return d >= monthStart && d <= monthEnd;
          })
          .reduce((sum, e) => sum + e.amount, 0);

        periodBuckets.push({
          label: `${this.getMonthName(month.month)} ${month.year}`,
          startDate: monthStart.toISOString(),
          endDate: monthEnd.toISOString(),
          total,
        });
      }
    } else if (granularity === 'quarter') {
      const quarters = this.getQuartersBetween(startDate, endDate);
      for (const q of quarters) {
        const qStart = new Date(q.year, (q.quarter - 1) * 3, 1);
        const qEnd = new Date(q.year, q.quarter * 3, 0, 23, 59, 59);
        const total = currentExpenses
          .filter(e => {
            const d = new Date(e.date);
            return d >= qStart && d <= qEnd;
          })
          .reduce((sum, e) => sum + e.amount, 0);

        periodBuckets.push({
          label: `Q${q.quarter} ${q.year}`,
          startDate: qStart.toISOString(),
          endDate: qEnd.toISOString(),
          total,
        });
      }
    } else {
      // yearly
      const years = this.getYearsBetween(startDate, endDate);
      for (const year of years) {
        const yStart = new Date(year, 0, 1);
        const yEnd = new Date(year, 11, 31, 23, 59, 59);
        const total = currentExpenses
          .filter(e => {
            const d = new Date(e.date);
            return d >= yStart && d <= yEnd;
          })
          .reduce((sum, e) => sum + e.amount, 0);

        periodBuckets.push({
          label: `${year}`,
          startDate: yStart.toISOString(),
          endDate: yEnd.toISOString(),
          total,
        });
      }
    }

    // Calculate category trends
    const categories = Array.from(new Set(currentExpenses.map(e => e.category)));
    const categoryTrends: CategoryTrend[] = [];

    for (const category of categories) {
      const currentTotal = currentExpenses
        .filter(e => e.category === category)
        .reduce((sum, e) => sum + e.amount, 0);
      const previousTotal = previousExpenses
        .filter(e => e.category === category)
        .reduce((sum, e) => sum + e.amount, 0);

      const change = currentTotal - previousTotal;
      const changePercent = previousTotal > 0 ? (change / previousTotal) * 100 : (currentTotal > 0 ? 100 : 0);
      const trend: "up" | "down" | "stable" = changePercent > 5 ? "up" : changePercent < -5 ? "down" : "stable";

      // Period data for sparklines
      const periodData = periodBuckets.map(bucket => ({
        period: bucket.label,
        total: currentExpenses
          .filter(e => {
            const d = new Date(e.date);
            return e.category === category && d >= new Date(bucket.startDate) && d <= new Date(bucket.endDate);
          })
          .reduce((sum, e) => sum + e.amount, 0),
      }));

      categoryTrends.push({
        category,
        currentTotal,
        previousTotal,
        change,
        changePercent: Math.round(changePercent * 10) / 10,
        trend,
        periodData,
      });
    }

    // Sort by current total descending
    categoryTrends.sort((a, b) => b.currentTotal - a.currentTotal);

    // Overall totals
    const totalCurrentPeriod = currentExpenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPreviousPeriod = previousExpenses.reduce((sum, e) => sum + e.amount, 0);
    const overallChange = totalCurrentPeriod - totalPreviousPeriod;
    const overallChangePercent = totalPreviousPeriod > 0 
      ? (overallChange / totalPreviousPeriod) * 100 
      : (totalCurrentPeriod > 0 ? 100 : 0);
    const overallTrend: "up" | "down" | "stable" = overallChangePercent > 5 ? "up" : overallChangePercent < -5 ? "down" : "stable";

    // Financial patterns
    const numMonths = Math.max(1, this.getMonthsBetween(startDate, endDate).length);
    const avgMonthlySpend = totalCurrentPeriod / numMonths;
    
    const sortedCategories = [...categoryTrends].sort((a, b) => b.currentTotal - a.currentTotal);
    const highestCategory = sortedCategories[0] || { category: "N/A", currentTotal: 0 };
    const lowestCategory = sortedCategories.filter(c => c.currentTotal > 0).pop() || { category: "N/A", currentTotal: 0 };

    const growingCategories = categoryTrends.filter(c => c.trend === "up" && c.previousTotal > 0).sort((a, b) => b.changePercent - a.changePercent);
    const shrinkingCategories = categoryTrends.filter(c => c.trend === "down").sort((a, b) => a.changePercent - b.changePercent);

    const financialPattern: FinancialPattern = {
      avgMonthlySpend,
      highestSpendCategory: highestCategory.category,
      highestSpendAmount: highestCategory.currentTotal,
      lowestSpendCategory: lowestCategory.category,
      lowestSpendAmount: lowestCategory.currentTotal,
      spendingTrend: overallChangePercent > 5 ? "increasing" : overallChangePercent < -5 ? "decreasing" : "stable",
      spendingTrendPercent: Math.round(overallChangePercent * 10) / 10,
      topGrowingCategory: growingCategories[0]?.category || null,
      topGrowingPercent: growingCategories[0]?.changePercent || 0,
      topShrinkingCategory: shrinkingCategories[0]?.category || null,
      topShrinkingPercent: shrinkingCategories[0]?.changePercent || 0,
    };

    return {
      periodBuckets,
      categoryTrends,
      totalCurrentPeriod,
      totalPreviousPeriod,
      overallChange,
      overallChangePercent: Math.round(overallChangePercent * 10) / 10,
      overallTrend,
      financialPattern,
    };
  }

  private getMonthsBetween(start: Date, end: Date): { year: number; month: number }[] {
    const months: { year: number; month: number }[] = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    while (current <= end) {
      months.push({ year: current.getFullYear(), month: current.getMonth() });
      current.setMonth(current.getMonth() + 1);
    }
    return months;
  }

  private getQuartersBetween(start: Date, end: Date): { year: number; quarter: number }[] {
    const quarters: { year: number; quarter: number }[] = [];
    const startQ = Math.floor(start.getMonth() / 3) + 1;
    const current = { year: start.getFullYear(), quarter: startQ };
    
    while (new Date(current.year, (current.quarter - 1) * 3, 1) <= end) {
      quarters.push({ ...current });
      current.quarter++;
      if (current.quarter > 4) {
        current.quarter = 1;
        current.year++;
      }
    }
    return quarters;
  }

  private getYearsBetween(start: Date, end: Date): number[] {
    const years: number[] = [];
    for (let y = start.getFullYear(); y <= end.getFullYear(); y++) {
      years.push(y);
    }
    return years;
  }

  private getMonthName(month: number): string {
    const names = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return names[month];
  }
}

export const storage = new DatabaseStorage();
