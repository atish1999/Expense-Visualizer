import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api, insightsQuerySchema } from "@shared/routes";
import { z } from "zod";

// Helper to ensure user is authenticated and attach user to request if needed
// The Replit Auth integration adds req.user
function requireAuth(req: any, res: any, next: any) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // API Routes - Protected
  app.get(api.expenses.list.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const expenses = await storage.getExpenses(userId);
    res.json(expenses);
  });

  app.get(api.expenses.get.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const expense = await storage.getExpense(Number(req.params.id));
    
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    
    // Authorization check
    if (expense.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(expense);
  });

  app.post(api.expenses.create.path, requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      // Coerce amount if needed, though frontend should send number
      // We manually attach userId from auth context
      const inputData = { ...req.body, userId };
      const schemaWithUser = api.expenses.create.input.extend({
        userId: z.string(),
      });
      
      const input = schemaWithUser.parse(inputData);
      const expense = await storage.createExpense(input);
      res.status(201).json(expense);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.expenses.update.path, requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const id = Number(req.params.id);
      
      const existing = await storage.getExpense(id);
      if (!existing) {
        return res.status(404).json({ message: 'Expense not found' });
      }
      if (existing.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const input = api.expenses.update.input.parse(req.body);
      const updated = await storage.updateExpense(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.expenses.delete.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const id = Number(req.params.id);

    const existing = await storage.getExpense(id);
    if (!existing) {
      return res.status(404).json({ message: 'Expense not found' });
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await storage.deleteExpense(id);
    res.status(204).send();
  });

  app.get(api.stats.get.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const stats = await storage.getStats(userId);
    res.json(stats);
  });

  app.get(api.insights.get.path, requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const query = insightsQuerySchema.parse(req.query);
      const insights = await storage.getInsights(userId, query);
      res.json(insights);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Bill Reminders Routes
  app.get(api.billReminders.upcoming.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const daysAhead = Number(req.query.days) || 7;
    const upcoming = await storage.getUpcomingBills(userId, daysAhead);
    res.json(upcoming);
  });

  app.get(api.billReminders.list.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const reminders = await storage.getBillReminders(userId);
    res.json(reminders);
  });

  app.get(api.billReminders.get.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const reminder = await storage.getBillReminder(Number(req.params.id));
    
    if (!reminder || reminder.userId !== userId) {
      return res.status(404).json({ message: 'Bill reminder not found' });
    }

    res.json(reminder);
  });

  app.post(api.billReminders.create.path, requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const inputData = { ...req.body, userId };
      const schemaWithUser = api.billReminders.create.input.extend({
        userId: z.string(),
      });
      
      const input = schemaWithUser.parse(inputData);
      const reminder = await storage.createBillReminder(input);
      res.status(201).json(reminder);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.put(api.billReminders.update.path, requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const id = Number(req.params.id);
      
      const existing = await storage.getBillReminder(id);
      if (!existing) {
        return res.status(404).json({ message: 'Bill reminder not found' });
      }
      if (existing.userId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const input = api.billReminders.update.input.parse(req.body);
      const updated = await storage.updateBillReminder(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.billReminders.delete.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const id = Number(req.params.id);

    const existing = await storage.getBillReminder(id);
    if (!existing) {
      return res.status(404).json({ message: 'Bill reminder not found' });
    }
    if (existing.userId !== userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await storage.deleteBillReminder(id);
    res.status(204).send();
  });

  // Budget Routes
  app.get(api.budgets.withSpending.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const budgetsWithSpending = await storage.getBudgetsWithSpending(userId);
    res.json(budgetsWithSpending);
  });

  app.get(api.budgets.list.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const userBudgets = await storage.getBudgets(userId);
    res.json(userBudgets);
  });

  app.get(api.budgets.get.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const budget = await storage.getBudget(Number(req.params.id));
    if (!budget || budget.userId !== userId) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    res.json(budget);
  });

  app.post(api.budgets.create.path, requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.budgets.create.input.parse(req.body);
      const budget = await storage.createBudget({ ...input, userId });
      res.status(201).json(budget);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.budgets.update.path, requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const id = Number(req.params.id);
      const existing = await storage.getBudget(id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ message: 'Budget not found' });
      }
      const input = api.budgets.update.input.parse(req.body);
      const updated = await storage.updateBudget(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.budgets.delete.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const id = Number(req.params.id);
    const existing = await storage.getBudget(id);
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: 'Budget not found' });
    }
    await storage.deleteBudget(id);
    res.status(204).send();
  });

  // Recurring Transaction Routes
  app.get(api.recurringTransactions.list.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const transactions = await storage.getRecurringTransactions(userId);
    res.json(transactions);
  });

  app.get(api.recurringTransactions.get.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const tx = await storage.getRecurringTransaction(Number(req.params.id));
    if (!tx || tx.userId !== userId) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }
    res.json(tx);
  });

  app.post(api.recurringTransactions.create.path, requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.recurringTransactions.create.input.parse(req.body);
      const tx = await storage.createRecurringTransaction({ ...input, userId });
      res.status(201).json(tx);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.recurringTransactions.update.path, requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const id = Number(req.params.id);
      const existing = await storage.getRecurringTransaction(id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ message: 'Recurring transaction not found' });
      }
      const input = api.recurringTransactions.update.input.parse(req.body);
      const updated = await storage.updateRecurringTransaction(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.recurringTransactions.delete.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const id = Number(req.params.id);
    const existing = await storage.getRecurringTransaction(id);
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: 'Recurring transaction not found' });
    }
    await storage.deleteRecurringTransaction(id);
    res.status(204).send();
  });

  // Savings Goals Routes
  app.get(api.savingsGoals.list.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const goals = await storage.getSavingsGoals(userId);
    res.json(goals);
  });

  app.get(api.savingsGoals.get.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const goal = await storage.getSavingsGoal(Number(req.params.id));
    if (!goal || goal.userId !== userId) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }
    res.json(goal);
  });

  app.post(api.savingsGoals.create.path, requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.savingsGoals.create.input.parse(req.body);
      const goal = await storage.createSavingsGoal({ ...input, userId });
      res.status(201).json(goal);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.savingsGoals.update.path, requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const id = Number(req.params.id);
      const existing = await storage.getSavingsGoal(id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ message: 'Savings goal not found' });
      }
      const input = api.savingsGoals.update.input.parse(req.body);
      const updated = await storage.updateSavingsGoal(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.savingsGoals.delete.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const id = Number(req.params.id);
    const existing = await storage.getSavingsGoal(id);
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: 'Savings goal not found' });
    }
    await storage.deleteSavingsGoal(id);
    res.status(204).send();
  });

  // Savings Challenges Routes
  app.get(api.savingsChallenges.list.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const challenges = await storage.getSavingsChallenges(userId);
    res.json(challenges);
  });

  app.get(api.savingsChallenges.get.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const challenge = await storage.getSavingsChallenge(Number(req.params.id));
    if (!challenge || challenge.userId !== userId) {
      return res.status(404).json({ message: 'Savings challenge not found' });
    }
    res.json(challenge);
  });

  app.post(api.savingsChallenges.create.path, requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.savingsChallenges.create.input.parse(req.body);
      const challenge = await storage.createSavingsChallenge({ ...input, userId });
      res.status(201).json(challenge);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.savingsChallenges.update.path, requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const id = Number(req.params.id);
      const existing = await storage.getSavingsChallenge(id);
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ message: 'Savings challenge not found' });
      }
      const input = api.savingsChallenges.update.input.parse(req.body);
      const updated = await storage.updateSavingsChallenge(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.savingsChallenges.delete.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const id = Number(req.params.id);
    const existing = await storage.getSavingsChallenge(id);
    if (!existing || existing.userId !== userId) {
      return res.status(404).json({ message: 'Savings challenge not found' });
    }
    await storage.deleteSavingsChallenge(id);
    res.status(204).send();
  });

  // Custom Categories Routes
  app.get(api.customCategories.list.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const categories = await storage.getCustomCategories(userId);
    res.json(categories);
  });

  app.post(api.customCategories.create.path, requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.customCategories.create.input.parse(req.body);
      const category = await storage.createCustomCategory({ ...input, userId });
      res.status(201).json(category);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.customCategories.update.path, requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const id = Number(req.params.id);
      const categories = await storage.getCustomCategories(userId);
      const existing = categories.find(c => c.id === id);
      if (!existing) {
        return res.status(404).json({ message: 'Category not found' });
      }
      const input = api.customCategories.update.input.parse(req.body);
      const updated = await storage.updateCustomCategory(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.customCategories.delete.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const id = Number(req.params.id);
    const categories = await storage.getCustomCategories(userId);
    const existing = categories.find(c => c.id === id);
    if (!existing) {
      return res.status(404).json({ message: 'Category not found' });
    }
    await storage.deleteCustomCategory(id);
    res.status(204).send();
  });

  // Category Rules Routes
  app.get(api.categoryRules.list.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const rules = await storage.getCategoryRules(userId);
    res.json(rules);
  });

  app.post(api.categoryRules.create.path, requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.categoryRules.create.input.parse(req.body);
      const rule = await storage.createCategoryRule({ ...input, userId });
      res.status(201).json(rule);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.put(api.categoryRules.update.path, requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const id = Number(req.params.id);
      const rules = await storage.getCategoryRules(userId);
      const existing = rules.find(r => r.id === id);
      if (!existing) {
        return res.status(404).json({ message: 'Rule not found' });
      }
      const input = api.categoryRules.update.input.parse(req.body);
      const updated = await storage.updateCategoryRule(id, input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message, field: err.errors[0].path.join('.') });
      }
      throw err;
    }
  });

  app.delete(api.categoryRules.delete.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const id = Number(req.params.id);
    const rules = await storage.getCategoryRules(userId);
    const existing = rules.find(r => r.id === id);
    if (!existing) {
      return res.status(404).json({ message: 'Rule not found' });
    }
    await storage.deleteCategoryRule(id);
    res.status(204).send();
  });

  app.post(api.categoryRules.match.path, requireAuth, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const input = api.categoryRules.match.input.parse(req.body);
      const category = await storage.matchCategory(userId, input.description);
      res.json({ category });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // Financial Health Score Route
  app.get(api.financialHealth.get.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const score = await storage.getFinancialHealthScore(userId);
    res.json(score);
  });

  // CSV Export Route
  app.get(api.export.csv.path, requireAuth, async (req, res) => {
    const userId = (req.user as any).claims.sub;
    const userExpenses = await storage.getExpenses(userId);
    
    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const rows = userExpenses.map(e => [
      new Date(e.date).toISOString().split('T')[0],
      `"${e.description.replace(/"/g, '""')}"`,
      e.category,
      (e.amount / 100).toFixed(2),
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
    res.send(csv);
  });

  return httpServer;
}
