
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Target, Plus, Calendar, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  description: string;
}

const SavingsGoalsPage: React.FC = () => {
  const { toast } = useToast();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    description: ''
  });

  useEffect(() => {
    // Load mock savings goals
    setGoals([
      {
        id: '1',
        title: 'Emergency Fund',
        targetAmount: 100000,
        currentAmount: 45000,
        deadline: '2024-12-31',
        description: 'Build emergency fund for 6 months expenses'
      },
      {
        id: '2',
        title: 'Vacation Fund',
        targetAmount: 50000,
        currentAmount: 20000,
        deadline: '2024-08-15',
        description: 'Save for family vacation to Mombasa'
      }
    ]);
  }, []);

  const handleCreateGoal = () => {
    if (!newGoal.title || !newGoal.targetAmount || !newGoal.deadline) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const goal: SavingsGoal = {
      id: Date.now().toString(),
      title: newGoal.title,
      targetAmount: parseFloat(newGoal.targetAmount),
      currentAmount: 0,
      deadline: newGoal.deadline,
      description: newGoal.description
    };

    setGoals([...goals, goal]);
    setNewGoal({ title: '', targetAmount: '', deadline: '', description: '' });
    
    toast({
      title: "Goal Created",
      description: "Your savings goal has been created successfully",
    });
  };

  const addToGoal = (goalId: string, amount: number) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, currentAmount: goal.currentAmount + amount }
        : goal
    ));
    
    toast({
      title: "Amount Added",
      description: `KES ${amount.toLocaleString()} added to your goal`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Savings Goals</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              New Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Savings Goal</DialogTitle>
              <DialogDescription>
                Set a target amount and deadline for your savings goal
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Goal Title</Label>
                <Input
                  id="title"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                  placeholder="e.g., Emergency Fund"
                />
              </div>
              <div>
                <Label htmlFor="amount">Target Amount (KES)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newGoal.targetAmount}
                  onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
                  placeholder="100000"
                />
              </div>
              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={newGoal.deadline}
                  onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                  placeholder="Why are you saving for this?"
                />
              </div>
              <Button onClick={handleCreateGoal} className="w-full">
                Create Goal
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          const remaining = goal.targetAmount - goal.currentAmount;
          
          return (
            <Card key={goal.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Target className="h-5 w-5 text-blue-600" />
                  <span className="text-sm text-gray-500">
                    {new Date(goal.deadline).toLocaleDateString()}
                  </span>
                </div>
                <CardTitle className="text-lg">{goal.title}</CardTitle>
                <CardDescription>{goal.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>KES {goal.currentAmount.toLocaleString()}</span>
                    <span>KES {goal.targetAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => addToGoal(goal.id, 1000)}
                    className="flex-1"
                  >
                    +1K
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => addToGoal(goal.id, 5000)}
                    className="flex-1"
                  >
                    +5K
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => addToGoal(goal.id, 10000)}
                    className="flex-1"
                  >
                    +10K
                  </Button>
                </div>
                
                <div className="text-center text-sm text-gray-600">
                  KES {remaining.toLocaleString()} remaining
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {goals.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Savings Goals Yet</h3>
            <p className="text-gray-500 mb-6">
              Create your first savings goal to start tracking your progress
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SavingsGoalsPage;
