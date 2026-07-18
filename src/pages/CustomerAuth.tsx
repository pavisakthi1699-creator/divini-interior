import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Loader2, ArrowLeft, Mail, KeyRound, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';
import { useCustomerStore } from '@/stores/customerStore';
import { customerAuthApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// ─── Schemas ──────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
const otpEmailSchema = z.object({
  email: z.string().email('Enter a valid email'),
});

type LoginForm    = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;
type OtpEmailForm = z.infer<typeof otpEmailSchema>;

type View = 'login' | 'register' | 'otp-email' | 'otp-verify' | 'verify-notice';

const CustomerAuth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '/account';

  const { signIn, signInWithOtp, register, isLoading, error, clearError, isAuthenticated } = useCustomerStore();

  const [view, setView]             = useState<View>('login');
  const [showPass, setShowPass]     = useState(false);
  const [otpEmail, setOtpEmail]     = useState('');
  const [otp, setOtp]               = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpCountdown, setOtpCountdown] = useState(0);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) navigate(redirect, { replace: true });
  }, []);

  // OTP countdown timer
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const t = setTimeout(() => setOtpCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [otpCountdown]);

  // Login form
  const { register: regLogin, handleSubmit: hsLogin, formState: { errors: errLogin } } =
    useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  // Register form
  const { register: regReg, handleSubmit: hsReg, formState: { errors: errReg } } =
    useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  // OTP email form
  const { register: regOtpEmail, handleSubmit: hsOtpEmail, getValues: getOtpVals, formState: { errors: errOtp } } =
    useForm<OtpEmailForm>({ resolver: zodResolver(otpEmailSchema) });

  const handleLogin = async (data: LoginForm) => {
    clearError();
    const ok = await signIn(data.email, data.password);
    if (ok) { toast.success('Welcome back!'); navigate(redirect, { replace: true }); }
  };

  const handleRegister = async (data: RegisterForm) => {
    clearError();
    const ok = await register(data.name, data.email, data.password);
    if (ok) {
      toast.success('Account created!', { description: 'Check your email for a verification code.' });
      setView('verify-notice');
    }
  };

  const handleSendOtp = async (data: OtpEmailForm) => {
    setOtpSending(true);
    try {
      await customerAuthApi.sendOtp(data.email, 'login');
      setOtpEmail(data.email);
      setView('otp-verify');
      setOtpCountdown(60);
      toast.success('OTP sent!', { description: 'Check your email for the 6-digit code.' });
    } catch (e: any) {
      toast.error(e.message);
    }
    setOtpSending(false);
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) { toast.error('Enter the 6-digit code'); return; }
    clearError();
    const ok = await signInWithOtp(otpEmail, otp);
    if (ok) { toast.success('Signed in!'); navigate(redirect, { replace: true }); }
  };

  const handleResendOtp = async () => {
    if (otpCountdown > 0) return;
    setOtpSending(true);
    try {
      await customerAuthApi.sendOtp(otpEmail, 'login');
      setOtpCountdown(60);
      toast.success('New OTP sent!');
    } catch (e: any) { toast.error(e.message); }
    setOtpSending(false);
  };

  const tabs = (
    <div className="flex rounded-sm border border-border overflow-hidden mb-6">
      {(['login','register'] as const).map(t => (
        <button key={t} onClick={() => { setView(t); clearError(); }}
          className={`flex-1 py-2.5 font-sans text-xs font-semibold uppercase tracking-widest transition-colors
            ${view === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
          {t === 'login' ? 'Sign In' : 'Register'}
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto flex max-w-md flex-col px-6 py-20">
        {/* Back link */}
        <Link to="/" className="mb-8 flex items-center gap-2 font-sans text-xs text-muted-foreground hover:text-foreground transition-colors self-start">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
        </Link>

        <AnimatePresence mode="wait">

          {/* ── LOGIN ── */}
          {view === 'login' && (
            <motion.div key="login" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <h1 className="font-display text-3xl font-light tracking-wide mb-2">Welcome Back</h1>
              <p className="font-sans text-sm text-muted-foreground mb-8">Sign in to your account</p>
              {tabs}
              <form onSubmit={hsLogin(handleLogin)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                  <Input {...regLogin('email')} type="email" autoComplete="email" placeholder="your@email.com" className="font-sans text-sm" />
                  {errLogin.email && <p className="text-xs text-destructive">{errLogin.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                  <div className="relative">
                    <Input {...regLogin('password')} type={showPass ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••" className="font-sans text-sm pr-10" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errLogin.password && <p className="text-xs text-destructive">{errLogin.password.message}</p>}
                </div>
                {error && <p className="font-sans text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">{error}</p>}
                <Button type="submit" disabled={isLoading} className="w-full bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 mt-2">
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…</> : 'Sign In'}
                </Button>
              </form>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                <div className="relative flex justify-center"><span className="bg-background px-3 font-sans text-[10px] uppercase tracking-widest text-muted-foreground">or</span></div>
              </div>
              <Button variant="outline" onClick={() => { setView('otp-email'); clearError(); }} className="w-full font-sans text-xs font-semibold uppercase tracking-wider">
                <Mail className="mr-2 h-4 w-4" /> Sign In with OTP (Email)
              </Button>
            </motion.div>
          )}

          {/* ── REGISTER ── */}
          {view === 'register' && (
            <motion.div key="register" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <h1 className="font-display text-3xl font-light tracking-wide mb-2">Create Account</h1>
              <p className="font-sans text-sm text-muted-foreground mb-8">Join Divine Interior</p>
              {tabs}
              <form onSubmit={hsReg(handleRegister)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                  <Input {...regReg('name')} placeholder="Your name" className="font-sans text-sm" />
                  {errReg.name && <p className="text-xs text-destructive">{errReg.name.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
                  <Input {...regReg('email')} type="email" autoComplete="email" placeholder="your@email.com" className="font-sans text-sm" />
                  {errReg.email && <p className="text-xs text-destructive">{errReg.email.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Password</Label>
                  <div className="relative">
                    <Input {...regReg('password')} type={showPass ? 'text' : 'password'} autoComplete="new-password" placeholder="Min 6 characters" className="font-sans text-sm pr-10" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errReg.password && <p className="text-xs text-destructive">{errReg.password.message}</p>}
                </div>
                {error && <p className="font-sans text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2">{error}</p>}
                <Button type="submit" disabled={isLoading} className="w-full bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 mt-2">
                  {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : 'Create Account'}
                </Button>
              </form>
            </motion.div>
          )}

          {/* ── OTP EMAIL ENTRY ── */}
          {view === 'otp-email' && (
            <motion.div key="otp-email" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <button onClick={() => setView('login')} className="mb-6 flex items-center gap-2 font-sans text-xs text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <h1 className="font-display text-3xl font-light tracking-wide mb-2">Sign In with OTP</h1>
              <p className="font-sans text-sm text-muted-foreground mb-8">We'll send a 6-digit code to your email</p>
              <form onSubmit={hsOtpEmail(handleSendOtp)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                  <Input {...regOtpEmail('email')} type="email" placeholder="your@email.com" className="font-sans text-sm" />
                  {errOtp.email && <p className="text-xs text-destructive">{errOtp.email.message}</p>}
                </div>
                <Button type="submit" disabled={otpSending} className="w-full bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90">
                  {otpSending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</> : <><Mail className="mr-2 h-4 w-4" /> Send OTP</>}
                </Button>
              </form>
            </motion.div>
          )}

          {/* ── OTP VERIFY ── */}
          {view === 'otp-verify' && (
            <motion.div key="otp-verify" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
              <button onClick={() => setView('otp-email')} className="mb-6 flex items-center gap-2 font-sans text-xs text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
              <h1 className="font-display text-3xl font-light tracking-wide mb-2">Enter OTP</h1>
              <p className="font-sans text-sm text-muted-foreground mb-2">Sent to <strong>{otpEmail}</strong></p>
              <p className="font-sans text-xs text-muted-foreground mb-8">Code expires in 15 minutes</p>

              <div className="flex justify-center mb-6">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    {[0,1,2,3,4,5].map(i => <InputOTPSlot key={i} index={i} className="h-12 w-12 text-lg font-bold" />)}
                  </InputOTPGroup>
                </InputOTP>
              </div>

              {error && <p className="font-sans text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2 mb-4">{error}</p>}

              <Button onClick={handleVerifyOtp} disabled={isLoading || otp.length < 6}
                className="w-full bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 mb-4">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying…</> : <><KeyRound className="mr-2 h-4 w-4" /> Verify & Sign In</>}
              </Button>

              <button onClick={handleResendOtp} disabled={otpCountdown > 0 || otpSending}
                className="w-full font-sans text-xs text-muted-foreground hover:text-foreground disabled:opacity-40 transition-colors text-center">
                {otpCountdown > 0 ? `Resend in ${otpCountdown}s` : 'Resend OTP'}
              </button>
            </motion.div>
          )}

          {/* ── VERIFY NOTICE ── */}
          {view === 'verify-notice' && (
            <motion.div key="notice" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Mail className="h-8 w-8 text-primary" />
              </div>
              <h1 className="font-display text-2xl font-light tracking-wide mb-3">Check your email</h1>
              <p className="font-sans text-sm text-muted-foreground mb-8">We've sent a verification code. You can sign in right away using your email and password.</p>
              <Button onClick={() => setView('login')} className="bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90">
                Go to Sign In
              </Button>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
      <Footer />
    </div>
  );
};

export default CustomerAuth;
