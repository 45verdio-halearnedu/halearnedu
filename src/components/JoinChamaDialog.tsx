
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { UserPlus, Loader2 } from 'lucide-react';

interface JoinChamaDialogProps {
  chamaId: string;
  chamaName: string;
  onJoin: (chamaId: string, message: string) => void;
  isJoining?: boolean;
}

const JoinChamaDialog: React.FC<JoinChamaDialogProps> = ({ 
  chamaId, 
  chamaName, 
  onJoin, 
  isJoining = false 
}) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onJoin(chamaId, message);
    setOpen(false);
    setMessage('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full">
          <UserPlus className="h-4 w-4 mr-2" />
          Join Chama
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Join {chamaName}</DialogTitle>
          <DialogDescription>
            Send a request to join this Chama. Your request will be reviewed by the administrators.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Tell the admins why you'd like to join this Chama..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isJoining}>
              {isJoining ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Request'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default JoinChamaDialog;
