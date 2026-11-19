import React, { useState } from 'react';
import { LogIn, ShieldCheck, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Logo } from '../components/ui/Logo';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';

interface LoginPageProps {
  onNavigate: (route: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const { toast } = useNotification();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const sampleUsers = [
    ['Aarav Sharma','aarav.sample@skillswap.demo'], ['Isha Verma','isha.sample@skillswap.demo'],
    ['Kabir Mehta','kabir.sample@skillswap.demo'], ['Ananya Iyer','ananya.sample@skillswap.demo'],
    ['Vivaan Patel','vivaan.sample@skillswap.demo'], ['Meera Nair','meera.sample@skillswap.demo'],
    ['Arjun Singh','arjun.sample@skillswap.demo'], ['Sana Khan','sana.sample@skillswap.demo'],
    ['Rohan Das','rohan.sample@skillswap.demo'], ['Priya Joshi','priya.sample@skillswap.demo'],
  ];
  const chooseSample = (sampleEmail: string) => { setEmail(sampleEmail); setPassword('SkillSwap@123'); setError(''); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Email address is required');
      return;
    }
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      toast('Signed in successfully!', 'success');
      onNavigate('dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-10 text-text-primary">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center mb-1">
            <Logo size="lg" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading tracking-tight text-text-primary">
            Sign in to SkillSwap
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary">
            Access your 1:1 reciprocal skill exchange network and dashboard.
          </p>
        </div>

        {/* Main Login Form */}
        <div className="rounded-[18px] border border-border bg-surface p-7 sm:p-8 shadow-pop space-y-5">
          <div className="rounded-xl bg-primary-soft/50 border border-border p-3 space-y-2">
            <label className="flex items-center gap-2 text-xs font-semibold text-text-primary"><Users className="w-4 h-4" /> Try an Indian sample member</label>
            <select onChange={(e) => e.target.value && chooseSample(e.target.value)} defaultValue="" className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-primary">
              <option value="">Select a sample account…</option>
              {sampleUsers.map(([name, sampleEmail]) => <option key={sampleEmail} value={sampleEmail}>{name}</option>)}
            </select>
            <p className="text-[11px] text-text-secondary">Sample password: <strong>SkillSwap@123</strong> · Run the sample-users SQL first.</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-text-primary">
                  Password
                </label>
                <span className="text-[11px] text-text-secondary hover:text-text-primary cursor-pointer transition-colors">
                  Forgot password?
                </span>
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                required
              />
            </div>

            {error && (
              <p className="text-xs text-danger font-medium bg-danger-soft p-3 rounded-[8px] border border-danger-border">
                {error}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full gap-2 mt-2 font-bold"
              isLoading={isLoading}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In to Account</span>
            </Button>
          </form>

          <div className="pt-3 text-center text-xs text-text-secondary border-t border-border">
            <span>Don&apos;t have an account? </span>
            <button
              type="button"
              onClick={() => onNavigate('signup')}
              className="font-bold text-primary-deep dark:text-primary hover:underline ml-1"
            >
              Join the exchange free
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-text-secondary">
          <ShieldCheck className="w-4 h-4 text-success" />
          <span>No credit card or payments ever required. 100% peer learning.</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
