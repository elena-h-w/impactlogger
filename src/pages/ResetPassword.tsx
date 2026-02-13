import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Must contain at least one number')
  .regex(/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/'`~]/, 'Must contain at least one special character');

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingLink, setCheckingLink] = useState(true);
  const [hasRecoverySession, setHasRecoverySession] = useState(false);

  const navigate = useNavigate();

  const passwordErrors = useMemo(() => {
    if (!password) return [];
    try {
      passwordSchema.parse(password);
      return [];
    } catch (e) {
      if (e instanceof z.ZodError) return e.errors.map((x) => x.message);
      return ['Invalid password'];
    }
  }, [password]);

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      // If the user landed here from a Supabase recovery link,
      // Supabase should have a session (or emit PASSWORD_RECOVERY).
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      if (data.session) {
        setHasRecoverySession(true);
        setCheckingLink(false);
        return;
      }

      // Listen briefly for the recovery event (helps across some browsers/providers).
      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (!mounted) return;
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
          setHasRecoverySession(true);
          setCheckingLink(false);
        }
      });

      // If nothing happens quickly, assume user didn’t come from a valid link
      // (or the redirect URL isn’t allowed in Supabase settings).
      setTimeout(async () => {
        if (!mounted) return;

        const { data: after } = await supabase.auth.getSession();
        if (after.session) {
          setHasRecoverySession(true);
        } else {
          setHasRecoverySession(false);
        }
        setCheckingLink(false);
      }, 800);

      return () => sub.subscription.unsubscribe();
    };

    const cleanupPromise = check();

    return () => {
      mounted = false;
      // cleanup listener if check() returned it
      Promise.resolve(cleanupPromise).then((cleanup) => {
        if (typeof cleanup === 'function') cleanup();
      });
    };
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasRecoverySession) {
      toast.error('This reset link is invalid or expired. Please request a new password reset email.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (passwordErrors.length > 0) {
      toast.error(passwordErrors[0]); // show first error as toast
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      toast.success('Password updated successfully!');
      navigate('/');
    } catch (error: any) {
      console.error('[reset password]', error);
      toast.error('Failed to update password. Please request a new reset link and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingLink) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            {hasRecoverySession
              ? 'Enter a new password for your account.'
              : 'This page must be opened from a password reset link emailed to you.'}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {!hasRecoverySession ? (
            <div className="space-y-4">
              <Button className="w-full" onClick={() => navigate('/auth')}>
                Go back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="new-password"
                />

                {passwordErrors.length > 0 && (
                  <ul className="text-sm text-destructive space-y-1">
                    {passwordErrors.map((msg, idx) => (
                      <li key={idx}>• {msg}</li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  autoComplete="new-password"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}