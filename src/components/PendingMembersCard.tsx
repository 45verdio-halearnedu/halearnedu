
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Check, X, AlertCircle } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface PendingMember {
  id: string;
  user_id: string;
  joined_at: string;
  email: string;
}

interface PendingMembersCardProps {
  chamaId: string;
}

const PendingMembersCard: React.FC<PendingMembersCardProps> = ({ chamaId }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const { data: pendingMembers = [], isLoading } = useQuery({
    queryKey: ['pending-chama-members', chamaId],
    queryFn: async () => {
      if (!user || !chamaId) return [];
      
      const { data, error } = await supabase.rpc('get_pending_chama_members', {
        p_chama_id: chamaId
      });
      
      if (error) {
        console.error('Error fetching pending members:', error);
        throw error;
      }
      
      return data as PendingMember[];
    },
    enabled: !!user && !!chamaId
  });

  const approveMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.rpc('approve_chama_member', {
        member_id_to_approve: memberId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member approved successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['pending-chama-members', chamaId] });
      queryClient.invalidateQueries({ queryKey: ['chama-details', chamaId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to approve member",
        variant: "destructive",
      });
    },
    onSettled: (_, __, memberId) => {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  });

  const rejectMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const { error } = await supabase.rpc('reject_chama_member', {
        member_id_to_reject: memberId
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Member request rejected",
      });
      queryClient.invalidateQueries({ queryKey: ['pending-chama-members', chamaId] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to reject member",
        variant: "destructive",
      });
    },
    onSettled: (_, __, memberId) => {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(memberId);
        return newSet;
      });
    }
  });

  const handleApprove = (memberId: string) => {
    setProcessingIds(prev => new Set(prev).add(memberId));
    approveMemberMutation.mutate(memberId);
  };

  const handleReject = (memberId: string) => {
    setProcessingIds(prev => new Set(prev).add(memberId));
    rejectMemberMutation.mutate(memberId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Pending Member Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (pendingMembers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Pending Member Requests
          </CardTitle>
          <CardDescription>No pending member requests</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Pending Member Requests
        </CardTitle>
        <CardDescription>
          {pendingMembers.length} member{pendingMembers.length !== 1 ? 's' : ''} awaiting approval
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {pendingMembers.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="font-medium">{member.email}</p>
                <p className="text-sm text-muted-foreground">
                  Requested: {new Date(member.joined_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                onClick={() => handleApprove(member.id)}
                disabled={processingIds.has(member.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleReject(member.id)}
                disabled={processingIds.has(member.id)}
                className="text-red-600 border-red-600 hover:bg-red-50"
              >
                <X className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default PendingMembersCard;
