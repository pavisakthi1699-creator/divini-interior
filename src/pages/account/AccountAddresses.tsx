import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Trash2, Edit2, Loader2, MapPin, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useCustomerStore } from '@/stores/customerStore';
import type { ShippingAddress } from '@/lib/api';

const INDIAN_STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];

const addrSchema = z.object({
  name:        z.string().min(1, 'Name required'),
  line1:       z.string().min(3, 'Address required'),
  line2:       z.string().optional(),
  city:        z.string().min(1, 'City required'),
  state:       z.string().min(1, 'State required'),
  postal_code: z.string().min(4, 'Postal code required'),
  country:     z.string().default('India'),
});
type AddrForm = z.infer<typeof addrSchema>;

const AccountAddresses = () => {
  const { user, updateProfile, isLoading } = useCustomerStore();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editIdx, setEditIdx]       = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<AddrForm>({ resolver: zodResolver(addrSchema) });

  const addresses: ShippingAddress[] = user?.addresses ?? [];

  const openAdd = () => {
    setEditIdx(null);
    reset({ name: user?.name ?? '', line1: '', line2: '', city: '', state: '', postal_code: '', country: 'India' });
    setDialogOpen(true);
  };

  const openEdit = (idx: number) => {
    setEditIdx(idx);
    reset(addresses[idx]);
    setDialogOpen(true);
  };

  const onSubmit = async (data: AddrForm) => {
    const updated = [...addresses];
    if (editIdx !== null) updated[editIdx] = data;
    else updated.push(data);
    const ok = await updateProfile({ addresses: updated });
    if (ok) { toast.success(editIdx !== null ? 'Address updated' : 'Address added'); setDialogOpen(false); }
    else toast.error('Save failed');
  };

  const handleDelete = async (idx: number) => {
    const updated = addresses.filter((_, i) => i !== idx);
    const ok = await updateProfile({ addresses: updated });
    if (ok) toast.success('Address removed');
    else toast.error('Delete failed');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-light tracking-wide">Addresses</h1>
          <p className="font-sans text-sm text-muted-foreground mt-1">Manage your saved addresses</p>
        </div>
        <Button onClick={openAdd} className="bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-lg border border-border bg-card py-16 text-center">
          <MapPin className="mx-auto mb-4 h-10 w-10 text-muted-foreground/30" />
          <p className="font-display text-lg font-light mb-2">No addresses saved</p>
          <p className="font-sans text-sm text-muted-foreground mb-6">Add a delivery address for faster checkout.</p>
          <Button onClick={openAdd} variant="outline" className="font-sans text-xs font-semibold uppercase tracking-wider">
            <Plus className="mr-2 h-4 w-4" /> Add Your First Address
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {addresses.map((addr, i) => (
            <div key={i} className="rounded-lg border border-border bg-card p-5 relative group">
              {i === 0 && (
                <span className="absolute right-3 top-3 font-sans text-[9px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-full">Default</span>
              )}
              <p className="font-sans text-sm font-semibold text-foreground mb-1">{addr.name}</p>
              <div className="font-sans text-xs text-muted-foreground space-y-0.5">
                <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}</p>
                <p>{addr.city}, {addr.state} {addr.postal_code}</p>
                <p>{addr.country}</p>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => openEdit(i)} className="font-sans text-xs">
                  <Edit2 className="mr-1.5 h-3 w-3" /> Edit
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(i)}
                  className="font-sans text-xs text-destructive border-destructive/30 hover:bg-destructive/10">
                  <Trash2 className="mr-1.5 h-3 w-3" /> Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display text-lg font-light">{editIdx !== null ? 'Edit Address' : 'Add Address'}</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Full Name *</Label>
              <Input {...register('name')} className="font-sans text-sm" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Address Line 1 *</Label>
              <Input {...register('line1')} placeholder="Street, building" className="font-sans text-sm" />
              {errors.line1 && <p className="text-xs text-destructive">{errors.line1.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Address Line 2</Label>
              <Input {...register('line2')} placeholder="Landmark (optional)" className="font-sans text-sm" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">City *</Label>
                <Input {...register('city')} className="font-sans text-sm" />
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">State *</Label>
                <select {...register('state')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">Select</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Postal Code *</Label>
                <Input {...register('postal_code')} className="font-sans text-sm" />
                {errors.postal_code && <p className="text-xs text-destructive">{errors.postal_code.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Country</Label>
                <Input {...register('country')} readOnly className="font-sans text-sm bg-muted/50" />
              </div>
            </div>
            <DialogFooter className="pt-2 gap-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="font-sans text-xs">Cancel</Button>
              <Button type="submit" disabled={isLoading} className="bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90">
                {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : <><Save className="mr-2 h-4 w-4" /> Save Address</>}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AccountAddresses;
