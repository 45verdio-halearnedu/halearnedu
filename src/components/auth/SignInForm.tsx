
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SignInFormProps {
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onForgotPassword: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({
  email,
  password,
  loading,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onForgotPassword
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
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
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Please wait...' : 'Sign In'}
      </Button>
      
      <div className="mt-4 text-center">
        <Button
          type="button"
          variant="link"
          onClick={onForgotPassword}
          className="text-sm text-blue-600"
        >
          Forgot your password?
        </Button>
      </div>
    </form>
  );
};

export default SignInForm;
