
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, UserCheck, UserX, Loader2 } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useChamaMembers } from "@/hooks/useChamaMembers";

interface PendingMember {
  id: string;
  user_id: string;
  joined_at: string;
  email: string;
}

interface ChamaMemberManagementProps {
  chamaId: string;
}

const ChamaMemberManagement: React.FC<ChamaMemberManagementProps> = ({ chamaId }) => {
  const { toast } = useToast();
  const { isAdmin } = useChamaMembers(chamaId);
  const [pendingMembers, setPendingMembers] = useState<PendingMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingMember, setProcessingMember] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin()) {
      fetchPendingMembers();
    }
  }, [chamaId, isAdmin]);

  const fetchPendingMembers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_pending_chama_members', {
        p_chama_id: chamaId
      });

      if (error) {
        console.error('Error fetching pending members:', error);
        toast({
          title: "Error",
          description: "Failed to load pending members",
          variant: "destructive",
        });
        return;
      }

      setPendingMembers(data || []);
    } catch (error) {
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

  const handleApproveMember = async (memberId: string, userEmail: string) => {
    setProcessingMember(memberId);
    try {
      const { error } = await supabase.rpc('approve_chama_member', {
        member_id_to_approve: memberId
      });

      if (error) {
        console.error('Error approving member:', error);
        toast({
          title: "Error",
          description: "Failed to approve member",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Success",
        description: `${userEmail} has been approved and added to the chama`,
      });

      // Remove the approved member from the pending list
      setPendingMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessingMember(null);
    }
  };

  const handleRejectMember = async (memberId: string, userEmail: string) => {
    setProcessingMember(memberId);
    try {
      const { error } = await supabase.rpc('reject_chama_member', {
        member_id_to_reject: memberId
      });

      if (error) {
        console.error('Error rejecting member:', error);
        toast({
          title: "Error",
          description: "Failed to reject member request",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Request Rejected",
        description: `${userEmail}'s join request has been rejected`,
      });

      // Remove the rejected member from the pending list
      setPendingMembers(prev => prev.filter(member => member.id !== memberId));
    } catch (error) {
      console.error('Unexpected error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setProcessingMember(null);
    }
  };

  // Don't render anything if user is not an admin
  if (!isAdmin()) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          <div>
            <CardTitle>Member Management</CardTitle>
            <CardDescription>
              Manage join requests for your chama
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="animate-spin h-4 w-4" />
            <span>Loading pending requests...</span>
          </div>
        ) : pendingMembers.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No pending join requests
          </p>
        ) : (
          <div className="space-y-3">
            {pendingMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div>
                  <p className="font-medium">{member.email}</p>
                  <p className="text-sm text-muted-foreground">
                    Requested {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                  <Badge variant="secondary" className="mt-1">
                    Pending Approval
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleApproveMember(member.id, member.email)}
                    disabled={processingMember === member.id}
                    className="flex items-center gap-1"
                  >
                    {processingMember === member.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <UserCheck className="h-3 w-3" />
                    )}
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRejectMember(member.id, member.email)}
                    disabled={processingMember === member.id}
                    className="flex items-center gap-1"
                  >
                    {processingMember === member.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <UserX className="h-3 w-3" />
                    )}
                    Reject
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChamaMemberManagement;
