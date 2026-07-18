import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useCustomerStore } from '@/stores/customerStore';

const profileSchema = z.object({
  name:         z.string().min(2, 'Name is required'),
  phone:        z.string().nullable().optional(),
  new_password: z.string().optional(),
  confirm_pass: z.string().optional(),
}).refine(d => !d.new_password || d.new_password === d.confirm_pass, {
  message: 'Passwords do not match',
  path: ['confirm_pass'],
});

type ProfileForm = z.infer<typeof profileSchema>;

const AccountProfile = () => {
  const { user, updateProfile, isLoading } = useCustomerStore();

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  useEffect(() => {
    if (user) reset({ name: user.name, phone: user.phone ?? '' });
  }, [user, reset]);

  const onSubmit = async (data: ProfileForm) => {
    const payload: any = { name: data.name, phone: data.phone || null };
    if (data.new_password) payload.password = data.new_password;
    const ok = await updateProfile(payload);
    if (ok) toast.success('Profile updated');
    else    toast.error('Update failed');
  };

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-light tracking-wide">Profile</h1>
        <p className="font-sans text-sm text-muted-foreground mt-1">Manage your personal information</p>
      </div>

      <div className="rounded-lg border border-border bg-card p-6">
        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-sans text-sm font-semibold text-foreground">{user?.name}</p>
            <p className="font-sans text-xs text-muted-foreground">{user?.email}</p>
            <p className="font-sans text-[10px] mt-1 text-muted-foreground/60 capitalize">
              {Number(user?.total_orders ?? 0)} orders · ₹{Number(user?.total_spent ?? 0).toLocaleString('en-IN')} spent
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
              <Input {...register('name')} className="font-sans text-sm" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email</Label>
              <Input value={user?.email ?? ''} disabled className="font-sans text-sm bg-muted/50" />
              <p className="font-sans text-[10px] text-muted-foreground">Email cannot be changed</p>
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Phone</Label>
              <Input {...register('phone')} type="tel" placeholder="+91 98765 43210" className="font-sans text-sm" />
            </div>
          </div>

          <div className="border-t border-border pt-4">
            <p className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">Change Password (optional)</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">New Password</Label>
                <Input {...register('new_password')} type="password" placeholder="Min 6 characters" className="font-sans text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Confirm Password</Label>
                <Input {...register('confirm_pass')} type="password" placeholder="Repeat password" className="font-sans text-sm" />
                {errors.confirm_pass && <p className="text-xs text-destructive">{errors.confirm_pass.message}</p>}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button type="submit" disabled={isLoading} className="bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90">
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountProfile;
