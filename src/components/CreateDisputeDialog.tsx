
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CreateDisputeDialogProps {
  onDisputeCreated: () => void;
}

const CreateDisputeDialog: React.FC<CreateDisputeDialogProps> = ({ onDisputeCreated }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('disputes')
        .insert({
          user_id: user.id,
          title,
          description,
        });

      if (error) throw error;

      toast({
        title: "Dispute Created",
        description: "Your dispute has been successfully submitted.",
      });

      setTitle('');
      setDescription('');
      setOpen(false);
      onDisputeCreated();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-loan-primary hover:bg-blue-600">Create New Dispute</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Dispute</DialogTitle>
          <DialogDescription>
            Describe your issue and we'll help resolve it.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Brief description of the issue"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide detailed information about your dispute"
              required
              rows={4}
            />
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Creating...' : 'Create Dispute'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDisputeDialog;
