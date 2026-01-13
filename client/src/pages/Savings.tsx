import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO, differenceInDays } from "date-fns";
import { Plus, Edit2, Trash2, Target, Trophy, PiggyBank, Calendar, TrendingUp, Check, DollarSign } from "lucide-react";
import { useSavingsGoals, useCreateSavingsGoal, useUpdateSavingsGoal, useDeleteSavingsGoal, useSavingsChallenges, useCreateSavingsChallenge, useUpdateSavingsChallenge, useDeleteSavingsChallenge } from "@/hooks/use-savings";
import { useCurrency } from "@/hooks/use-currency";
import type { SavingsGoal, SavingsChallenge } from "@shared/schema";

const CHALLENGE_TYPES = [
  { value: "52-week", label: "52-Week Challenge" },
  { value: "no-spend", label: "No-Spend Challenge" },
  { value: "round-up", label: "Round-Up Challenge" },
  { value: "custom", label: "Custom Challenge" },
];

const goalFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  targetAmount: z.number().min(1, "Target amount must be greater than 0"),
  deadline: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

const challengeFormSchema = z.object({
  type: z.string().min(1, "Type is required"),
  name: z.string().min(1, "Name is required"),
  targetAmount: z.number().optional(),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
});

const contributionFormSchema = z.object({
  amount: z.number().min(1, "Amount must be greater than 0"),
});

type GoalFormData = z.infer<typeof goalFormSchema>;
type ChallengeFormData = z.infer<typeof challengeFormSchema>;
type ContributionFormData = z.infer<typeof contributionFormSchema>;

export default function Savings() {
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [isChallengeFormOpen, setIsChallengeFormOpen] = useState(false);
  const [isContributionFormOpen, setIsContributionFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [editingChallenge, setEditingChallenge] = useState<SavingsChallenge | null>(null);
  const [contributingGoal, setContributingGoal] = useState<SavingsGoal | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<number | null>(null);
  const [deletingChallengeId, setDeletingChallengeId] = useState<number | null>(null);

  const { data: goals, isLoading: goalsLoading } = useSavingsGoals();
  const { data: challenges, isLoading: challengesLoading } = useSavingsChallenges();

  const createGoalMutation = useCreateSavingsGoal();
  const updateGoalMutation = useUpdateSavingsGoal();
  const deleteGoalMutation = useDeleteSavingsGoal();

  const createChallengeMutation = useCreateSavingsChallenge();
  const updateChallengeMutation = useUpdateSavingsChallenge();
  const deleteChallengeMutation = useDeleteSavingsChallenge();

  const { formatShort } = useCurrency();

  const goalForm = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      name: "",
      targetAmount: 0,
      deadline: "",
      icon: "piggy-bank",
      color: "#10b981",
    },
  });

  const challengeForm = useForm<ChallengeFormData>({
    resolver: zodResolver(challengeFormSchema),
    defaultValues: {
      type: "custom",
      name: "",
      targetAmount: 0,
      startDate: format(new Date(), "yyyy-MM-dd"),
      endDate: "",
    },
  });

  const contributionForm = useForm<ContributionFormData>({
    resolver: zodResolver(contributionFormSchema),
    defaultValues: {
      amount: 0,
    },
  });

  const handleOpenGoalForm = (goal?: SavingsGoal) => {
    if (goal) {
      setEditingGoal(goal);
      goalForm.reset({
        name: goal.name,
        targetAmount: goal.targetAmount / 100,
        deadline: goal.deadline || "",
        icon: goal.icon || "piggy-bank",
        color: goal.color || "#10b981",
      });
    } else {
      setEditingGoal(null);
      goalForm.reset({
        name: "",
        targetAmount: 0,
        deadline: "",
        icon: "piggy-bank",
        color: "#10b981",
      });
    }
    setIsGoalFormOpen(true);
  };

  const handleOpenChallengeForm = (challenge?: SavingsChallenge) => {
    if (challenge) {
      setEditingChallenge(challenge);
      challengeForm.reset({
        type: challenge.type,
        name: challenge.name,
        targetAmount: challenge.targetAmount ? challenge.targetAmount / 100 : undefined,
        startDate: challenge.startDate,
        endDate: challenge.endDate || "",
      });
    } else {
      setEditingChallenge(null);
      challengeForm.reset({
        type: "custom",
        name: "",
        targetAmount: 0,
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: "",
      });
    }
    setIsChallengeFormOpen(true);
  };

  const handleOpenContributionForm = (goal: SavingsGoal) => {
    setContributingGoal(goal);
    contributionForm.reset({ amount: 0 });
    setIsContributionFormOpen(true);
  };

  const onGoalSubmit = async (data: GoalFormData) => {
    const payload = {
      name: data.name,
      targetAmount: Math.round(data.targetAmount * 100),
      deadline: data.deadline || undefined,
      icon: data.icon,
      color: data.color,
    };

    if (editingGoal) {
      await updateGoalMutation.mutateAsync({ id: editingGoal.id, data: payload });
    } else {
      await createGoalMutation.mutateAsync(payload);
    }
    setIsGoalFormOpen(false);
    setEditingGoal(null);
  };

  const onChallengeSubmit = async (data: ChallengeFormData) => {
    const payload = {
      type: data.type,
      name: data.name,
      targetAmount: data.targetAmount ? Math.round(data.targetAmount * 100) : undefined,
      startDate: data.startDate,
      endDate: data.endDate || undefined,
      isActive: true,
    };

    if (editingChallenge) {
      await updateChallengeMutation.mutateAsync({ id: editingChallenge.id, data: payload });
    } else {
      await createChallengeMutation.mutateAsync(payload);
    }
    setIsChallengeFormOpen(false);
    setEditingChallenge(null);
  };

  const onContributionSubmit = async (data: ContributionFormData) => {
    if (!contributingGoal) return;
    const newAmount = contributingGoal.currentAmount + Math.round(data.amount * 100);
    const isCompleted = newAmount >= contributingGoal.targetAmount;
    await updateGoalMutation.mutateAsync({
      id: contributingGoal.id,
      data: { currentAmount: newAmount, isCompleted },
    });
    setIsContributionFormOpen(false);
    setContributingGoal(null);
  };

  const handleDeleteGoal = async () => {
    if (deletingGoalId) {
      await deleteGoalMutation.mutateAsync(deletingGoalId);
      setDeletingGoalId(null);
    }
  };

  const handleDeleteChallenge = async () => {
    if (deletingChallengeId) {
      await deleteChallengeMutation.mutateAsync(deletingChallengeId);
      setDeletingChallengeId(null);
    }
  };

  const getGoalProgress = (goal: SavingsGoal) => {
    return Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
  };

  const getChallengeStatusBadge = (challenge: SavingsChallenge) => {
    if (challenge.isCompleted) {
      return <Badge className="bg-green-500 text-white">Completed</Badge>;
    }
    if (!challenge.isActive) {
      return <Badge variant="secondary">Paused</Badge>;
    }
    return <Badge variant="outline">Active</Badge>;
  };

  const isLoading = goalsLoading || challengesLoading;

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground">Savings</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            Track your savings goals and take on savings challenges.
          </p>
        </div>
      </div>

      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList>
          <TabsTrigger value="goals" data-testid="tab-goals">
            <Target className="w-4 h-4 mr-2" />
            Goals
          </TabsTrigger>
          <TabsTrigger value="challenges" data-testid="tab-challenges">
            <Trophy className="w-4 h-4 mr-2" />
            Challenges
          </TabsTrigger>
        </TabsList>

        <TabsContent value="goals" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => handleOpenGoalForm()}
              className="shadow-lg shadow-primary/25"
              data-testid="button-add-goal"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Goal
            </Button>
          </div>

          {goalsLoading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-56 rounded-xl" />
              ))}
            </div>
          ) : goals && goals.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {goals.map((goal) => {
                const progress = getGoalProgress(goal);
                const daysRemaining = goal.deadline
                  ? differenceInDays(parseISO(goal.deadline), new Date())
                  : null;
                return (
                  <Card key={goal.id} className="p-5" data-testid={`card-goal-${goal.id}`}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${goal.color}20` }}
                        >
                          <PiggyBank className="w-5 h-5" style={{ color: goal.color || "#10b981" }} />
                        </div>
                        <div>
                          <h3 className="font-medium" data-testid={`text-goal-name-${goal.id}`}>
                            {goal.name}
                          </h3>
                          {goal.deadline && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {daysRemaining !== null && daysRemaining >= 0
                                ? `${daysRemaining} days left`
                                : format(parseISO(goal.deadline), "MMM dd, yyyy")}
                            </p>
                          )}
                        </div>
                      </div>
                      {goal.isCompleted && (
                        <Badge className="bg-green-500 text-white">
                          <Check className="w-3 h-3 mr-1" />
                          Done
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Saved</span>
                        <span className="font-mono font-medium" data-testid={`text-goal-current-${goal.id}`}>
                          {formatShort(goal.currentAmount)} / {formatShort(goal.targetAmount)}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-border/50">
                      <Button
                        variant="default"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenContributionForm(goal)}
                        disabled={goal.isCompleted}
                        data-testid={`button-contribute-goal-${goal.id}`}
                      >
                        <DollarSign className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenGoalForm(goal)}
                        data-testid={`button-edit-goal-${goal.id}`}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => setDeletingGoalId(goal.id)}
                        data-testid={`button-delete-goal-${goal.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium text-lg mb-2">No savings goals yet</h3>
              <p className="text-muted-foreground mb-4">
                Set your first savings goal to start tracking your progress.
              </p>
              <Button onClick={() => handleOpenGoalForm()} data-testid="button-add-first-goal">
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Goal
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => handleOpenChallengeForm()}
              className="shadow-lg shadow-primary/25"
              data-testid="button-add-challenge"
            >
              <Plus className="w-4 h-4 mr-2" />
              Start Challenge
            </Button>
          </div>

          {challengesLoading ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : challenges && challenges.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge) => {
                const progress = challenge.targetAmount
                  ? Math.min(100, Math.round((challenge.currentAmount / challenge.targetAmount) * 100))
                  : 0;
                return (
                  <Card key={challenge.id} className="p-5" data-testid={`card-challenge-${challenge.id}`}>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                          <h3 className="font-medium" data-testid={`text-challenge-name-${challenge.id}`}>
                            {challenge.name}
                          </h3>
                          <p className="text-xs text-muted-foreground capitalize">{challenge.type}</p>
                        </div>
                      </div>
                      {getChallengeStatusBadge(challenge)}
                    </div>

                    <div className="space-y-3 mb-4">
                      {challenge.targetAmount && (
                        <>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{progress}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">Saved</span>
                            <span className="font-mono font-medium">
                              {formatShort(challenge.currentAmount)} / {formatShort(challenge.targetAmount)}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Started</span>
                        <span>{format(parseISO(challenge.startDate), "MMM dd, yyyy")}</span>
                      </div>
                      {challenge.endDate && (
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">Ends</span>
                          <span>{format(parseISO(challenge.endDate), "MMM dd, yyyy")}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-border/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleOpenChallengeForm(challenge)}
                        data-testid={`button-edit-challenge-${challenge.id}`}
                      >
                        <Edit2 className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 text-destructive hover:text-destructive"
                        onClick={() => setDeletingChallengeId(challenge.id)}
                        data-testid={`button-delete-challenge-${challenge.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Trophy className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="font-medium text-lg mb-2">No savings challenges yet</h3>
              <p className="text-muted-foreground mb-4">
                Start a savings challenge to gamify your savings journey.
              </p>
              <Button onClick={() => handleOpenChallengeForm()} data-testid="button-add-first-challenge">
                <Plus className="w-4 h-4 mr-2" />
                Start Your First Challenge
              </Button>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isGoalFormOpen} onOpenChange={setIsGoalFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingGoal ? "Edit Savings Goal" : "New Savings Goal"}</DialogTitle>
            <DialogDescription>
              {editingGoal ? "Update your savings goal details." : "Set a new savings goal to track your progress."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={goalForm.handleSubmit(onGoalSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal-name">Goal Name</Label>
              <Input
                id="goal-name"
                placeholder="e.g., Emergency Fund"
                {...goalForm.register("name")}
                data-testid="input-goal-name"
              />
              {goalForm.formState.errors.name && (
                <p className="text-sm text-destructive">{goalForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-target">Target Amount</Label>
              <Input
                id="goal-target"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...goalForm.register("targetAmount", { valueAsNumber: true })}
                data-testid="input-goal-target"
              />
              {goalForm.formState.errors.targetAmount && (
                <p className="text-sm text-destructive">{goalForm.formState.errors.targetAmount.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal-deadline">Deadline (Optional)</Label>
              <Input
                id="goal-deadline"
                type="date"
                {...goalForm.register("deadline")}
                data-testid="input-goal-deadline"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal-color">Color</Label>
                <Input
                  id="goal-color"
                  type="color"
                  {...goalForm.register("color")}
                  className="h-10 p-1"
                  data-testid="input-goal-color"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsGoalFormOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createGoalMutation.isPending || updateGoalMutation.isPending}
                data-testid="button-save-goal"
              >
                {editingGoal ? "Update Goal" : "Create Goal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isChallengeFormOpen} onOpenChange={setIsChallengeFormOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingChallenge ? "Edit Challenge" : "New Savings Challenge"}</DialogTitle>
            <DialogDescription>
              {editingChallenge ? "Update your challenge details." : "Start a new savings challenge."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={challengeForm.handleSubmit(onChallengeSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="challenge-type">Challenge Type</Label>
              <Select
                value={challengeForm.watch("type")}
                onValueChange={(value) => challengeForm.setValue("type", value)}
              >
                <SelectTrigger data-testid="select-challenge-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {CHALLENGE_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="challenge-name">Challenge Name</Label>
              <Input
                id="challenge-name"
                placeholder="e.g., Save $1000 in 52 weeks"
                {...challengeForm.register("name")}
                data-testid="input-challenge-name"
              />
              {challengeForm.formState.errors.name && (
                <p className="text-sm text-destructive">{challengeForm.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="challenge-target">Target Amount (Optional)</Label>
              <Input
                id="challenge-target"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...challengeForm.register("targetAmount", { valueAsNumber: true })}
                data-testid="input-challenge-target"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="challenge-start">Start Date</Label>
                <Input
                  id="challenge-start"
                  type="date"
                  {...challengeForm.register("startDate")}
                  data-testid="input-challenge-start"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="challenge-end">End Date (Optional)</Label>
                <Input
                  id="challenge-end"
                  type="date"
                  {...challengeForm.register("endDate")}
                  data-testid="input-challenge-end"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsChallengeFormOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createChallengeMutation.isPending || updateChallengeMutation.isPending}
                data-testid="button-save-challenge"
              >
                {editingChallenge ? "Update Challenge" : "Start Challenge"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isContributionFormOpen} onOpenChange={setIsContributionFormOpen}>
        <DialogContent className="sm:max-w-[350px]">
          <DialogHeader>
            <DialogTitle>Add Contribution</DialogTitle>
            <DialogDescription>
              Add money to "{contributingGoal?.name}"
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={contributionForm.handleSubmit(onContributionSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contribution-amount">Amount</Label>
              <Input
                id="contribution-amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...contributionForm.register("amount", { valueAsNumber: true })}
                data-testid="input-contribution-amount"
              />
              {contributionForm.formState.errors.amount && (
                <p className="text-sm text-destructive">{contributionForm.formState.errors.amount.message}</p>
              )}
            </div>
            {contributingGoal && (
              <p className="text-sm text-muted-foreground">
                Current: {formatShort(contributingGoal.currentAmount)} / {formatShort(contributingGoal.targetAmount)}
              </p>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsContributionFormOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateGoalMutation.isPending}
                data-testid="button-save-contribution"
              >
                Add Contribution
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deletingGoalId} onOpenChange={() => setDeletingGoalId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Savings Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this savings goal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteGoal}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-goal"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!deletingChallengeId} onOpenChange={() => setDeletingChallengeId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Savings Challenge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this challenge? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteChallenge}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="button-confirm-delete-challenge"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
