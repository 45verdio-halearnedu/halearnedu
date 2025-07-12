
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, Camera, Shield, HelpCircle, LogOut, Settings, Phone, Mail, MapPin, Edit } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ChamaProfileProps {
  chamaData: any;
  isTreasurer: boolean;
  chamaId: string;
}

const ChamaProfile: React.FC<ChamaProfileProps> = ({ chamaData, isTreasurer, chamaId }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAction = (action: string) => {
    toast({
      title: "Feature Coming Soon",
      description: `${action} feature will be available soon!`,
    });
  };

  const handleLogout = () => {
    toast({
      title: "Logout",
      description: "Logout functionality will be implemented soon!",
    });
  };

  // Mock user data - in real app this would come from user profile
  const userProfile = {
    name: "John Doe",
    email: user?.email || "john.doe@example.com",
    phone: "+254 712 345 678",
    address: "Nairobi, Kenya",
    verdioId: "VD" + Math.random().toString(36).substr(2, 8).toUpperCase(),
    joinDate: "January 2024",
    avatar: null
  };

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle className="h-5 w-5" />
            My Profile
          </CardTitle>
          <CardDescription>Manage your account information and settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-6">
            <div className="relative">
              <Avatar className="h-20 w-20">
                <AvatarImage src={userProfile.avatar || undefined} />
                <AvatarFallback className="text-lg">
                  {userProfile.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="sm" 
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                onClick={() => handleAction("Update Profile Picture")}
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{userProfile.name}</h3>
              <p className="text-muted-foreground">{userProfile.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <Badge variant="outline">Verdio ID: {userProfile.verdioId}</Badge>
                <Badge variant="secondary">Member since {userProfile.joinDate}</Badge>
              </div>
            </div>

            <Button 
              variant="outline" 
              onClick={() => handleAction("Edit Profile")}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>View and update your personal details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <UserCircle className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Full Name</p>
                  <p className="text-sm text-muted-foreground">{userProfile.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email Address</p>
                  <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Phone Number</p>
                  <p className="text-sm text-muted-foreground">{userProfile.phone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-sm text-muted-foreground">{userProfile.address}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Account Settings
          </CardTitle>
          <CardDescription>Manage your account preferences and security</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="justify-start h-12"
              onClick={() => handleAction("Security Settings")}
            >
              <Shield className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Security Settings</p>
                <p className="text-xs text-muted-foreground">Change password, manage devices</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="justify-start h-12"
              onClick={() => handleAction("Notification Settings")}
            >
              <Settings className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Notifications</p>
                <p className="text-xs text-muted-foreground">Manage notification preferences</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="justify-start h-12"
              onClick={() => handleAction("Privacy Settings")}
            >
              <UserCircle className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Privacy Settings</p>
                <p className="text-xs text-muted-foreground">Control data sharing</p>
              </div>
            </Button>

            <Button 
              variant="outline" 
              className="justify-start h-12"
              onClick={() => handleAction("Connected Accounts")}
            >
              <Phone className="h-5 w-5 mr-3" />
              <div className="text-left">
                <p className="font-medium">Connected Accounts</p>
                <p className="text-xs text-muted-foreground">M-Pesa, Bank accounts</p>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Support & Help */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help & Support
          </CardTitle>
          <CardDescription>Get help and support for your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button 
              variant="outline"
              onClick={() => handleAction("Help Center")}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help Center
            </Button>

            <Button 
              variant="outline"
              onClick={() => handleAction("Contact Support")}
            >
              <Mail className="h-4 w-4 mr-2" />
              Contact Support
            </Button>

            <Button 
              variant="outline"
              onClick={() => handleAction("FAQ")}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Frequently Asked Questions
            </Button>

            <Button 
              variant="outline"
              onClick={() => handleAction("User Guide")}
            >
              <Settings className="h-4 w-4 mr-2" />
              User Guide
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
          <CardDescription>Important account operations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-4">
            <Button 
              variant="destructive" 
              className="w-full md:w-auto"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout from Account
            </Button>
            
            <div className="text-sm text-muted-foreground">
              <p>Need to delete your account? Contact our support team for assistance.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChamaProfile;
