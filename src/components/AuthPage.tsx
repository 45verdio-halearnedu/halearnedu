
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SignInForm from './auth/SignInForm';
import SignUpForm from './auth/SignUpForm';
import ForgotPasswordForm from './auth/ForgotPasswordForm';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profileType, setProfileType] = useState<'borrower' | 'investor' | 'lender' | ''>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        console.log('Attempting to sign in with:', email);
        
        // Clear any previous sessions first
        await supabase.auth.signOut();
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        
        console.log('Sign in response:', { data, error });
        
        if (error) {
          console.error('Sign in error:', error);
          throw error;
        }
        
        console.log('Sign in successful:', data);
        
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        
      } else {
        // Validate required fields for sign up
        if (!profileType) {
          toast({
            title: "Error",
            description: "Please select your role (Borrower, Investor, or Lender)",
            variant: "destructive",
          });
          return;
        }

        if (!displayName.trim()) {
          toast({
            title: "Error",
            description: "Please enter your display name",
            variant: "destructive",
          });
          return;
        }

        if (!phoneNumber.trim()) {
          toast({
            title: "Error",
            description: "Please enter your phone number",
            variant: "destructive",
          });
          return;
        }

        console.log('Attempting to sign up with:', email, 'Role:', profileType, 'Phone:', phoneNumber);
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              display_name: displayName.trim(),
              profile_type: profileType,
              phone_number: phoneNumber.trim()
            }
          }
        });
        
        console.log('Sign up response:', { data, error });
        
        if (error) {
          console.error('Sign up error:', error);
          throw error;
        }
        
        // Check if user was created successfully
        if (data.user) {
          // Create user profile after successful signup
          try {
            const { error: profileError } = await supabase
              .from('user_profiles')
              .insert({
                user_id: data.user.id,
                display_name: displayName.trim(),
                profile_type: profileType
              });

            if (profileError) {
              console.error('Profile creation error:', profileError);
            }

            // Create or update the profiles table with phone number
            try {
              const { error: profilesError } = await supabase
                .from('profiles')
                .upsert({
                  user_id: data.user.id,
                  email: email.trim(),
                  phone_number: phoneNumber.trim(),
                  full_name: displayName.trim()
                });

              if (profilesError) {
                console.error('Profiles table update error:', profilesError);
              }
            } catch (profilesErr) {
              console.warn('Profiles table update failed:', profilesErr);
            }

          } catch (profileErr) {
            console.error('Profile creation failed:', profileErr);
          }

          if (data.session) {
            // User is immediately signed in (email confirmation disabled)
            toast({
              title: "Account created successfully!",
              description: `Welcome to LendChain as a ${profileType}. Your phone number has been saved.`,
            });
          } else {
            // Email confirmation is required
            toast({
              title: "Account created!",
              description: "Your account has been created. You can now sign in with your email and password.",
            });
            // Automatically switch to sign in mode
            setIsLogin(true);
          }
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      let errorMessage = error.message;
      
      // Provide more helpful error messages
      if (error.message === 'Invalid login credentials') {
        errorMessage = "The email or password you entered is incorrect. Please check your credentials and try again.";
      } else if (error.message === 'Email not confirmed') {
        errorMessage = "Your account exists but email confirmation is required. Please check your email or contact support.";
      } else if (error.message === 'User not found') {
        errorMessage = "No account found with this email address. Please sign up first.";
      } else if (error.message.includes('User already registered')) {
        errorMessage = "An account with this email already exists. Please sign in instead.";
        setIsLogin(true);
      } else if (error.message.includes('Password should be')) {
        errorMessage = "Password must be at least 6 characters long.";
      }
      
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });
      
      if (error) throw error;
      
      toast({
        title: "Password reset email sent!",
        description: "Check your email for a password reset link.",
      });
      setIsForgotPassword(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCardTitle = () => {
    if (isForgotPassword) return "Reset Password";
    return "LendChain";
  };

  const getCardDescription = () => {
    if (isForgotPassword) return "Enter your email to receive a password reset link";
    return isLogin ? 'Sign in to your account' : 'Create a new account';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{getCardTitle()}</CardTitle>
          <CardDescription>{getCardDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          {isForgotPassword ? (
            <ForgotPasswordForm
              email={email}
              loading={loading}
              onEmailChange={setEmail}
              onSubmit={handleForgotPassword}
              onBackToLogin={() => setIsForgotPassword(false)}
            />
          ) : isLogin ? (
            <SignInForm
              email={email}
              password={password}
              loading={loading}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onSubmit={handleAuth}
              onForgotPassword={() => setIsForgotPassword(true)}
            />
          ) : (
            <SignUpForm
              email={email}
              password={password}
              displayName={displayName}
              phoneNumber={phoneNumber}
              profileType={profileType}
              loading={loading}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onDisplayNameChange={setDisplayName}
              onPhoneNumberChange={setPhoneNumber}
              onProfileTypeChange={setProfileType}
              onSubmit={handleAuth}
            />
          )}
          
          {!isForgotPassword && (
            <div className="mt-4 text-center">
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm"
              >
                {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
