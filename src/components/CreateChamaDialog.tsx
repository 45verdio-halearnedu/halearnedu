
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Loader2 } from 'lucide-react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface CreateChamaDialogProps {
  children?: React.ReactNode;
}

const CreateChamaDialog: React.FC<CreateChamaDialogProps> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contribution_amount: '',
    contribution_frequency: 'monthly',
    max_members: '20'
  });

  const createChamaMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!user) throw new Error('Not authenticated');

      const { data: result, error } = await supabase
        .from('chamas')
        .insert({
          name: data.name,
          description: data.description,
          contribution_amount: parseFloat(data.contribution_amount),
          contribution_frequency: data.contribution_frequency,
          max_members: parseInt(data.max_members),
          created_by: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Automatically join the chama as admin
      const { error: memberError } = await supabase
        .from('chama_members')
        .insert({
          chama_id: result.id,
          user_id: user.id,
          role: 'admin',
          is_active: true
        });

      if (memberError) throw memberError;

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-chamas'] });
      queryClient.invalidateQueries({ queryKey: ['available-chamas'] });
      toast({
        title: "Chama Created!",
        description: "Your Chama has been created successfully.",
      });
      setOpen(false);
      setFormData({
        name: '',
        description: '',
        contribution_amount: '',
        contribution_frequency: 'monthly',
        max_members: '20'
      });
    },
    onError: (error: any) => {
      console.error('Create chama error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create Chama",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.contribution_amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createChamaMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Chama
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Chama</DialogTitle>
          <DialogDescription>
            Start a new savings group and invite others to join your financial journey.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Chama Name *</Label>
            <Input
              id="name"
              placeholder="Enter Chama name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe your Chama's purpose and goals"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contribution_amount">Contribution Amount ($) *</Label>
              <Input
                id="contribution_amount"
                type="number"
                placeholder="100"
                value={formData.contribution_amount}
                onChange={(e) => handleInputChange('contribution_amount', e.target.value)}
                min="1"
                step="0.01"
                required
              />
            </div>

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
          </div>

          <div>
            <Label htmlFor="max_members">Maximum Members</Label>
            <Input
              id="max_members"
              type="number"
              value={formData.max_members}
              onChange={(e) => handleInputChange('max_members', e.target.value)}
              min="5"
              max="100"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createChamaMutation.isPending}>
              {createChamaMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Chama'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChamaDialog;
