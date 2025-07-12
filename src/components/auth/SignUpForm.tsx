
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SignUpFormProps {
  email: string;
  password: string;
  displayName: string;
  phoneNumber: string;
  profileType: 'borrower' | 'investor' | 'lender' | '';
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onDisplayNameChange: (name: string) => void;
  onPhoneNumberChange: (phone: string) => void;
  onProfileTypeChange: (type: 'borrower' | 'investor' | 'lender') => void;
  onSubmit: (e: React.FormEvent) => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({
  email,
  password,
  displayName,
  phoneNumber,
  profileType,
  loading,
  onEmailChange,
  onPasswordChange,
  onDisplayNameChange,
  onPhoneNumberChange,
  onProfileTypeChange,
  onSubmit
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name</Label>
        <Input
          id="displayName"
          type="text"
          value={displayName}
          onChange={(e) => onDisplayNameChange(e.target.value)}
          placeholder="Enter your display name"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="Enter your email address"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          required
          minLength={6}
          placeholder="Enter your password"
        />
        <p className="text-xs text-gray-500">
          Password must be at least 6 characters long
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phoneNumber">Phone Number</Label>
        <Input
          id="phoneNumber"
          type="tel"
          value={phoneNumber}
          onChange={(e) => onPhoneNumberChange(e.target.value)}
          placeholder="Enter your phone number"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="profileType">I want to sign up as</Label>
        <Select onValueChange={(value) => onProfileTypeChange(value as 'borrower' | 'investor' | 'lender')}>
          <SelectTrigger>
            <SelectValue placeholder="Select your role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="borrower">Borrower - I need funding</SelectItem>
            <SelectItem value="investor">Investor - I want to fund loans</SelectItem>
            <SelectItem value="lender">Lender - I provide loans directly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={loading || !profileType}>
        {loading ? 'Please wait...' : 'Create Account'}
      </Button>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          Choose your role to access the right features for your needs. You can apply for loans as a Borrower, or fund and manage loans as an Investor or Lender.
        </p>
      </div>
    </form>
  );
};

export default SignUpForm;
