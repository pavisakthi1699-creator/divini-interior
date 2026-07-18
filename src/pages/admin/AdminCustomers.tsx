import { useEffect, useState, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, MoreHorizontal, Users,
  Loader2, Eye, Mail, Phone, MapPin, ShoppingBag,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { customersApi, type Customer } from '@/lib/api';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';

type CustomerInsert = Partial<Customer>;

// ─── Form schema ─────────────────────────────────────────────
const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email required'),
  phone: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  tags: z.string().default(''),
  is_active: z.boolean().default(true),
  // Flat address fields (primary address)
  addr_name: z.string().default(''),
  addr_line1: z.string().default(''),
  addr_line2: z.string().default(''),
  addr_city: z.string().default(''),
  addr_state: z.string().default(''),
  addr_postal: z.string().default(''),
  addr_country: z.string().default('India'),
});

type CustomerFormData = z.infer<typeof customerSchema>;

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewCustomer, setViewCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [saving, setSaving] = useState(false);

  const {
    register, handleSubmit, reset, watch, setValue,
    formState: { errors },
  } = useForm<CustomerFormData>({ resolver: zodResolver(customerSchema) });

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (search) params.search = search;
      const res = await customersApi.list(params);
      setCustomers(res.items);
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const openCreate = () => {
    setEditingCustomer(null);
    reset({
      name: '', email: '', phone: '', notes: '', tags: '',
      is_active: true,
      addr_name: '', addr_line1: '', addr_line2: '',
      addr_city: '', addr_state: '', addr_postal: '', addr_country: 'India',
    });
    setDialogOpen(true);
  };

  const openEdit = (c: Customer) => {
    setEditingCustomer(c);
    const addr = c.addresses?.[0];
    reset({
      name: c.name,
      email: c.email,
      phone: c.phone ?? '',
      notes: c.notes ?? '',
      tags: c.tags.join(', '),
      is_active: c.is_active,
      addr_name: addr?.name ?? '',
      addr_line1: addr?.line1 ?? '',
      addr_line2: addr?.line2 ?? '',
      addr_city: addr?.city ?? '',
      addr_state: addr?.state ?? '',
      addr_postal: addr?.postal_code ?? '',
      addr_country: addr?.country ?? 'India',
    });
    setDialogOpen(true);
  };

  const onSubmit = async (data: CustomerFormData) => {
    setSaving(true);
    const addresses = data.addr_line1
      ? [{ name: data.addr_name, line1: data.addr_line1, line2: data.addr_line2 || undefined,
           city: data.addr_city, state: data.addr_state, postal_code: data.addr_postal, country: data.addr_country }]
      : editingCustomer?.addresses ?? [];

    const payload: CustomerInsert = {
      name: data.name, email: data.email, phone: data.phone || null,
      avatar: null, addresses, notes: data.notes || null,
      tags: data.tags.split(',').map(t => t.trim()).filter(Boolean),
      is_active: data.is_active,
    };

    try {
      if (editingCustomer) { await customersApi.update(editingCustomer.id, payload); toast.success('Customer updated'); }
      else                  { await customersApi.create(payload);                      toast.success('Customer created'); }
      setDialogOpen(false); fetchCustomers();
    } catch (e: any) { toast.error('Failed to save customer', { description: e.message }); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await customersApi.delete(deleteTarget.id);
      toast.success('Customer deleted');
      fetchCustomers();
    } catch (e: any) { toast.error('Delete failed', { description: e.message }); }
    setDeleteTarget(null);
  };

  const toggleActive = async (c: Customer) => {
    try {
      await customersApi.update(c.id, { is_active: !c.is_active });
      fetchCustomers();
    } catch (e: any) { toast.error(e.message); }
  };

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  const initials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-light tracking-wide">Customers</h1>
          <p className="font-sans text-sm text-muted-foreground">{customers.length} total customers</p>
        </div>
        <Button
          onClick={openCreate}
          className="bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name, email or phone…"
          className="pl-9 font-sans text-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Users className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-sans text-sm text-muted-foreground">No customers found.</p>
            <Button variant="outline" size="sm" onClick={openCreate} className="mt-3 font-sans text-xs">
              Add your first customer
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  {['Customer', 'Contact', 'Orders', 'Spent', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-sans text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                    {/* Customer */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                            {initials(c.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-sans text-sm font-medium text-foreground">{c.name}</p>
                          <p className="font-sans text-[11px] text-muted-foreground">
                            Since {new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    {/* Contact */}
                    <td className="px-4 py-3">
                      <p className="font-sans text-xs text-foreground flex items-center gap-1.5">
                        <Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                        {c.email}
                      </p>
                      {c.phone && (
                        <p className="font-sans text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <Phone className="h-3 w-3 flex-shrink-0" />
                          {c.phone}
                        </p>
                      )}
                    </td>
                    {/* Orders */}
                    <td className="px-4 py-3 font-sans text-sm text-foreground text-center">
                      {c.total_orders ?? 0}
                    </td>
                    {/* Spent */}
                    <td className="px-4 py-3 font-sans text-sm font-semibold text-foreground whitespace-nowrap">
                      ₹{(c.total_spent ?? 0).toLocaleString('en-IN')}
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3">
                      <Switch checked={c.is_active} onCheckedChange={() => toggleActive(c)} />
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewCustomer(c)}>
                            <Eye className="mr-2 h-3.5 w-3.5" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openEdit(c)}>
                            <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(c)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Customer Dialog */}
      <Dialog open={!!viewCustomer} onOpenChange={o => !o && setViewCustomer(null)}>
        <DialogContent className="max-w-lg">
          {viewCustomer && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-lg font-light tracking-wide">
                  Customer Profile
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-5 pt-2">
                {/* Identity */}
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14">
                    <AvatarFallback className="bg-primary/10 text-primary text-lg font-bold">
                      {initials(viewCustomer.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-display text-xl font-light">{viewCustomer.name}</p>
                    <p className="font-sans text-xs text-muted-foreground">
                      Customer since {new Date(viewCustomer.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                    </p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {viewCustomer.tags.map(t => (
                        <Badge key={t} variant="outline" className="font-sans text-[10px]">{t}</Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-border bg-muted/20 p-4 text-center">
                    <ShoppingBag className="mx-auto mb-1 h-5 w-5 text-primary" />
                    <p className="font-display text-2xl font-light text-foreground">{viewCustomer.total_orders ?? 0}</p>
                    <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground">Total Orders</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/20 p-4 text-center">
                    <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Total Spent</p>
                    <p className="font-display text-2xl font-light text-foreground">
                      ₹{(viewCustomer.total_spent ?? 0).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Contact */}
                <div className="space-y-2">
                  <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground">Contact</p>
                  <div className="flex items-center gap-2 font-sans text-sm text-foreground">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a href={`mailto:${viewCustomer.email}`} className="hover:text-primary transition-colors">
                      {viewCustomer.email}
                    </a>
                  </div>
                  {viewCustomer.phone && (
                    <div className="flex items-center gap-2 font-sans text-sm text-foreground">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {viewCustomer.phone}
                    </div>
                  )}
                </div>

                {/* Addresses */}
                {viewCustomer.addresses?.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground">Addresses</p>
                    {viewCustomer.addresses.map((addr, i) => (
                      <div key={i} className="flex items-start gap-2 font-sans text-xs text-foreground">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                        <span>
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ''}, {addr.city}, {addr.state} {addr.postal_code}, {addr.country}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Notes */}
                {viewCustomer.notes && (
                  <div className="space-y-1">
                    <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground">Notes</p>
                    <p className="font-sans text-xs text-foreground">{viewCustomer.notes}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 font-sans text-xs"
                    onClick={() => { setViewCustomer(null); openEdit(viewCustomer); }}
                  >
                    <Edit2 className="mr-1.5 h-3 w-3" /> Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 font-sans text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => { setViewCustomer(null); setDeleteTarget(viewCustomer); }}
                  >
                    <Trash2 className="mr-1.5 h-3 w-3" /> Delete
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-light tracking-wide">
              {editingCustomer ? 'Edit Customer' : 'Add Customer'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            {/* Name + Email */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Full Name *
                </Label>
                <Input {...register('name')} placeholder="Jane Doe" className="font-sans text-sm" />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Email *
                </Label>
                <Input {...register('email')} type="email" placeholder="jane@example.com" className="font-sans text-sm" />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </div>

            {/* Phone + Tags */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Phone
                </Label>
                <Input {...register('phone')} placeholder="+91 98765 43210" className="font-sans text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Tags (comma separated)
                </Label>
                <Input {...register('tags')} placeholder="vip, wholesale" className="font-sans text-sm" />
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Notes
              </Label>
              <Textarea {...register('notes')} rows={2} placeholder="Internal notes…" className="font-sans text-sm resize-none" />
            </div>

            {/* Address section */}
            <div className="rounded-lg border border-border p-4 space-y-3">
              <p className="font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Primary Address
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Full Name</Label>
                  <Input {...register('addr_name')} placeholder="Recipient name" className="font-sans text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Country</Label>
                  <Input {...register('addr_country')} placeholder="India" className="font-sans text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Address Line 1</Label>
                <Input {...register('addr_line1')} placeholder="123 Main Street" className="font-sans text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Address Line 2</Label>
                <Input {...register('addr_line2')} placeholder="Apt, Floor, etc." className="font-sans text-sm" />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">City</Label>
                  <Input {...register('addr_city')} placeholder="Mumbai" className="font-sans text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">State</Label>
                  <Input {...register('addr_state')} placeholder="Maharashtra" className="font-sans text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Postal Code</Label>
                  <Input {...register('addr_postal')} placeholder="400001" className="font-sans text-sm" />
                </div>
              </div>
            </div>

            {/* Active toggle */}
            <div className="flex items-center gap-3">
              <Switch
                id="cust_active"
                checked={watch('is_active')}
                onCheckedChange={v => setValue('is_active', v)}
              />
              <Label htmlFor="cust_active" className="font-sans text-sm cursor-pointer">Active customer</Label>
            </div>

            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)} className="font-sans text-xs">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90"
              >
                {saving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</>
                ) : editingCustomer ? 'Update Customer' : 'Create Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={o => !o && setDeleteTarget(null)}
        title="Delete Customer"
        description={`Delete customer "${deleteTarget?.name}"? All their data will be permanently removed.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminCustomers;
