import { useEffect, useState, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, MoreHorizontal, UserCog,
  Loader2, Shield, ShieldCheck, ShieldAlert, ShieldOff, KeyRound,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { usersApi, type AdminUser } from '@/lib/api';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useAdminStore } from '@/stores/adminStore';

// ─── Types ────────────────────────────────────────────────
type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

// ─── Form schemas ─────────────────────────────────────────
const createUserSchema = z.object({
  name:      z.string().min(1, 'Name is required'),
  email:     z.string().email('Valid email required'),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
  role:      z.enum(['super_admin', 'admin', 'editor', 'viewer']).default('editor'),
  is_active: z.boolean().default(true),
});

const editUserSchema = z.object({
  name:      z.string().min(1, 'Name is required'),
  role:      z.enum(['super_admin', 'admin', 'editor', 'viewer']),
  is_active: z.boolean().default(true),
  password:  z.string().optional(),
});

type CreateUserForm = z.infer<typeof createUserSchema>;
type EditUserForm   = z.infer<typeof editUserSchema>;

// ─── Role config ──────────────────────────────────────────
const ROLE_CONFIG: Record<AdminRole, { label: string; desc: string; icon: React.ElementType; cls: string }> = {
  super_admin: { label: 'Super Admin', desc: 'Full access',         icon: ShieldAlert, cls: 'bg-purple-100 text-purple-800 border-purple-200' },
  admin:       { label: 'Admin',       desc: 'Manage all content',  icon: ShieldCheck, cls: 'bg-blue-100 text-blue-800 border-blue-200' },
  editor:      { label: 'Editor',      desc: 'Create & edit',       icon: Shield,      cls: 'bg-green-100 text-green-800 border-green-200' },
  viewer:      { label: 'Viewer',      desc: 'Read-only',           icon: ShieldOff,   cls: 'bg-gray-100 text-gray-700 border-gray-200' },
};

const RoleBadge = ({ role }: { role: AdminRole }) => {
  const cfg = ROLE_CONFIG[role] ?? ROLE_CONFIG.viewer;
  return <Badge variant="outline" className={`font-sans text-xs font-medium ${cfg.cls}`}>{cfg.label}</Badge>;
};

// ─── Component ────────────────────────────────────────────
const AdminUsers = () => {
  const { adminProfile } = useAdminStore();
  const [users, setUsers]               = useState<AdminUser[]>([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [createOpen, setCreateOpen]     = useState(false);
  const [editingUser, setEditingUser]   = useState<AdminUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [saving, setSaving]             = useState(false);

  // ── Forms ──────────────────────────────────────────────
  const { register: rC, handleSubmit: hsC, reset: resetC, watch: wC, setValue: svC, formState: { errors: eC } } =
    useForm<CreateUserForm>({ resolver: zodResolver(createUserSchema) });

  const { register: rE, handleSubmit: hsE, reset: resetE, watch: wE, setValue: svE, formState: { errors: eE } } =
    useForm<EditUserForm>({ resolver: zodResolver(editUserSchema) });

  // ── Fetch ──────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.list(search ? { search } : undefined);
      setUsers(res.items);
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // ── Create ─────────────────────────────────────────────
  const openCreate = () => {
    resetC({ name: '', email: '', password: '', role: 'editor', is_active: true });
    setCreateOpen(true);
  };

  const onCreateSubmit = async (data: CreateUserForm) => {
    setSaving(true);
    try {
      await usersApi.create({
        name: data.name, email: data.email, password: data.password,
        role: data.role as AdminRole, is_active: data.is_active,
        avatar: null, last_login: null, created_at: '',
      });
      toast.success('User created', { description: `${data.name} can now sign in.` });
      setCreateOpen(false);
      fetchUsers();
    } catch (e: any) { toast.error('Failed to create user', { description: e.message }); }
    setSaving(false);
  };

  // ── Edit ───────────────────────────────────────────────
  const openEdit = (u: AdminUser) => {
    setEditingUser(u);
    resetE({ name: u.name, role: u.role as AdminRole, is_active: Boolean(u.is_active), password: '' });
  };

  const onEditSubmit = async (data: EditUserForm) => {
    if (!editingUser) return;
    setSaving(true);
    try {
      const payload: any = { name: data.name, role: data.role, is_active: data.is_active };
      if (data.password && data.password.length >= 8) payload.password = data.password;
      await usersApi.update(editingUser.id, payload);
      toast.success('User updated');
      setEditingUser(null);
      fetchUsers();
    } catch (e: any) { toast.error('Update failed', { description: e.message }); }
    setSaving(false);
  };

  // ── Toggle active ──────────────────────────────────────
  const toggleActive = async (u: AdminUser) => {
    try {
      await usersApi.update(u.id, { is_active: !u.is_active } as any);
      fetchUsers();
    } catch (e: any) { toast.error(e.message); }
  };

  // ── Delete ─────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await usersApi.delete(deleteTarget.id);
      toast.success('User removed');
      fetchUsers();
    } catch (e: any) { toast.error('Delete failed', { description: e.message }); }
    setDeleteTarget(null);
  };

  const isSelf    = (u: AdminUser) => u.id === adminProfile?.id;
  const initials  = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  const filtered  = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-light tracking-wide">Admin Users</h1>
          <p className="font-sans text-sm text-muted-foreground">{users.length} team members</p>
        </div>
        <Button onClick={openCreate} className="bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90">
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Role legend */}
      <div className="flex flex-wrap gap-2">
        {(Object.entries(ROLE_CONFIG) as [AdminRole, typeof ROLE_CONFIG[AdminRole]][]).map(([role, cfg]) => {
          const Icon = cfg.icon;
          return (
            <div key={role} className="flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1">
              <Icon className="h-3 w-3 text-muted-foreground" />
              <span className="font-sans text-[10px] font-medium text-muted-foreground">{cfg.label}</span>
              <span className="font-sans text-[10px] text-muted-foreground/60">— {cfg.desc}</span>
            </div>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Search by name or email…" className="pl-9 font-sans text-sm" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <UserCog className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-sans text-sm text-muted-foreground">No users found.</p>
            <Button variant="outline" size="sm" onClick={openCreate} className="mt-3 font-sans text-xs">Add the first user</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  {['User', 'Email', 'Role', 'Last Login', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-sans text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 flex-shrink-0">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{initials(u.name)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-sans text-sm font-medium text-foreground">{u.name}</p>
                            {isSelf(u) && <Badge variant="outline" className="font-sans text-[9px] bg-primary/5 text-primary border-primary/20">You</Badge>}
                          </div>
                          <p className="font-sans text-[11px] text-muted-foreground">
                            Added {new Date(u.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3"><RoleBadge role={u.role as AdminRole} /></td>
                    <td className="px-4 py-3 font-sans text-xs text-muted-foreground">
                      {u.last_login ? new Date(u.last_login).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <Switch checked={Boolean(u.is_active)} onCheckedChange={() => toggleActive(u)} disabled={isSelf(u)} />
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(u)}><Edit2 className="mr-2 h-3.5 w-3.5" /> Edit</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDeleteTarget(u)} disabled={isSelf(u)} className="text-destructive focus:text-destructive disabled:opacity-40">
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Remove
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

      {/* ── Create Dialog ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-light tracking-wide">Add Admin User</DialogTitle>
            <DialogDescription className="font-sans text-xs text-muted-foreground">
              User will be able to sign in immediately with these credentials.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={hsC(onCreateSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Full Name *</Label>
              <Input {...rC('name')} placeholder="Jane Doe" className="font-sans text-sm" />
              {eC.name && <p className="text-xs text-destructive">{eC.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email *</Label>
              <Input {...rC('email')} type="email" placeholder="jane@example.com" className="font-sans text-sm" />
              {eC.email && <p className="text-xs text-destructive">{eC.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1.5"><KeyRound className="h-3 w-3" /> Password *</span>
              </Label>
              <Input {...rC('password')} type="password" placeholder="Min. 8 characters" className="font-sans text-sm" />
              {eC.password && <p className="text-xs text-destructive">{eC.password.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Role *</Label>
              <select {...rC('role')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {(Object.keys(ROLE_CONFIG) as AdminRole[]).map(r => (
                  <option key={r} value={r}>{ROLE_CONFIG[r].label} — {ROLE_CONFIG[r].desc}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="c_active" checked={wC('is_active')} onCheckedChange={v => svC('is_active', v)} />
              <Label htmlFor="c_active" className="font-sans text-sm cursor-pointer">Active immediately</Label>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setCreateOpen(false)} className="font-sans text-xs">Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating…</> : 'Create User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editingUser} onOpenChange={o => !o && setEditingUser(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-light tracking-wide">Edit User</DialogTitle>
          </DialogHeader>
          <form onSubmit={hsE(onEditSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Name</Label>
              <Input {...rE('name')} className="font-sans text-sm" />
              {eE.name && <p className="text-xs text-destructive">{eE.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Role</Label>
              <select {...rE('role')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                {(Object.keys(ROLE_CONFIG) as AdminRole[]).map(r => (
                  <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1.5"><KeyRound className="h-3 w-3" /> New Password (optional)</span>
              </Label>
              <Input {...rE('password')} type="password" placeholder="Leave blank to keep current" className="font-sans text-sm" />
            </div>
            <div className="flex items-center gap-3">
              <Switch id="e_active" checked={wE('is_active')} onCheckedChange={v => svE('is_active', v)} disabled={editingUser ? isSelf(editingUser) : false} />
              <Label htmlFor="e_active" className="font-sans text-sm cursor-pointer">Active</Label>
            </div>
            <DialogFooter className="gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setEditingUser(null)} className="font-sans text-xs">Cancel</Button>
              <Button type="submit" disabled={saving} className="bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90">
                {saving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…</> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Confirm ── */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={o => !o && setDeleteTarget(null)}
        title="Remove Admin User"
        description={`Remove "${deleteTarget?.name}" from the admin panel? They will lose all access immediately.`}
        confirmLabel="Remove"
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default AdminUsers;
