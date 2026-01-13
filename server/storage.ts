import { db } from "./db";
import { eq, desc, and, sql, gte, lte, between, asc } from "drizzle-orm";
import {
  expenses,
  billReminders,
  budgets,
  recurringTransactions,
  savingsGoals,
  savingsChallenges,
  customCategories,
  categoryRules,
  type Expense,
  type FullInsertExpense,
  type UpdateExpenseRequest,
  type BillReminder,
  type FullInsertBillReminder,
  type UpdateBillReminderRequest,
  type Budget,
  type InsertBudget,
  type BudgetWithSpending,
  type RecurringTransaction,
  type InsertRecurringTransaction,
  type SavingsGoal,
  type InsertSavingsGoal,
  type SavingsChallenge,
  type InsertSavingsChallenge,
  type CustomCategory,
  type InsertCustomCategory,
  type CategoryRule,
  type InsertCategoryRule,
  type StatsResponse,
  type CategoryStat,
  type MonthlyStat,
  type InsightsResponse,
  type PeriodBucket,
  type CategoryTrend,
  type FinancialPattern,
  type FinancialHealthScore,
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

  // Budgets
  getBudgets(userId: string): Promise<Budget[]>;
  getBudgetsWithSpending(userId: string): Promise<BudgetWithSpending[]>;
  getBudget(id: number): Promise<Budget | undefined>;
  createBudget(budget: InsertBudget & { userId: string }): Promise<Budget>;
  updateBudget(id: number, updates: Partial<InsertBudget>): Promise<Budget>;
  deleteBudget(id: number): Promise<void>;

  // Recurring Transactions
  getRecurringTransactions(userId: string): Promise<RecurringTransaction[]>;
  getRecurringTransaction(id: number): Promise<RecurringTransaction | undefined>;
  createRecurringTransaction(tx: InsertRecurringTransaction & { userId: string }): Promise<RecurringTransaction>;
  updateRecurringTransaction(id: number, updates: Partial<InsertRecurringTransaction>): Promise<RecurringTransaction>;
  deleteRecurringTransaction(id: number): Promise<void>;

  // Savings Goals
  getSavingsGoals(userId: string): Promise<SavingsGoal[]>;
  getSavingsGoal(id: number): Promise<SavingsGoal | undefined>;
  createSavingsGoal(goal: InsertSavingsGoal & { userId: string }): Promise<SavingsGoal>;
  updateSavingsGoal(id: number, updates: Partial<InsertSavingsGoal & { currentAmount?: number; isCompleted?: boolean }>): Promise<SavingsGoal>;
  deleteSavingsGoal(id: number): Promise<void>;

  // Savings Challenges
  getSavingsChallenges(userId: string): Promise<SavingsChallenge[]>;
  getSavingsChallenge(id: number): Promise<SavingsChallenge | undefined>;
  createSavingsChallenge(challenge: InsertSavingsChallenge & { userId: string }): Promise<SavingsChallenge>;
  updateSavingsChallenge(id: number, updates: Partial<InsertSavingsChallenge & { currentAmount?: number; progress?: string; isCompleted?: boolean }>): Promise<SavingsChallenge>;
  deleteSavingsChallenge(id: number): Promise<void>;

  // Custom Categories
  getCustomCategories(userId: string): Promise<CustomCategory[]>;
  createCustomCategory(category: InsertCustomCategory & { userId: string }): Promise<CustomCategory>;
  updateCustomCategory(id: number, updates: Partial<InsertCustomCategory>): Promise<CustomCategory>;
  deleteCustomCategory(id: number): Promise<void>;

  // Category Rules
  getCategoryRules(userId: string): Promise<CategoryRule[]>;
  createCategoryRule(rule: InsertCategoryRule & { userId: string }): Promise<CategoryRule>;
  updateCategoryRule(id: number, updates: Partial<InsertCategoryRule>): Promise<CategoryRule>;
  deleteCategoryRule(id: number): Promise<void>;
  matchCategory(userId: string, description: string): Promise<string | null>;

  // Financial Health Score
  getFinancialHealthScore(userId: string): Promise<FinancialHealthScore>;
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

  // Bill Reminder methods
  async getBillReminders(userId: string): Promise<BillReminder[]> {
    return await db.select()
      .from(billReminders)
      .where(eq(billReminders.userId, userId))
      .orderBy(asc(billReminders.dueDate));
  }

  async getBillReminder(id: number): Promise<BillReminder | undefined> {
    const [reminder] = await db.select().from(billReminders).where(eq(billReminders.id, id));
    return reminder;
  }

  async createBillReminder(reminder: FullInsertBillReminder): Promise<BillReminder> {
    const [created] = await db.insert(billReminders).values(reminder).returning();
    return created;
  }

  async updateBillReminder(id: number, updates: UpdateBillReminderRequest): Promise<BillReminder> {
    const [updated] = await db.update(billReminders)
      .set(updates)
      .where(eq(billReminders.id, id))
      .returning();
    return updated;
  }

  async deleteBillReminder(id: number): Promise<void> {
    await db.delete(billReminders).where(eq(billReminders.id, id));
  }

  async getUpcomingBills(userId: string, daysAhead: number): Promise<BillReminder[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysAhead);
    
    return await db.select()
      .from(billReminders)
      .where(and(
        eq(billReminders.userId, userId),
        eq(billReminders.isActive, true),
        gte(billReminders.dueDate, today.toISOString().split('T')[0]),
        lte(billReminders.dueDate, futureDate.toISOString().split('T')[0])
      ))
      .orderBy(asc(billReminders.dueDate));
  }

  // Budget methods
  async getBudgets(userId: string): Promise<Budget[]> {
    return await db.select()
      .from(budgets)
      .where(eq(budgets.userId, userId))
      .orderBy(asc(budgets.category));
  }

  async getBudgetsWithSpending(userId: string): Promise<BudgetWithSpending[]> {
    const userBudgets = await this.getBudgets(userId);
    const now = new Date();
    
    // Get current month's expenses
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    const monthlyExpenses = await db.select({
      category: expenses.category,
      total: sql<number>`sum(${expenses.amount})`
    })
    .from(expenses)
    .where(and(
      eq(expenses.userId, userId),
      gte(expenses.date, startOfMonth),
      lte(expenses.date, endOfMonth)
    ))
    .groupBy(expenses.category);

    const spendingByCategory = new Map(monthlyExpenses.map(e => [e.category, Number(e.total)]));

    return userBudgets.map(budget => {
      const spent = spendingByCategory.get(budget.category) || 0;
      const remaining = Math.max(0, budget.amount - spent);
      const percentUsed = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;
      return { ...budget, spent, remaining, percentUsed };
    });
  }

  async getBudget(id: number): Promise<Budget | undefined> {
    const [budget] = await db.select().from(budgets).where(eq(budgets.id, id));
    return budget;
  }

  async createBudget(budget: InsertBudget & { userId: string }): Promise<Budget> {
    const [created] = await db.insert(budgets).values(budget).returning();
    return created;
  }

  async updateBudget(id: number, updates: Partial<InsertBudget>): Promise<Budget> {
    const [updated] = await db.update(budgets)
      .set(updates)
      .where(eq(budgets.id, id))
      .returning();
    return updated;
  }

  async deleteBudget(id: number): Promise<void> {
    await db.delete(budgets).where(eq(budgets.id, id));
  }

  // Recurring Transaction methods
  async getRecurringTransactions(userId: string): Promise<RecurringTransaction[]> {
    return await db.select()
      .from(recurringTransactions)
      .where(eq(recurringTransactions.userId, userId))
      .orderBy(desc(recurringTransactions.createdAt));
  }

  async getRecurringTransaction(id: number): Promise<RecurringTransaction | undefined> {
    const [tx] = await db.select().from(recurringTransactions).where(eq(recurringTransactions.id, id));
    return tx;
  }

  async createRecurringTransaction(tx: InsertRecurringTransaction & { userId: string }): Promise<RecurringTransaction> {
    const [created] = await db.insert(recurringTransactions).values(tx).returning();
    return created;
  }

  async updateRecurringTransaction(id: number, updates: Partial<InsertRecurringTransaction>): Promise<RecurringTransaction> {
    const [updated] = await db.update(recurringTransactions)
      .set(updates)
      .where(eq(recurringTransactions.id, id))
      .returning();
    return updated;
  }

  async deleteRecurringTransaction(id: number): Promise<void> {
    await db.delete(recurringTransactions).where(eq(recurringTransactions.id, id));
  }

  // Savings Goal methods
  async getSavingsGoals(userId: string): Promise<SavingsGoal[]> {
    return await db.select()
      .from(savingsGoals)
      .where(eq(savingsGoals.userId, userId))
      .orderBy(desc(savingsGoals.createdAt));
  }

  async getSavingsGoal(id: number): Promise<SavingsGoal | undefined> {
    const [goal] = await db.select().from(savingsGoals).where(eq(savingsGoals.id, id));
    return goal;
  }

  async createSavingsGoal(goal: InsertSavingsGoal & { userId: string }): Promise<SavingsGoal> {
    const [created] = await db.insert(savingsGoals).values(goal).returning();
    return created;
  }

  async updateSavingsGoal(id: number, updates: Partial<InsertSavingsGoal & { currentAmount?: number; isCompleted?: boolean }>): Promise<SavingsGoal> {
    const [updated] = await db.update(savingsGoals)
      .set(updates)
      .where(eq(savingsGoals.id, id))
      .returning();
    return updated;
  }

  async deleteSavingsGoal(id: number): Promise<void> {
    await db.delete(savingsGoals).where(eq(savingsGoals.id, id));
  }

  // Savings Challenge methods
  async getSavingsChallenges(userId: string): Promise<SavingsChallenge[]> {
    return await db.select()
      .from(savingsChallenges)
      .where(eq(savingsChallenges.userId, userId))
      .orderBy(desc(savingsChallenges.createdAt));
  }

  async getSavingsChallenge(id: number): Promise<SavingsChallenge | undefined> {
    const [challenge] = await db.select().from(savingsChallenges).where(eq(savingsChallenges.id, id));
    return challenge;
  }

  async createSavingsChallenge(challenge: InsertSavingsChallenge & { userId: string }): Promise<SavingsChallenge> {
    const [created] = await db.insert(savingsChallenges).values(challenge).returning();
    return created;
  }

  async updateSavingsChallenge(id: number, updates: Partial<InsertSavingsChallenge & { currentAmount?: number; progress?: string; isCompleted?: boolean }>): Promise<SavingsChallenge> {
    const [updated] = await db.update(savingsChallenges)
      .set(updates)
      .where(eq(savingsChallenges.id, id))
      .returning();
    return updated;
  }

  async deleteSavingsChallenge(id: number): Promise<void> {
    await db.delete(savingsChallenges).where(eq(savingsChallenges.id, id));
  }

  // Custom Category methods
  async getCustomCategories(userId: string): Promise<CustomCategory[]> {
    return await db.select()
      .from(customCategories)
      .where(eq(customCategories.userId, userId))
      .orderBy(asc(customCategories.name));
  }

  async createCustomCategory(category: InsertCustomCategory & { userId: string }): Promise<CustomCategory> {
    const [created] = await db.insert(customCategories).values(category).returning();
    return created;
  }

  async updateCustomCategory(id: number, updates: Partial<InsertCustomCategory>): Promise<CustomCategory> {
    const [updated] = await db.update(customCategories)
      .set(updates)
      .where(eq(customCategories.id, id))
      .returning();
    return updated;
  }

  async deleteCustomCategory(id: number): Promise<void> {
    await db.delete(customCategories).where(eq(customCategories.id, id));
  }

  // Category Rule methods
  async getCategoryRules(userId: string): Promise<CategoryRule[]> {
    return await db.select()
      .from(categoryRules)
      .where(eq(categoryRules.userId, userId))
      .orderBy(desc(categoryRules.matchCount));
  }

  async createCategoryRule(rule: InsertCategoryRule & { userId: string }): Promise<CategoryRule> {
    const [created] = await db.insert(categoryRules).values(rule).returning();
    return created;
  }

  async updateCategoryRule(id: number, updates: Partial<InsertCategoryRule>): Promise<CategoryRule> {
    const [updated] = await db.update(categoryRules)
      .set(updates)
      .where(eq(categoryRules.id, id))
      .returning();
    return updated;
  }

  async deleteCategoryRule(id: number): Promise<void> {
    await db.delete(categoryRules).where(eq(categoryRules.id, id));
  }

  async matchCategory(userId: string, description: string): Promise<string | null> {
    const rules = await this.getCategoryRules(userId);
    const lowerDesc = description.toLowerCase();
    
    for (const rule of rules) {
      if (rule.isActive && lowerDesc.includes(rule.pattern.toLowerCase())) {
        // Increment match count
        await db.update(categoryRules)
          .set({ matchCount: rule.matchCount + 1 })
          .where(eq(categoryRules.id, rule.id));
        return rule.category;
      }
    }
    return null;
  }

  // Financial Health Score
  async getFinancialHealthScore(userId: string): Promise<FinancialHealthScore> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Get this month's expenses
    const monthlyExpenses = await db.select()
      .from(expenses)
      .where(and(
        eq(expenses.userId, userId),
        gte(expenses.date, startOfMonth),
        lte(expenses.date, endOfMonth)
      ));

    const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Budget adherence
    const budgetsWithSpending = await this.getBudgetsWithSpending(userId);
    let budgetAdherence = 100;
    if (budgetsWithSpending.length > 0) {
      const underBudget = budgetsWithSpending.filter(b => b.percentUsed <= 100).length;
      budgetAdherence = Math.round((underBudget / budgetsWithSpending.length) * 100);
    }

    // Savings rate (based on savings goals progress)
    const goals = await this.getSavingsGoals(userId);
    let savingsRate = 50; // default
    if (goals.length > 0) {
      const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
      const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
      savingsRate = totalTarget > 0 ? Math.min(100, Math.round((totalSaved / totalTarget) * 100)) : 50;
    }

    // Spending consistency (compare to last month)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
    
    const lastMonthExpenses = await db.select()
      .from(expenses)
      .where(and(
        eq(expenses.userId, userId),
        gte(expenses.date, lastMonthStart),
        lte(expenses.date, lastMonthEnd)
      ));
    
    const lastMonthTotal = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
    let spendingConsistency = 80;
    if (lastMonthTotal > 0) {
      const variance = Math.abs(totalSpent - lastMonthTotal) / lastMonthTotal;
      spendingConsistency = Math.max(0, Math.round(100 - (variance * 100)));
    }

    // Bill payment score
    const bills = await this.getBillReminders(userId);
    const overdueBills = bills.filter(b => {
      const dueDate = new Date(b.dueDate);
      return b.isActive && dueDate < now;
    });
    const billPaymentScore = bills.length > 0 
      ? Math.round(((bills.length - overdueBills.length) / bills.length) * 100)
      : 100;

    // Calculate overall score
    const overall = Math.round(
      (budgetAdherence * 0.3) + 
      (savingsRate * 0.25) + 
      (spendingConsistency * 0.25) + 
      (billPaymentScore * 0.2)
    );

    // Determine grade
    let grade: "A" | "B" | "C" | "D" | "F";
    if (overall >= 90) grade = "A";
    else if (overall >= 80) grade = "B";
    else if (overall >= 70) grade = "C";
    else if (overall >= 60) grade = "D";
    else grade = "F";

    // Generate insights
    const insights: string[] = [];
    if (budgetAdherence < 80) {
      insights.push("You're exceeding some budget limits. Consider reviewing your spending.");
    }
    if (savingsRate < 50) {
      insights.push("Your savings progress could use a boost. Try setting smaller, achievable goals.");
    }
    if (spendingConsistency < 60) {
      insights.push("Your spending varies significantly month to month. Building a routine can help.");
    }
    if (billPaymentScore < 100) {
      insights.push("You have overdue bills. Staying on top of payments improves your score.");
    }
    if (overall >= 80) {
      insights.push("Great job! You're managing your finances well.");
    }

    return {
      overall,
      budgetAdherence,
      savingsRate,
      spendingConsistency,
      billPaymentScore,
      grade,
      insights,
    };
  }
}

export const storage = new DatabaseStorage();
