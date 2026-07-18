import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2, ArrowRight, Lock } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';

const schema = z.object({
  email:    z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type Form = z.infer<typeof schema>;

const AdminLogin = () => {
  const navigate = useNavigate();
  const { signIn, error, isLoading, clearError } = useAdminStore();
  const [showPwd, setShowPwd] = useState(false);

  const { register, handleSubmit, formState: { errors } } =
    useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: Form) => {
    clearError();
    const ok = await signIn(data.email, data.password);
    if (ok) navigate('/studio');
  };

  return (
    <div className="flex min-h-screen w-full">

      {/* ── Left — olive hero image (like reference) ── */}
      <div
        className="hidden lg:flex lg:w-[48%] relative flex-col justify-between p-12 overflow-hidden"
        style={{ background: 'linear-gradient(160deg,#4a5240 0%,#3a4132 40%,#2c3226 100%)' }}
      >
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=1200&q=70)', backgroundSize: 'cover', backgroundPosition: 'center', mixBlendMode: 'multiply' }} />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom,rgba(60,70,50,0.3) 0%,rgba(30,36,26,0.7) 100%)' }} />

        {/* Logo top-left */}
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
              <span className="font-display text-base font-bold text-white">DI</span>
            </div>
            <div>
              <p className="font-display text-white text-sm font-medium tracking-wide leading-none">Divine Interior</p>
              <p className="font-sans text-[9px] uppercase tracking-[0.3em] mt-0.5 text-white/50">Admin Portal</p>
            </div>
          </div>
        </div>

        {/* Bottom hero text */}
        <div className="relative z-10">
          <h2 className="font-display text-4xl font-light text-white leading-tight mb-4">
            Manage your<br />
            <span className="italic">store with ease.</span>
          </h2>
          <p className="font-sans text-sm font-light text-white/55 max-w-xs leading-relaxed">
            Complete control over your products, orders, customers, and content — all in one place.
          </p>
          <div className="mt-8 flex items-center gap-2">
            <div className="h-px w-8 bg-white/30" />
            <p className="font-sans text-[10px] uppercase tracking-[0.25em] text-white/40">
              Divine Interior Studio
            </p>
          </div>
        </div>
      </div>

      {/* ── Right — clean white form (matches reference) ── */}
      <div className="flex flex-1 flex-col items-center justify-center bg-[#F8F7F5] px-8 py-12 lg:px-14">
        <div className="w-full max-w-[360px]">

          {/* Mobile logo */}
          <div className="mb-8 flex lg:hidden items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: '#3a4132' }}>
              <span className="font-display text-sm font-bold text-white">DI</span>
            </div>
            <span className="font-display text-sm font-medium text-gray-800 tracking-wide">Divine Interior</span>
          </div>

          {/* SECURE PORTAL badge */}
          <div className="mb-6 flex items-center gap-1.5">
            <Lock className="h-3 w-3 text-gray-400" />
            <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-gray-400 font-medium">
              Secure Portal
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-display text-3xl font-normal text-gray-900 mb-1.5 tracking-tight">
            Welcome Back
          </h1>
          <p className="font-sans text-sm text-gray-500 mb-8">
            Enter your credentials to access your sanctuary.
          </p>

          {/* Tab-style toggle (decorative — only Login active) */}
          <div className="flex rounded-full bg-white border border-gray-200 p-1 mb-8 shadow-sm">
            <div className="flex-1 rounded-full bg-gray-900 py-2.5 text-center">
              <span className="font-sans text-xs font-semibold text-white">Login</span>
            </div>
            <div className="flex-1 py-2.5 text-center">
              <span className="font-sans text-xs font-medium text-gray-400">Sign Up</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                Identifier
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="admin@divine.com"
                className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 font-sans text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 shadow-sm"
                {...register('email')}
              />
              {errors.email && <p className="font-sans text-xs text-red-500">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Security Key
                </label>
                <button type="button" className="font-sans text-[10px] font-semibold uppercase tracking-wider text-gray-400 hover:text-gray-600 transition-colors">
                  Forgot?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••"
                  className="w-full h-11 rounded-xl border border-gray-200 bg-white px-4 pr-11 font-sans text-sm text-gray-900 placeholder-gray-300 outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200 shadow-sm"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-350 hover:text-gray-500 transition-colors"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="font-sans text-xs text-red-500">{errors.password.message}</p>}
            </div>

            {/* Server error */}
            {error && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3">
                <p className="font-sans text-xs text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 flex w-full items-center justify-center gap-2 h-12 rounded-xl bg-gray-900 font-sans text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Signing in…</>
                : <>SIGN IN <ArrowRight className="h-4 w-4" /></>
              }
            </button>
          </form>

          {/* Return to store */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <ArrowRight className="h-3 w-3 rotate-180 text-gray-400" />
            <Link to="/" className="font-sans text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors uppercase tracking-wider">
              Return to Sanctuary
            </Link>
          </div>

          {/* Fine print */}
          <p className="mt-6 text-center font-sans text-[10px] leading-relaxed text-gray-350">
            By continuing, you agree to Divine Interior's Terms of Service<br />
            and Privacy Policy, distributed to consented visitors.
          </p>
        </div>
      </div>

    </div>
  );
};

export default AdminLogin;
