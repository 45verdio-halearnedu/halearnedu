
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, AlertTriangle, Target, Lock, Star } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface InvestmentInsight {
  id: string;
  insight_type: 'borrower_analysis' | 'market_trend' | 'risk_assessment' | 'recommendation';
  title: string;
  content: string;
  risk_score?: number;
  confidence_score?: number;
  target_user_id?: string;
  is_premium: boolean;
  created_at: string;
  expires_at?: string;
}

interface UserSubscription {
  id: string;
  subscription_type: 'premium_insights' | 'advanced_analytics';
  status: 'active' | 'cancelled' | 'expired';
  expires_at: string;
}

const InvestmentInsights: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');

  const { data: insights = [], isLoading: insightsLoading } = useQuery({
    queryKey: ['investment-insights', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('investment_insights')
        .select('*')
        .or(`target_user_id.is.null,target_user_id.eq.${user?.id}`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as InvestmentInsight[];
    },
    enabled: !!user
  });

  const { data: subscription } = useQuery({
    queryKey: ['user-subscription', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data as UserSubscription;
    },
    enabled: !!user
  });

  const handleSubscribeToPremium = async () => {
    if (!user) return;

    try {
      const expiresAt = new Date();
      expiresAt.setMonth(expiresAt.getMonth() + 1);

      const { error } = await supabase
        .from('user_subscriptions')
        .upsert({
          user_id: user.id,
          subscription_type: 'premium_insights',
          status: 'active',
          expires_at: expiresAt.toISOString()
        });

      if (error) throw error;

      toast({
        title: "Premium Activated!",
        description: "You now have access to premium AI insights.",
      });
    } catch (error) {
      console.error('Error subscribing to premium:', error);
      toast({
        title: "Error",
        description: "Failed to activate premium subscription",
        variant: "destructive",
      });
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'borrower_analysis': return <Target className="h-4 w-4" />;
      case 'market_trend': return <TrendingUp className="h-4 w-4" />;
      case 'risk_assessment': return <AlertTriangle className="h-4 w-4" />;
      case 'recommendation': return <Brain className="h-4 w-4" />;
      default: return <Brain className="h-4 w-4" />;
    }
  };

  const getRiskColor = (riskScore?: number) => {
    if (!riskScore) return 'bg-gray-100 text-gray-800';
    if (riskScore <= 3) return 'bg-green-100 text-green-800';
    if (riskScore <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRiskLabel = (riskScore?: number) => {
    if (!riskScore) return 'Unknown';
    if (riskScore <= 3) return 'Low Risk';
    if (riskScore <= 6) return 'Medium Risk';
    return 'High Risk';
  };

  const filteredInsights = insights.filter(insight => {
    if (activeTab === 'all') return true;
    return insight.insight_type === activeTab;
  });

  const isPremiumUser = subscription?.status === 'active';

  if (!user) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">Sign In Required</h3>
          <p className="text-gray-600">Please sign in to access AI-powered investment insights.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{insights.length}</div>
            <p className="text-xs text-muted-foreground">
              Available insights
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Premium Status</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isPremiumUser ? 'Active' : 'Free'}
            </div>
            <p className="text-xs text-muted-foreground">
              {isPremiumUser ? 'Premium insights unlocked' : 'Limited access'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confidence Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {insights.length > 0 
                ? Math.round((insights.reduce((acc, i) => acc + (i.confidence_score || 0), 0) / insights.length) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average accuracy
            </p>
          </CardContent>
        </Card>
      </div>

      {!isPremiumUser && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Upgrade to Premium
            </CardTitle>
            <CardDescription>
              Unlock advanced AI insights, personalized recommendations, and real-time market analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSubscribeToPremium} className="bg-yellow-600 hover:bg-yellow-700">
              Upgrade Now - $29/month
            </Button>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Insights</TabsTrigger>
          <TabsTrigger value="market_trend">Market Trends</TabsTrigger>
          <TabsTrigger value="risk_assessment">Risk Analysis</TabsTrigger>
          <TabsTrigger value="recommendation">Recommendations</TabsTrigger>
          <TabsTrigger value="borrower_analysis">Borrower Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredInsights.map((insight) => (
              <Card key={insight.id} className="relative">
                {insight.is_premium && !isPremiumUser && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600 font-medium">Premium Content</p>
                      <Button size="sm" className="mt-2" onClick={handleSubscribeToPremium}>
                        Upgrade
                      </Button>
                    </div>
                  </div>
                )}
                
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getInsightIcon(insight.insight_type)}
                      {insight.is_premium && (
                        <Badge variant="secondary" className="text-xs">
                          Premium
                        </Badge>
                      )}
                    </div>
                    {insight.risk_score && (
                      <Badge className={getRiskColor(insight.risk_score)}>
                        {getRiskLabel(insight.risk_score)}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{insight.title}</CardTitle>
                  {insight.confidence_score && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Confidence:</span>
                      <Badge variant="outline">
                        {Math.round(insight.confidence_score * 100)}%
                      </Badge>
                    </div>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{insight.content}</p>
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>
                      {new Date(insight.created_at).toLocaleDateString()}
                    </span>
                    {insight.expires_at && (
                      <span>
                        Expires: {new Date(insight.expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvestmentInsights;
