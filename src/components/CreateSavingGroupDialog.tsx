
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from 'lucide-react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

const CreateSavingGroupDialog: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    group_type: 'chama',
    target_amount: '',
    contribution_frequency: 'monthly',
    min_contribution: '',
    max_members: '20'
  });

  const createGroupMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error('Not authenticated');

      const { data: result, error } = await supabase
        .from('saving_groups')
        .insert({
          name: data.name,
          description: data.description,
          group_type: data.group_type,
          target_amount: parseFloat(data.target_amount),
          contribution_frequency: data.contribution_frequency,
          min_contribution: parseFloat(data.min_contribution),
          max_members: parseInt(data.max_members),
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Automatically join the group as admin
      const { error: memberError } = await supabase
        .from('saving_group_members')
        .insert({
          group_id: result.id,
          user_id: user.id,
          role: 'admin'
        });

      if (memberError) throw memberError;

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saving-groups'] });
      queryClient.invalidateQueries({ queryKey: ['my-saving-groups'] });
      toast({
        title: "Group Created!",
        description: "Your saving group has been created successfully.",
      });
      setOpen(false);
      setFormData({
        name: '',
        description: '',
        group_type: 'chama',
        target_amount: '',
        contribution_frequency: 'monthly',
        min_contribution: '',
        max_members: '20'
      });
    },
    onError: (error: any) => {
      console.error('Create group error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create saving group",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.target_amount || !formData.min_contribution) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createGroupMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Saving Group</DialogTitle>
          <DialogDescription>
            Start a new saving group and invite others to join your financial journey.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Group Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter group name"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe your group's purpose"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="group_type">Group Type</Label>
            <Select value={formData.group_type} onValueChange={(value) => handleInputChange('group_type', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="chama">Chama</SelectItem>
                <SelectItem value="sacco">SACCO</SelectItem>
                <SelectItem value="investment_club">Investment Club</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target_amount">Target Amount ($) *</Label>
              <Input
                id="target_amount"
                type="number"
                value={formData.target_amount}
                onChange={(e) => handleInputChange('target_amount', e.target.value)}
                placeholder="10000"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <Label htmlFor="min_contribution">Min. Contribution ($) *</Label>
              <Input
                id="min_contribution"
                type="number"
                value={formData.min_contribution}
                onChange={(e) => handleInputChange('min_contribution', e.target.value)}
                placeholder="100"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contribution_frequency">Frequency</Label>
              <Select value={formData.contribution_frequency} onValueChange={(value) => handleInputChange('contribution_frequency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="max_members">Max Members</Label>
              <Input
                id="max_members"
                type="number"
                value={formData.max_members}
                onChange={(e) => handleInputChange('max_members', e.target.value)}
                min="2"
                max="100"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createGroupMutation.isPending}>
              {createGroupMutation.isPending ? 'Creating...' : 'Create Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSavingGroupDialog;
