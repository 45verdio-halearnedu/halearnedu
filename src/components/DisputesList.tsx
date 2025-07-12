
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Dispute {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
}

interface DisputesListProps {
  disputes: Dispute[];
}

const DisputesList: React.FC<DisputesListProps> = ({ disputes }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (disputes.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="text-center py-8">
          <p className="text-gray-500">No disputes found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {disputes.map((dispute) => (
        <Card key={dispute.id} className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">{dispute.title}</CardTitle>
                <CardDescription>
                  Created on {new Date(dispute.created_at).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge className={getStatusColor(dispute.status)}>
                {dispute.status.replace('_', ' ')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{dispute.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DisputesList;
