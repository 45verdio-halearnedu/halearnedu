import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone_number: string | null;
  country: string | null;
  credit_score: number;
  loan_eligibility: number;
}

const Settings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formState, setFormState] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    country: "",
    walletAddress: "0x71C...A3F8",
    emailNotifications: true,
    pushNotifications: false,
  });

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setProfile(data);
        setFormState({
          fullName: data.full_name || "",
          email: data.email || "",
          phoneNumber: data.phone_number || "",
          country: data.country || "",
          walletAddress: "0x71C...A3F8",
          emailNotifications: true,
          pushNotifications: false,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormState(prev => ({ ...prev, [name]: checked }));
  };

  const saveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const profileData = {
        user_id: user.id,
        full_name: formState.fullName,
        email: formState.email,
        phone_number: formState.phoneNumber,
        country: formState.country,
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });

      fetchProfile();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-6">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <Button onClick={saveProfile} disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-3 md:inline-flex">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="wallet">Wallet</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="profile" className="pt-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your KYC details to access higher loan amounts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    placeholder="Enter your full name" 
                    value={formState.fullName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email" 
                    placeholder="Enter your email" 
                    value={formState.email}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input 
                    id="phoneNumber" 
                    name="phoneNumber" 
                    placeholder="Enter your phone number" 
                    value={formState.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input 
                    id="country" 
                    name="country" 
                    placeholder="Enter your country" 
                    value={formState.country}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium text-base mb-4">Credit Score</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <p className="text-sm text-gray-500 mb-1">Current Score</p>
                    <p className="font-semibold text-2xl">{profile?.credit_score || 720}</p>
                    <p className="text-sm text-gray-500 mt-2">Good standing</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border">
                    <p className="text-sm text-gray-500 mb-1">Loan Eligibility</p>
                    <p className="font-semibold text-2xl">Up to {profile?.loan_eligibility || 10000} USDC</p>
                    <p className="text-sm text-gray-500 mt-2">Complete KYC for higher limits</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="wallet" className="pt-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Connected Wallets</CardTitle>
              <CardDescription>Manage your linked blockchain wallets</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Primary Wallet</p>
                  <p className="text-sm text-gray-500">{formState.walletAddress}</p>
                </div>
                <Button variant="outline" size="sm">Disconnect</Button>
              </div>
              
              <div>
                <Button className="bg-loan-primary hover:bg-blue-600">
                  Connect Another Wallet
                </Button>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-medium text-base mb-4">Security Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="requireConfirmation">Transaction Confirmation</Label>
                      <p className="text-sm text-gray-500">
                        Require email confirmation for large transactions
                      </p>
                    </div>
                    <Switch id="requireConfirmation" checked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="autoLockWallet">Auto-Lock Wallet</Label>
                      <p className="text-sm text-gray-500">
                        Automatically disconnect wallet after 30 minutes of inactivity
                      </p>
                    </div>
                    <Switch id="autoLockWallet" checked={true} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="pt-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Control how you receive updates about your loans</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive loan updates via email
                    </p>
                  </div>
                  <Switch 
                    id="emailNotifications" 
                    checked={formState.emailNotifications}
                    onCheckedChange={(checked) => handleSwitchChange('emailNotifications', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                    <p className="text-sm text-gray-500">
                      Receive loan updates via push notifications
                    </p>
                  </div>
                  <Switch 
                    id="pushNotifications" 
                    checked={formState.pushNotifications}
                    onCheckedChange={(checked) => handleSwitchChange('pushNotifications', checked)}
                  />
                </div>
              </div>

              <div className="pt-4 border-t space-y-4">
                <h3 className="font-medium text-base">Notification Types</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0">
                    <p className="font-medium">Loan Status Changes</p>
                    <p className="text-sm text-gray-500">Updates when your loan status changes</p>
                  </div>
                  <Switch id="loanStatusNotifs" checked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0">
                    <p className="font-medium">Payment Reminders</p>
                    <p className="text-sm text-gray-500">Reminders about upcoming loan payments</p>
                  </div>
                  <Switch id="paymentReminders" checked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0">
                    <p className="font-medium">Marketplace Updates</p>
                    <p className="text-sm text-gray-500">Updates on marketplace activity related to your loans</p>
                  </div>
                  <Switch id="marketplaceUpdates" checked={false} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
