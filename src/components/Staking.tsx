
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Coins, Clock, DollarSign } from "lucide-react";
import { useStaking } from '@/hooks/useStaking';
import { useMobileMoney } from '@/hooks/useMobileMoney';
import StakeDialog from './StakeDialog';
import MobileMoneySetup from './MobileMoneySetup';

const Staking: React.FC = () => {
  const { stakingPools, userStakes, loading } = useStaking();
  const { accounts: mobileAccounts } = useMobileMoney();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Staking</h1>
        </div>
        <div className="text-center py-12">Loading staking pools...</div>
      </div>
    );
  }

  const totalStaked = userStakes.reduce((sum, stake) => sum + stake.amount, 0);
  const totalRewards = userStakes.reduce((sum, stake) => sum + (stake.rewards_earned || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Staking</h1>
        {mobileAccounts.length === 0 && <MobileMoneySetup />}
      </div>

      {/* Staking Overview */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {(totalStaked * 130).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across {userStakes.length} pool{userStakes.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rewards Earned</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KES {(totalRewards * 130).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time earnings</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average APY</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userStakes.length > 0 
                ? (userStakes.reduce((sum, stake) => sum + stake.staking_pools.apy, 0) / userStakes.length).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Weighted average</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pools" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pools">Available Pools</TabsTrigger>
          <TabsTrigger value="my-stakes">My Stakes</TabsTrigger>
        </TabsList>

        <TabsContent value="pools" className="pt-6">
          <div className="grid gap-6">
            {stakingPools.map((pool) => (
              <Card key={pool.id} className="border-0 shadow-sm">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {pool.name}
                        <Badge variant="outline">KES</Badge>
                      </CardTitle>
                      <CardDescription>
                        Minimum stake: KES {(pool.min_stake * 130).toLocaleString()} • Maximum stake: {pool.max_stake ? `KES ${(pool.max_stake * 130).toLocaleString()}` : 'No limit'}
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">{pool.apy}% APY</div>
                      <p className="text-sm text-gray-500">Annual yield</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">Total Staked</p>
                      <p className="font-medium">KES {((pool.total_staked || 0) * 130).toLocaleString()}</p>
                    </div>
                    <StakeDialog pool={pool} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-stakes" className="pt-6">
          {userStakes.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="text-center py-12">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Stakes</h3>
                <p className="text-gray-500 mb-6">You haven't staked any funds yet</p>
                <Button className="bg-loan-primary hover:bg-blue-600">
                  Browse Staking Pools
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {userStakes.map((stake) => (
                <Card key={stake.id} className="border-0 shadow-sm">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {stake.staking_pools.name}
                          <Badge variant="outline">KES</Badge>
                        </CardTitle>
                        <CardDescription>
                          Staked on {new Date(stake.stake_date).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold">KES {(stake.amount * 130).toLocaleString()}</div>
                        <p className="text-sm text-gray-500">{stake.staking_pools.apy}% APY</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Rewards Earned</p>
                        <p className="font-medium text-green-600">KES {((stake.rewards_earned || 0) * 130).toLocaleString()}</p>
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">
                          Withdraw
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Staking;
