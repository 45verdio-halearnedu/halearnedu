
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { UserPlus, Key } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const roleAssignmentSchema = z.object({
  credentialType: z.enum(['treasurer', 'secretary'], {
    required_error: "Please select a role type",
  }),
  credentialValue: z.string().min(3, {
    message: "Credential code must be at least 3 characters.",
  }),
});

interface RoleAssignmentDialogProps {
  chamaId: string;
}

interface RpcResponse {
  success: boolean;
  message: string;
}

const RoleAssignmentDialog: React.FC<RoleAssignmentDialogProps> = ({ chamaId }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof roleAssignmentSchema>>({
    resolver: zodResolver(roleAssignmentSchema),
    defaultValues: {
      credentialType: 'treasurer',
      credentialValue: '',
    },
  });

  const isRpcResponse = (data: any): data is RpcResponse => {
    return data && typeof data === 'object' && 'success' in data && 'message' in data;
  };

  const onSubmit = async (values: z.infer<typeof roleAssignmentSchema>) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('assign_role_with_credential', {
        p_chama_id: chamaId,
        p_credential_value: values.credentialValue,
        p_credential_type: values.credentialType
      });

      if (error) {
        console.error('Error assigning role:', error);
        toast({
          title: "Error",
          description: "Failed to assign role. Please check your credential code.",
          variant: "destructive",
        });
        return;
      }

      if (isRpcResponse(data) && data.success) {
        toast({
          title: "Success",
          description: data.message,
        });
        setOpen(false);
        form.reset();
        
        // Refresh the page to show updated role
        window.location.reload();
      } else {
        toast({
          title: "Error", 
          description: isRpcResponse(data) ? data.message : "Failed to assign role",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Key className="h-4 w-4" />
          Use Role Credential
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Assign Role Using Credentials
          </DialogTitle>
          <DialogDescription>
            Enter the credential code provided by the chama admin to become a treasurer or secretary.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="credentialType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="treasurer">Treasurer</SelectItem>
                      <SelectItem value="secretary">Secretary</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="credentialValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Credential Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter credential code"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Assigning..." : "Assign Role"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default RoleAssignmentDialog;
