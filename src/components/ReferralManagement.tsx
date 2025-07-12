
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Copy, Share2, Gift, Users, DollarSign } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface Referral {
  id: string;
  referral_code: string;
  bonus_earned: number;
  status: string;
  created_at: string;
  completed_at: string | null;
}

const ReferralManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');

  const { data: referrals = [], isLoading } = useQuery({
    queryKey: ['my-referrals', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('user_referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Referral[];
    },
    enabled: !!user
  });

  const { data: referralCode } = useQuery({
    queryKey: ['my-referral-code', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Generate a referral code for the user if they don't have one
      const { data } = await supabase.rpc('generate_referral_code');
      return data;
    },
    enabled: !!user
  });

  const createReferralMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!user) throw new Error('Not authenticated');

      // Check if user exists
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email)
        .single();

      if (!existingUser) {
        throw new Error('User with this email does not exist on the platform');
      }

      // Check if referral already exists
      const { data: existingReferral } = await supabase
        .from('user_referrals')
        .select('id')
        .eq('referrer_id', user.id)
        .eq('referred_id', existingUser.user_id)
        .single();

      if (existingReferral) {
        throw new Error('You have already referred this user');
      }

      // Create referral
      const { data, error } = await supabase
        .from('user_referrals')
        .insert({
          referrer_id: user.id,
          referred_id: existingUser.user_id,
          referral_code: referralCode || 'REF' + Math.random().toString(36).substr(2, 8).toUpperCase(),
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-referrals'] });
      toast({
        title: "Referral Created!",
        description: "Your referral has been recorded. You'll earn a bonus when they complete their first loan transaction.",
      });
      setEmail('');
    },
    onError: (error: any) => {
      console.error('Referral error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create referral",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    createReferralMutation.mutate(email);
  };

  const copyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    }
  };

  const shareReferralLink = () => {
    const referralLink = `${window.location.origin}?ref=${referralCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Join LendChain',
        text: 'Join me on LendChain and start your peer-to-peer lending journey!',
        url: referralLink,
      });
    } else {
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link Copied!",
        description: "Referral link copied to clipboard",
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const stats = {
    totalReferrals: referrals.length,
    pendingReferrals: referrals.filter(r => r.status === 'pending').length,
    completedReferrals: referrals.filter(r => r.status === 'completed').length,
    totalEarned: referrals.reduce((sum, r) => sum + (r.bonus_earned || 0), 0)
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">Referral Program</h2>
        <p className="text-gray-600">Earn rewards by inviting friends to join LendChain</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats.totalEarned}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
            <CardDescription>Share this code with friends to earn rewards</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Input value={referralCode || 'Loading...'} readOnly className="font-mono" />
              <Button variant="outline" size="sm" onClick={copyReferralCode}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex space-x-2">
              <Button onClick={shareReferralLink} className="flex-1">
                <Share2 className="h-4 w-4 mr-2" />
                Share Link
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">How it works:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Share your referral code with friends</li>
                <li>• Earn $50 when they complete their first loan transaction</li>
                <li>• Your friend also gets a $25 bonus</li>
                <li>• No limit on referrals!</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Create Referral</CardTitle>
            <CardDescription>Enter a friend's email to create a referral</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Friend's Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="friend@example.com"
                  required
                />
              </div>
              
              <Button type="submit" disabled={createReferralMutation.isPending} className="w-full">
                {createReferralMutation.isPending ? 'Creating...' : 'Create Referral'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Referrals</CardTitle>
          <CardDescription>Track your referral history and earnings</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      R
                    </div>
                    <div>
                      <p className="font-medium">{referral.referral_code}</p>
                      <p className="text-sm text-gray-500">
                        {formatDate(referral.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${referral.bonus_earned}</p>
                    <Badge variant={referral.status === 'completed' ? 'default' : 'secondary'}>
                      {referral.status}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {referrals.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Gift className="h-8 w-8 mx-auto mb-2" />
                  <p>No referrals yet</p>
                  <p className="text-sm">Start referring friends to earn rewards!</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralManagement;
