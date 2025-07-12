
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, Clock, User, CreditCard, FileText } from 'lucide-react';
import { useContributionApprovals } from '@/hooks/useContributionApprovals';
import CurrencyDisplay from './CurrencyDisplay';
import { useState } from 'react';

interface ContributionApprovalsCardProps {
  chamaId: string;
}

const ContributionApprovalsCard: React.FC<ContributionApprovalsCardProps> = ({ chamaId }) => {
  const { pendingApprovals, loading, error, approveContribution } = useContributionApprovals(chamaId);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null);

  const handleApprove = async (approvalId: string) => {
    await approveContribution(approvalId, true);
  };

  const handleReject = async (approvalId: string, reason: string) => {
    await approveContribution(approvalId, false, reason);
    setRejectionReason('');
    setSelectedApprovalId(null);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Pending Contribution Approvals
        </CardTitle>
        <CardDescription>
          {pendingApprovals.length} contributions awaiting your approval
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingApprovals.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p>All contributions have been processed!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingApprovals.map((approval) => (
              <div key={approval.approval_id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <User className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium">{approval.member_name}</p>
                      <p className="text-sm text-muted-foreground">{approval.member_email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <CurrencyDisplay 
                      amount={approval.amount}
                      className="text-xl font-bold"
                    />
                    <p className="text-sm text-muted-foreground">
                      {new Date(approval.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span>
                      <strong>Method:</strong> {approval.payment_method}
                    </span>
                  </div>
                  {approval.payment_reference && (
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span>
                        <strong>Ref:</strong> {approval.payment_reference}
                      </span>
                    </div>
                  )}
                </div>

                {approval.notes && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm">
                      <strong>Notes:</strong> {approval.notes}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleApprove(approval.approval_id)}
                    className="flex-1"
                    size="sm"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve
                  </Button>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        size="sm"
                        onClick={() => setSelectedApprovalId(approval.approval_id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reject Contribution</DialogTitle>
                        <DialogDescription>
                          Please provide a reason for rejecting this contribution
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="rejection-reason">Rejection Reason</Label>
                          <Textarea
                            id="rejection-reason"
                            placeholder="Explain why this contribution is being rejected..."
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            rows={4}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => {
                              setRejectionReason('');
                              setSelectedApprovalId(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            className="flex-1"
                            onClick={() => {
                              if (selectedApprovalId) {
                                handleReject(selectedApprovalId, rejectionReason);
                              }
                            }}
                            disabled={!rejectionReason.trim()}
                          >
                            Reject Contribution
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContributionApprovalsCard;
