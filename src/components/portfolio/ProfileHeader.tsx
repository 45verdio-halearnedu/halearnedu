
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader } from "@/components/ui/card";
import { MapPin, Briefcase, Calendar } from "lucide-react";
import { UserProfile } from '@/hooks/useUserProfile';

interface ProfileHeaderProps {
  profile: UserProfile;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  const getBadgeVariant = () => {
    if (profile.profile_type === 'investor' || profile.profile_type === 'lender') {
      return 'default';
    }
    return 'secondary';
  };

  const getProfileTypeDisplay = () => {
    switch (profile.profile_type) {
      case 'investor':
        return 'Investor';
      case 'lender':
        return 'Lender';
      case 'borrower':
        return 'Borrower';
      default:
        return profile.profile_type;
    }
  };

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback>
              {profile.display_name?.split(' ').map(n => n[0]).join('') || 'UN'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{profile.display_name || 'Anonymous User'}</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
              {profile.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile.location}
                </div>
              )}
              {profile.profession && (
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-1" />
                  {profile.profession}
                </div>
              )}
              {profile.experience_years && (
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {profile.experience_years} years experience
                </div>
              )}
            </div>
          </div>
          <Badge 
            variant={profile.verification_status === 'verified' ? 'default' : 'outline'}
            className="capitalize"
          >
            {profile.verification_status}
          </Badge>
        </div>
        {profile.bio && (
          <p className="text-gray-600 mt-4">{profile.bio}</p>
        )}
      </CardHeader>
    </Card>
  );
};

export default ProfileHeader;
