
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, MapPin, Calendar, Users, Target, AlertTriangle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CurrencyDisplay from '@/components/CurrencyDisplay';

const MicroInvestmentsPage: React.FC = () => {
  const { toast } = useToast();
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [investmentAmount, setInvestmentAmount] = useState('');

  // Mock data - will be replaced with actual Supabase queries
  const investmentProjects = [
    {
      id: '1',
      title: 'Mama Pima Tailoring Business',
      description: 'Expansion of tailoring business with new sewing machines and materials',
      category: 'Fashion & Retail',
      location: 'Nairobi, Kenya',
      targetAmount: 500000,
      currentFunding: 325000,
      minimumInvestment: 1000,
      projectedROI: 15,
      riskScore: 3,
      durationMonths: 12,
      investorCount: 23,
      status: 'open',
      businessOwner: 'Grace Wanjiku',
      fundingDeadline: '2024-02-15'
    },
    {
      id: '2',
      title: 'Organic Vegetable Farm',
      description: 'Start organic vegetable farming with greenhouse technology',
      category: 'Agriculture',
      location: 'Kiambu, Kenya',
      targetAmount: 800000,
      currentFunding: 480000,
      minimumInvestment: 2000,
      projectedROI: 20,
      riskScore: 4,
      durationMonths: 18,
      investorCount: 31,
      status: 'open',
      businessOwner: 'John Kamau',
      fundingDeadline: '2024-01-30'
    },
    {
      id: '3',
      title: 'Mobile Repair Shop',
      description: 'Equipment and tools for mobile phone repair business',
      category: 'Technology',
      location: 'Mombasa, Kenya',
      targetAmount: 300000,
      currentFunding: 300000,
      minimumInvestment: 500,
      projectedROI: 18,
      riskScore: 2,
      durationMonths: 8,
      investorCount: 45,
      status: 'funded',
      businessOwner: 'Ahmed Hassan',
      fundingDeadline: '2024-01-01'
    }
  ];

  const myInvestments = [
    {
      id: '1',
      projectTitle: 'Mama Pima Tailoring Business',
      amountInvested: 5000,
      sharesPercentage: 1.54,
      currentValue: 5200,
      returnsEarned: 200,
      status: 'active'
    },
    {
      id: '3',
      projectTitle: 'Mobile Repair Shop',
      amountInvested: 2000,
      sharesPercentage: 0.67,
      currentValue: 2150,
      returnsEarned: 150,
      status: 'active'
    }
  ];

  const handleInvest = (projectId: string) => {
    if (!investmentAmount || parseFloat(investmentAmount) < 500) {
      toast({
        title: "Error",
        description: "Please enter a valid investment amount (minimum KES 500)",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Investment Successful",
      description: `You have invested KES ${investmentAmount} successfully`,
    });

    setInvestmentAmount('');
    setSelectedProject(null);
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore <= 3) return 'bg-green-500';
    if (riskScore <= 6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRiskText = (riskScore: number) => {
    if (riskScore <= 3) return 'Low Risk';
    if (riskScore <= 6) return 'Medium Risk';
    return 'High Risk';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Micro-Investments</h1>
        <Button variant="outline">
          Create Project
        </Button>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="projects">Investment Projects</TabsTrigger>
          <TabsTrigger value="my-investments">My Investments</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-4">
          <div className="grid gap-4">
            {investmentProjects.map((project) => {
              const fundingPercentage = (project.currentFunding / project.targetAmount) * 100;
              return (
                <Card key={project.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center gap-2">
                          {project.title}
                          <Badge variant={project.status === 'funded' ? 'default' : 'secondary'}>
                            {project.status}
                          </Badge>
                        </CardTitle>
                        <CardDescription className="mt-2">
                          {project.description}
                        </CardDescription>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {project.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {project.investorCount} investors
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {project.durationMonths} months
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${getRiskColor(project.riskScore)}`}></div>
                        <span className="text-xs">{getRiskText(project.riskScore)}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Funding Progress</span>
                          <span>{fundingPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={fundingPercentage} className="h-2" />
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <CurrencyDisplay amount={project.currentFunding} showToggle={false} />
                          <CurrencyDisplay amount={project.targetAmount} showToggle={false} />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground block">Minimum Investment</span>
                          <CurrencyDisplay amount={project.minimumInvestment} showToggle={false} className="font-medium" />
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Projected ROI</span>
                          <span className="font-medium flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            {project.projectedROI}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Business Owner</span>
                          <span className="font-medium">{project.businessOwner}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block">Deadline</span>
                          <span className="font-medium">{project.fundingDeadline}</span>
                        </div>
                      </div>

                      {project.status === 'open' && (
                        <div className="flex gap-2">
                          <Button 
                            onClick={() => setSelectedProject(project.id)}
                            disabled={selectedProject === project.id}
                          >
                            {selectedProject === project.id ? 'Investing...' : 'Invest Now'}
                          </Button>
                          <Button variant="outline">
                            View Details
                          </Button>
                        </div>
                      )}

                      {selectedProject === project.id && (
                        <div className="border-t pt-4 space-y-3">
                          <div>
                            <Label htmlFor="investment-amount">Investment Amount (KES)</Label>
                            <Input
                              id="investment-amount"
                              type="number"
                              value={investmentAmount}
                              onChange={(e) => setInvestmentAmount(e.target.value)}
                              placeholder={`Minimum: ${project.minimumInvestment}`}
                              min={project.minimumInvestment}
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button onClick={() => handleInvest(project.id)}>
                              Confirm Investment
                            </Button>
                            <Button variant="outline" onClick={() => setSelectedProject(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="my-investments" className="space-y-4">
          <div className="grid gap-4">
            {myInvestments.map((investment) => (
              <Card key={investment.id}>
                <CardHeader>
                  <CardTitle>{investment.projectTitle}</CardTitle>
                  <CardDescription>
                    Active investment with {investment.sharesPercentage}% ownership
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <span className="text-muted-foreground block text-sm">Amount Invested</span>
                      <CurrencyDisplay amount={investment.amountInvested} showToggle={false} className="font-medium" />
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-sm">Current Value</span>
                      <CurrencyDisplay amount={investment.currentValue} showToggle={false} className="font-medium" />
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-sm">Returns Earned</span>
                      <CurrencyDisplay amount={investment.returnsEarned} showToggle={false} className="font-medium text-green-600" />
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-sm">ROI</span>
                      <span className="font-medium text-green-600">
                        +{((investment.returnsEarned / investment.amountInvested) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CurrencyDisplay amount={7000} className="text-2xl font-bold" />
                <p className="text-xs text-muted-foreground">
                  Across 2 projects
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Current Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CurrencyDisplay amount={7350} className="text-2xl font-bold" />
                <p className="text-xs text-muted-foreground">
                  +5% overall return
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CurrencyDisplay amount={350} className="text-2xl font-bold text-green-600" />
                <p className="text-xs text-muted-foreground">
                  This month: +50
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MicroInvestmentsPage;
