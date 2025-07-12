
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus } from 'lucide-react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface JoinSavingGroupDialogProps {
  groupId: string;
  groupName: string;
}

const JoinSavingGroupDialog: React.FC<JoinSavingGroupDialogProps> = ({ groupId, groupName }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [initialContribution, setInitialContribution] = useState('');

  const joinGroupMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // Check if user is already a member
      const { data: existingMember } = await supabase
        .from('saving_group_members')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        throw new Error('You are already a member of this group');
      }

      // Join the group
      const { error } = await supabase
        .from('saving_group_members')
        .insert({
          group_id: groupId,
          user_id: user.id,
          role: 'member',
          total_contributed: parseFloat(initialContribution) || 0
        });

      if (error) throw error;

      // Update group total if there's an initial contribution
      if (initialContribution && parseFloat(initialContribution) > 0) {
        const contributionAmount = parseFloat(initialContribution);
        
        // First get the current total_saved value
        const { data: currentGroup, error: fetchError } = await supabase
          .from('saving_groups')
          .select('total_saved')
          .eq('id', groupId)
          .single();

        if (fetchError) throw fetchError;

        // Update with the new total
        const newTotal = (currentGroup.total_saved || 0) + contributionAmount;
        
        const { error: updateError } = await supabase
          .from('saving_groups')
          .update({ total_saved: newTotal })
          .eq('id', groupId);

        if (updateError) throw updateError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saving-groups'] });
      queryClient.invalidateQueries({ queryKey: ['my-saving-groups'] });
      toast({
        title: "Welcome to the Group!",
        description: `You have successfully joined ${groupName}`,
      });
      setOpen(false);
      setInitialContribution('');
    },
    onError: (error: any) => {
      console.error('Join group error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to join saving group",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    joinGroupMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <UserPlus className="h-4 w-4 mr-2" />
          Join Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Join {groupName}</DialogTitle>
          <DialogDescription>
            You're about to join this saving group. You can optionally make an initial contribution.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="initial_contribution">Initial Contribution (Optional)</Label>
            <Input
              id="initial_contribution"
              type="number"
              value={initialContribution}
              onChange={(e) => setInitialContribution(e.target.value)}
              placeholder="0.00"
              min="0"
              step="0.01"
            />
            <p className="text-sm text-gray-500 mt-1">
              You can contribute later if you prefer to start with $0
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Group Benefits</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Collaborative saving towards common goals</li>
              <li>• Regular contribution tracking</li>
              <li>• Group accountability and support</li>
              <li>• Shared financial knowledge and tips</li>
            </ul>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={joinGroupMutation.isPending}>
              {joinGroupMutation.isPending ? 'Joining...' : 'Join Group'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinSavingGroupDialog;
