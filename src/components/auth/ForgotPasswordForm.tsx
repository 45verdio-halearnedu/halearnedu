
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ForgotPasswordFormProps {
  email: string;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBackToLogin: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  email,
  loading,
  onEmailChange,
  onSubmit,
  onBackToLogin
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
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Sending...' : 'Send Reset Link'}
      </Button>
      
      <div className="mt-4 text-center">
        <Button
          type="button"
          variant="link"
          onClick={onBackToLogin}
          className="text-sm"
        >
          Back to login
        </Button>
      </div>
    </form>
  );
};

export default ForgotPasswordForm;
