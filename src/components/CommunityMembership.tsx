
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Crown, Users, Gift, MessageCircle, Star, Check } from 'lucide-react';
import CurrencyDisplay from './CurrencyDisplay';

interface MembershipTier {
  id: string;
  name: string;
  price: number;
  duration: string;
  features: string[];
  icon: React.ReactNode;
  popular?: boolean;
}

const CommunityMembership: React.FC = () => {
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<string>('');

  const membershipTiers: MembershipTier[] = [
    {
      id: 'basic',
      name: 'Community Member',
      price: 500, // KES
      duration: 'per month',
      icon: <Users className="h-6 w-6" />,
      features: [
        'Access to community forums',
        'Basic financial education content',
        'Monthly newsletters',
        'Standard customer support'
      ]
    },
    {
      id: 'premium',
      name: 'Premium Member',
      price: 1200, // KES
      duration: 'per month',
      icon: <Star className="h-6 w-6" />,
      popular: true,
      features: [
        'All Community Member benefits',
        'Exclusive investment opportunities',
        'Priority loan processing',
        'Advanced analytics dashboard',
        'Weekly market insights',
        'Premium customer support'
      ]
    },
    {
      id: 'vip',
      name: 'VIP Member',
      price: 2500, // KES
      duration: 'per month',
      icon: <Crown className="h-6 w-6" />,
      features: [
        'All Premium Member benefits',
        'Personal financial advisor',
        '1-on-1 consultation sessions',
        'Early access to new features',
        'Exclusive VIP community',
        'Custom investment strategies',
        'White-glove support'
      ]
    }
  ];

  const handleSubscribe = async (tierId: string, tierName: string, price: number) => {
    setSelectedTier(tierId);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Subscription Successful!",
        description: `Welcome to ${tierName}! Your membership is now active.`,
      });
      
      setSelectedTier('');
    } catch (error) {
      toast({
        title: "Subscription Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
      setSelectedTier('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">Community Membership</h1>
        <p className="text-lg text-gray-600 mt-2">
          Join our exclusive community for enhanced features, rewards, and premium support
        </p>
      </div>

      {/* Membership Benefits Overview */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Membership Benefits
          </CardTitle>
          <CardDescription>
            Unlock exclusive features and connect with like-minded investors and borrowers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageCircle className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Exclusive Content</h4>
                <p className="text-sm text-gray-600">Access premium financial education and market insights</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Gift className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">Rewards & Perks</h4>
                <p className="text-sm text-gray-600">Earn points, discounts, and special privileges</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium">Premium Support</h4>
                <p className="text-sm text-gray-600">Priority customer service and dedicated assistance</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Membership Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {membershipTiers.map((tier) => (
          <Card key={tier.id} className={`relative ${tier.popular ? 'border-blue-500 shadow-lg' : ''}`}>
            {tier.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                {tier.icon}
              </div>
              <CardTitle className="text-xl">{tier.name}</CardTitle>
              <div className="text-3xl font-bold">
                <CurrencyDisplay amount={tier.price} showToggle={false} />
              </div>
              <p className="text-gray-600 text-sm">{tier.duration}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {tier.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full" 
                variant={tier.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(tier.id, tier.name, tier.price)}
                disabled={selectedTier === tier.id}
              >
                {selectedTier === tier.id ? 'Processing...' : 'Subscribe Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Members Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Community Stats</CardTitle>
          <CardDescription>Join thousands of active community members</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">2,847</div>
              <p className="text-sm text-gray-600">Active Members</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">KSh 125M</div>
              <p className="text-sm text-gray-600">Total Funded</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">96%</div>
              <p className="text-sm text-gray-600">Success Rate</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">4.8/5</div>
              <p className="text-sm text-gray-600">Member Rating</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunityMembership;
