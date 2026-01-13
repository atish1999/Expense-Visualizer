import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Edit2,
  Trash2,
  Folder,
  Tag,
  ArrowRight,
  Hash,
  Palette,
} from "lucide-react";
import {
  useCustomCategories,
  useCreateCustomCategory,
  useUpdateCustomCategory,
  useDeleteCustomCategory,
  useCategoryRules,
  useCreateCategoryRule,
  useUpdateCategoryRule,
  useDeleteCategoryRule,
} from "@/hooks/use-categories";
import type { CustomCategory, CategoryRule } from "@shared/schema";

const ICON_OPTIONS = [
  "folder",
  "shopping-cart",
  "utensils",
  "car",
  "home",
  "heart",
  "gift",
  "briefcase",
  "plane",
  "coffee",
  "music",
  "book",
  "gamepad-2",
  "dumbbell",
  "pill",
  "dog",
  "baby",
  "graduation-cap",
  "wrench",
  "zap",
];

const COLOR_OPTIONS = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
  "#f43f5e",
  "#6b7280",
];

const categoryFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
  isDefault: z.boolean().default(false),
});

const ruleFormSchema = z.object({
  pattern: z.string().min(1, "Pattern is required"),
  category: z.string().min(1, "Category is required"),
  isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categoryFormSchema>;
type RuleFormData = z.infer<typeof ruleFormSchema>;

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("categories");
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState<number | null>(null);
  const [isRuleFormOpen, setIsRuleFormOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CategoryRule | null>(null);
  const [deletingRuleId, setDeletingRuleId] = useState<number | null>(null);

  const { data: categories, isLoading: categoriesLoading } = useCustomCategories();
  const createCategoryMutation = useCreateCustomCategory();
  const updateCategoryMutation = useUpdateCustomCategory();
  const deleteCategoryMutation = useDeleteCustomCategory();

  const { data: rules, isLoading: rulesLoading } = useCategoryRules();
  const createRuleMutation = useCreateCategoryRule();
  const updateRuleMutation = useUpdateCategoryRule();
  const deleteRuleMutation = useDeleteCategoryRule();

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      icon: "folder",
      color: "#6b7280",
      isDefault: false,
    },
  });

  const ruleForm = useForm<RuleFormData>({
    resolver: zodResolver(ruleFormSchema),
    defaultValues: {
      pattern: "",
      category: "",
      isActive: true,
    },
  });

  const handleOpenCategoryForm = (category?: CustomCategory) => {
    if (category) {
      setEditingCategory(category);
      categoryForm.reset({
        name: category.name,
        icon: category.icon,
        color: category.color,
        isDefault: category.isDefault,
      });
    } else {
      setEditingCategory(null);
      categoryForm.reset({
        name: "",
        icon: "folder",
        color: "#6b7280",
        isDefault: false,
      });
    }
    setIsCategoryFormOpen(true);
  };

  const onSubmitCategory = async (data: CategoryFormData) => {
    if (editingCategory) {
      await updateCategoryMutation.mutateAsync({ id: editingCategory.id, data });
    } else {
      await createCategoryMutation.mutateAsync(data);
    }
    setIsCategoryFormOpen(false);
    setEditingCategory(null);
  };

  const handleDeleteCategory = async () => {
    if (deletingCategoryId) {
      await deleteCategoryMutation.mutateAsync(deletingCategoryId);
      setDeletingCategoryId(null);
    }
  };

  const handleOpenRuleForm = (rule?: CategoryRule) => {
    if (rule) {
      setEditingRule(rule);
      ruleForm.reset({
        pattern: rule.pattern,
        category: rule.category,
        isActive: rule.isActive,
      });
    } else {
      setEditingRule(null);
      ruleForm.reset({
        pattern: "",
        category: "",
        isActive: true,
      });
    }
    setIsRuleFormOpen(true);
  };

  const onSubmitRule = async (data: RuleFormData) => {
    if (editingRule) {
      await updateRuleMutation.mutateAsync({ id: editingRule.id, data });
    } else {
      await createRuleMutation.mutateAsync(data);
    }
    setIsRuleFormOpen(false);
    setEditingRule(null);
  };

  const handleDeleteRule = async () => {
    if (deletingRuleId) {
      await deleteRuleMutation.mutateAsync(deletingRuleId);
      setDeletingRuleId(null);
    }
  };

  return (
    <Layout>
      <div className="flex flex-col gap-4 mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Manage your custom categories and auto-categorization rules.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="categories" data-testid="tab-categories">
            <Folder className="w-4 h-4 mr-2" />
            Custom Categories
          </TabsTrigger>
          <TabsTrigger value="rules" data-testid="tab-rules">
            <Tag className="w-4 h-4 mr-2" />
            Auto-Categorization Rules
          </TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Your Categories</h2>
            <Button
              onClick={() => handleOpenCategoryForm()}
              data-testid="button-add-category"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          {categoriesLoading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.id} className="p-4" data-testid={`card-category-${category.id}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category.color + "20" }}
                      >
                        <Folder className="w-5 h-5" style={{ color: category.color }} />
                      </div>
                      <div>
                        <h3 className="font-medium" data-testid={`text-category-name-${category.id}`}>
                          {category.name}
                        </h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {category.icon}
                        </p>
                      </div>
                    </div>
                    {category.isDefault && (
                      <Badge variant="secondary">Default</Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <div
                      className="w-6 h-6 rounded-md border"
                      style={{ backgroundColor: category.color }}
                      data-testid={`color-swatch-${category.id}`}
                    />
                    <span className="text-sm text-muted-foreground">{category.color}</span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenCategoryForm(category)}
                      data-testid={`button-edit-category-${category.id}`}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-destructive hover:text-destructive"
                      onClick={() => setDeletingCategoryId(category.id)}
                      data-testid={`button-delete-category-${category.id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Folder className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium text-lg mb-2">No custom categories yet</h3>
              <p className="text-muted-foreground mb-4">
                Create custom categories to organize your expenses.
              </p>
              <Button onClick={() => handleOpenCategoryForm()} data-testid="button-add-first-category">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Category
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rules">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Auto-Categorization Rules</h2>
            <Button
              onClick={() => handleOpenRuleForm()}
              data-testid="button-add-rule"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Rule
            </Button>
          </div>

          {rulesLoading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : rules && rules.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
              {rules.map((rule) => (
                <Card key={rule.id} className="p-4" data-testid={`card-rule-${rule.id}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <Badge variant="outline" className="font-mono shrink-0">
                        {rule.pattern}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      <Badge className="shrink-0">{rule.category}</Badge>
                    </div>
                    <Badge variant={rule.isActive ? "default" : "secondary"}>
                      {rule.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <Hash className="w-4 h-4" />
                    <span data-testid={`text-match-count-${rule.id}`}>
                      {rule.matchCount} matches
                    </span>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenRuleForm(rule)}
                      data-testid={`button-edit-rule-${rule.id}`}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex-1 text-destructive hover:text-destructive"
                      onClick={() => setDeletingRuleId(rule.id)}
                      data-testid={`button-delete-rule-${rule.id}`}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Tag className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium text-lg mb-2">No auto-categorization rules yet</h3>
              <p className="text-muted-foreground mb-4">
                Create rules to automatically categorize expenses based on description patterns.
              </p>
              <Button onClick={() => handleOpenRuleForm()} data-testid="button-add-first-rule">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Rule
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isCategoryFormOpen} onOpenChange={setIsCategoryFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Edit Category" : "Add Category"}</DialogTitle>
            <DialogDescription>
              {editingCategory
                ? "Update the details of your custom category."
                : "Create a new custom category for your expenses."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={categoryForm.handleSubmit(onSubmitCategory)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Category Name</Label>
              <Input
                id="name"
                placeholder="e.g., Groceries, Entertainment"
                {...categoryForm.register("name")}
                data-testid="input-category-name"
              />
              {categoryForm.formState.errors.name && (
                <p className="text-sm text-destructive">{categoryForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Icon</Label>
              <Select
                value={categoryForm.watch("icon")}
                onValueChange={(value) => categoryForm.setValue("icon", value)}
              >
                <SelectTrigger data-testid="select-icon">
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`w-8 h-8 rounded-md border-2 transition-all ${
                      categoryForm.watch("color") === color
                        ? "border-foreground scale-110"
                        : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => categoryForm.setValue("color", color)}
                    data-testid={`color-option-${color.replace("#", "")}`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isDefault">Set as Default</Label>
              <Switch
                id="isDefault"
                checked={categoryForm.watch("isDefault")}
                onCheckedChange={(checked) => categoryForm.setValue("isDefault", checked)}
                data-testid="switch-is-default"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCategoryFormOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCategoryMutation.isPending || updateCategoryMutation.isPending}
                data-testid="button-submit-category"
              >
                {createCategoryMutation.isPending || updateCategoryMutation.isPending
                  ? "Saving..."
                  : editingCategory
                  ? "Update Category"
                  : "Add Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRuleFormOpen} onOpenChange={setIsRuleFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingRule ? "Edit Rule" : "Add Rule"}</DialogTitle>
            <DialogDescription>
              {editingRule
                ? "Update your auto-categorization rule."
                : "Create a rule to automatically categorize expenses based on description patterns."}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={ruleForm.handleSubmit(onSubmitRule)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pattern">Pattern</Label>
              <Input
                id="pattern"
                placeholder="e.g., amazon, starbucks, uber"
                {...ruleForm.register("pattern")}
                data-testid="input-rule-pattern"
              />
              <p className="text-xs text-muted-foreground">
                Expenses with descriptions containing this text will be auto-categorized.
              </p>
              {ruleForm.formState.errors.pattern && (
                <p className="text-sm text-destructive">{ruleForm.formState.errors.pattern.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                placeholder="e.g., Shopping, Food, Transport"
                {...ruleForm.register("category")}
                data-testid="input-rule-category"
              />
              {ruleForm.formState.errors.category && (
                <p className="text-sm text-destructive">{ruleForm.formState.errors.category.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch
                id="isActive"
                checked={ruleForm.watch("isActive")}
                onCheckedChange={(checked) => ruleForm.setValue("isActive", checked)}
                data-testid="switch-rule-is-active"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRuleFormOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createRuleMutation.isPending || updateRuleMutation.isPending}
                data-testid="button-submit-rule"
              >
                {createRuleMutation.isPending || updateRuleMutation.isPending
                  ? "Saving..."
                  : editingRule
                  ? "Update Rule"
                  : "Add Rule"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingCategoryId} onOpenChange={(open) => !open && setDeletingCategoryId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-category"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingRuleId} onOpenChange={(open) => !open && setDeletingRuleId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this auto-categorization rule? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRule}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-rule"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
