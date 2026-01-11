import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
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

  // Seed Data function (Optional: only seed if user has no data?)
  // For multi-tenant auth apps, seeding is tricky. 
  // Maybe just don't seed for now, or seed on first login if empty.
  // Skipping auto-seed to avoid cluttering real user data.

  return httpServer;
}
