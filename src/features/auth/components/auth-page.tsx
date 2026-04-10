'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, LogIn, UserPlus, Loader2, Mail, Lock, User, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { Role } from '@/types';

const quickLoginOptions: { email: string; role: Role; label: string }[] = [
  { email: 'alex@neuronote.app', role: 'admin', label: 'Admin' },
  { email: 'sarah@neuronote.app', role: 'editor', label: 'Editor' },
  { email: 'emily@neuronote.app', role: 'viewer', label: 'Viewer' },
];

export function AuthPage() {
  const { login, signup, isLoading, appSettings, fetchAppSettings } = useAuthStore();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');

  const isSignupEnabled = appSettings?.publicSignupEnabled !== false;

  useEffect(() => {
    fetchAppSettings();
  }, [fetchAppSettings]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) return;
    const user = await login({ email: loginEmail, password: loginPassword });
    if (user) {
      toast.success(`Welcome back, ${user.name}!`);
    } else {
      toast.error('Login failed. Check your email or try another account.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim() || !signupEmail.trim()) return;
    const user = await signup({ name: signupName, email: signupEmail, password: signupPassword });
    if (user) {
      toast.success(`Welcome to NeuroNote, ${user.name}!`);
    } else {
      toast.error('Signup failed. This email may already be in use.');
    }
  };

  const handleQuickLogin = async (email: string) => {
    const user = await login({ email, password: 'demo' });
    if (user) {
      toast.success(`Logged in as ${user.name} (${user.role})`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground mb-4">
            <Brain className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold">NeuroNote</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-Powered Personal Knowledge OS
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className={cn('grid w-full', isSignupEnabled ? 'grid-cols-2' : 'grid-cols-1')}>
            <TabsTrigger value="login" className="gap-1.5">
              <LogIn className="w-3.5 h-3.5" />
              Login
            </TabsTrigger>
            {isSignupEnabled && (
              <TabsTrigger value="signup" className="gap-1.5">
                <UserPlus className="w-3.5 h-3.5" />
                Sign Up
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Welcome back</CardTitle>
                <CardDescription>
                  Log in to access your knowledge base
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@neuronote.app"
                        className="pl-8"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="Any password works (demo)"
                        className="pl-8"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gap-1.5" disabled={isLoading || !loginEmail.trim()}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                    Log In
                  </Button>
                </form>

                {/* Quick Login */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Quick Demo Login
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    {quickLoginOptions.map((option) => (
                      <Button
                        key={option.email}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => handleQuickLogin(option.email)}
                        disabled={isLoading}
                      >
                        <User className="w-3 h-3 mr-1" />
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            {!isSignupEnabled ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center py-8 text-center">
                    <ShieldCheck className="w-10 h-10 text-muted-foreground/40 mb-3" />
                    <h3 className="text-lg font-semibold">Signup Disabled</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                      Public registration is currently disabled. Please contact an administrator for an invitation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
              <CardHeader>
                <CardTitle className="text-lg">Create an account</CardTitle>
                <CardDescription>
                  Join as a Viewer — Admins can promote you later
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        placeholder="Your name"
                        className="pl-8"
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-8"
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Choose a password"
                        className="pl-8"
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full gap-1.5" disabled={isLoading || !signupName.trim() || !signupEmail.trim()}>
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    Create Account
                  </Button>
                  <p className="text-[11px] text-muted-foreground text-center">
                    New accounts are created with Viewer role. Admins can promote you to Editor.
                  </p>
                </form>
              </CardContent>
            </Card>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}
