
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Key, Copy } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

const credentialSchema = z.object({
  credentialType: z.enum(['treasurer', 'secretary'], {
    required_error: "Please select a credential type",
  }),
  credentialValue: z.string().min(6, {
    message: "Credential code must be at least 6 characters.",
  }),
});

interface CredentialManagementProps {
  chamaId: string;
  isAdmin: boolean;
}

interface Credential {
  id: string;
  credential_type: string;
  credential_value: string;
  is_used: boolean;
  created_at: string;
  used_at: string | null;
}

interface RpcResponse {
  success: boolean;
  message: string;
}

const CredentialManagement: React.FC<CredentialManagementProps> = ({ chamaId, isAdmin }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof credentialSchema>>({
    resolver: zodResolver(credentialSchema),
    defaultValues: {
      credentialType: 'treasurer',
      credentialValue: '',
    },
  });

  const { data: credentials = [], refetch } = useQuery({
    queryKey: ['member-credentials', chamaId],
    queryFn: async () => {
      if (!isAdmin) return [];
      
      const { data, error } = await supabase
        .from('member_credentials')
        .select('*')
        .eq('chama_id', chamaId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching credentials:', error);
        throw error;
      }
      
      return data as Credential[];
    },
    enabled: isAdmin
  });

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    form.setValue('credentialValue', result);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Credential code copied to clipboard",
    });
  };

  const isRpcResponse = (data: any): data is RpcResponse => {
    return data && typeof data === 'object' && 'success' in data && 'message' in data;
  };

  const onSubmit = async (values: z.infer<typeof credentialSchema>) => {
    setLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('create_member_credential', {
        p_chama_id: chamaId,
        p_credential_type: values.credentialType,
        p_credential_value: values.credentialValue
      });

      if (error) {
        console.error('Error creating credential:', error);
        toast({
          title: "Error",
          description: "Failed to create credential",
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
        refetch();
      } else {
        toast({
          title: "Error",
          description: isRpcResponse(data) ? data.message : "Failed to create credential",
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

  if (!isAdmin) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Role Credentials
            </CardTitle>
            <CardDescription>Manage credentials for role assignments</CardDescription>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Credential
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create Role Credential</DialogTitle>
                <DialogDescription>
                  Create a credential code that members can use to assign themselves specific roles.
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
                        <div className="flex gap-2">
                          <FormControl>
                            <Input
                              placeholder="Enter or generate code"
                              {...field}
                            />
                          </FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generateRandomCode}
                          >
                            Generate
                          </Button>
                        </div>
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
                      {loading ? "Creating..." : "Create Credential"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {credentials.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No credentials created yet</p>
          ) : (
            credentials.map((credential) => (
              <div
                key={credential.id}
                className={`flex items-center justify-between p-3 border rounded-lg ${
                  credential.is_used ? 'bg-gray-50 opacity-60' : 'bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">
                      {credential.credential_type}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      credential.is_used 
                        ? 'bg-gray-200 text-gray-600' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {credential.is_used ? 'Used' : 'Available'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Created {new Date(credential.created_at).toLocaleDateString()}
                    {credential.used_at && (
                      <span> • Used {new Date(credential.used_at).toLocaleDateString()}</span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">
                    {credential.credential_value}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(credential.credential_value)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CredentialManagement;
