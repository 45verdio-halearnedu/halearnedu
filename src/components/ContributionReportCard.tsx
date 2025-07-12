
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileBarChart, Download, Users } from 'lucide-react';
import { useContributionApprovals } from '@/hooks/useContributionApprovals';
import CurrencyDisplay from './CurrencyDisplay';
import { Button } from "@/components/ui/button";

interface ContributionReportCardProps {
  chamaId: string;
}

const ContributionReportCard: React.FC<ContributionReportCardProps> = ({ chamaId }) => {
  const { contributionReport, loading, error } = useContributionApprovals(chamaId);

  const exportToCSV = () => {
    if (contributionReport.length === 0) return;

    const headers = [
      'Member Name',
      'Email',
      'Phone',
      'Total Contributed',
      'Contribution Count',
      'Last Contribution',
      'Pending Amount',
      'Approved Amount',
      'Rejected Amount'
    ];

    const csvContent = [
      headers.join(','),
      ...contributionReport.map(member => [
        `"${member.member_name}"`,
        `"${member.member_email}"`,
        `"${member.member_phone}"`,
        member.total_contributed,
        member.contribution_count,
        member.last_contribution_date ? new Date(member.last_contribution_date).toLocaleDateString() : 'Never',
        member.pending_contributions,
        member.approved_contributions,
        member.rejected_contributions
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chama-contribution-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <FileBarChart className="h-5 w-5" />
              Contribution Report
            </CardTitle>
            <CardDescription>
              Detailed member contribution statistics and status
            </CardDescription>
          </div>
          <Button
            onClick={exportToCSV}
            variant="outline"
            size="sm"
            disabled={contributionReport.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {contributionReport.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No contribution data available</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="text-right">Total Contributed</TableHead>
                  <TableHead className="text-center">Count</TableHead>
                  <TableHead>Last Contribution</TableHead>
                  <TableHead className="text-right">Pending</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contributionReport.map((member) => (
                  <TableRow key={member.member_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{member.member_name}</p>
                        <p className="text-sm text-muted-foreground">ID: {member.member_id.slice(0, 8)}...</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{member.member_email}</p>
                        <p className="text-muted-foreground">{member.member_phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <CurrencyDisplay amount={member.total_contributed} />
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{member.contribution_count}</Badge>
                    </TableCell>
                    <TableCell>
                      {member.last_contribution_date ? (
                        <div className="text-sm">
                          <p>{new Date(member.last_contribution_date).toLocaleDateString()}</p>
                          <p className="text-muted-foreground">
                            {Math.floor((Date.now() - new Date(member.last_contribution_date).getTime()) / (1000 * 60 * 60 * 24))} days ago
                          </p>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {member.pending_contributions > 0 ? (
                        <div>
                          <CurrencyDisplay amount={member.pending_contributions} className="text-orange-600" />
                          <Badge variant="outline" className="text-xs mt-1">
                            Pending
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="space-y-1">
                        {member.approved_contributions > 0 && (
                          <div className="text-sm text-green-600">
                            <CurrencyDisplay amount={member.approved_contributions} /> approved
                          </div>
                        )}
                        {member.rejected_contributions > 0 && (
                          <div className="text-sm text-red-600">
                            <CurrencyDisplay amount={member.rejected_contributions} /> rejected
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContributionReportCard;
