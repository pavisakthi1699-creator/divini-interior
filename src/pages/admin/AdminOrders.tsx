import { useEffect, useState, useCallback } from 'react';
import { Search, Eye, Trash2, MoreHorizontal, ShoppingCart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { ordersApi, type Order, type OrderStatus, type PaymentStatus } from '@/lib/api';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/admin/StatusBadge';

const ORDER_STATUSES: OrderStatus[] = ['pending','confirmed','processing','shipped','delivered','cancelled','refunded'];
const PAYMENT_STATUSES: PaymentStatus[] = ['pending','paid','failed','refunded'];

const AdminOrders = () => {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [viewOrder, setViewOrder] = useState<Order | null>(null);
  const [delTarget, setDelTarget] = useState<Order | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string,string> = {};
      if (search) params.search = search;
      if (statusFilter !== 'all') params.status = statusFilter;
      const res = await ordersApi.list(params);
      setOrders(res.items); setTotal(res.total);
    } catch (e: any) { toast.error(e.message); }
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id: number, field: 'status' | 'payment_status', value: string) => {
    try {
      const updated = await ordersApi.update(id, { [field]: value } as any);
      setOrders(prev => prev.map(o => o.id === id ? updated : o));
      if (viewOrder?.id === id) setViewOrder(updated);
      toast.success('Status updated');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDelete = async () => {
    if (!delTarget) return;
    try { await ordersApi.delete(delTarget.id); toast.success('Deleted'); load(); }
    catch (e: any) { toast.error(e.message); }
    setDelTarget(null);
  };

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total), 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-light tracking-wide">Orders</h1>
          <p className="font-sans text-sm text-muted-foreground">{total} orders · ₹{totalRevenue.toLocaleString('en-IN')} total</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by order #, name or email…" className="pl-9 font-sans text-sm" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
          <SelectTrigger className="w-full sm:w-44 font-sans text-sm"><SelectValue placeholder="All statuses" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {ORDER_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-sans text-sm text-muted-foreground">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30">
                <tr>{['Order #','Customer','Date','Items','Total','Status','Payment','Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-sans text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap">{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-sans text-xs font-bold text-primary whitespace-nowrap">{o.order_number}</td>
                    <td className="px-4 py-3">
                      <p className="font-sans text-xs font-medium">{o.customer_name}</p>
                      <p className="font-sans text-[11px] text-muted-foreground">{o.customer_email}</p>
                    </td>
                    <td className="px-4 py-3 font-sans text-xs text-muted-foreground whitespace-nowrap">{new Date(o.created_at).toLocaleDateString('en-IN')}</td>
                    <td className="px-4 py-3 font-sans text-xs text-muted-foreground text-center">{Array.isArray(o.items) ? o.items.length : '—'}</td>
                    <td className="px-4 py-3 font-sans text-sm font-semibold whitespace-nowrap">₹{Number(o.total).toLocaleString('en-IN')}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Select value={o.status} onValueChange={v => updateStatus(o.id, 'status', v)}>
                        <SelectTrigger className="h-7 w-32 border-0 p-0 shadow-none focus:ring-0"><OrderStatusBadge status={o.status} /></SelectTrigger>
                        <SelectContent>{ORDER_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Select value={o.payment_status} onValueChange={v => updateStatus(o.id, 'payment_status', v)}>
                        <SelectTrigger className="h-7 w-28 border-0 p-0 shadow-none focus:ring-0"><PaymentStatusBadge status={o.payment_status} /></SelectTrigger>
                        <SelectContent>{PAYMENT_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>)}</SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setViewOrder(o)}><Eye className="mr-2 h-3.5 w-3.5" /> View Details</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => setDelTarget(o)} className="text-destructive focus:text-destructive"><Trash2 className="mr-2 h-3.5 w-3.5" /> Delete</DropdownMenuItem>
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

      {/* Order Detail */}
      <Dialog open={!!viewOrder} onOpenChange={o => !o && setViewOrder(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {viewOrder && <>
            <DialogHeader><DialogTitle className="font-display text-lg font-light">Order {viewOrder.order_number}</DialogTitle></DialogHeader>
            <div className="space-y-5 pt-2">
              <div className="flex flex-wrap gap-3">
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Order Status</p>
                  <Select value={viewOrder.status} onValueChange={v => updateStatus(viewOrder.id, 'status', v)}>
                    <SelectTrigger className="h-8 w-36 font-sans text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{ORDER_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Payment</p>
                  <Select value={viewOrder.payment_status} onValueChange={v => updateStatus(viewOrder.id, 'payment_status', v)}>
                    <SelectTrigger className="h-8 w-32 font-sans text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>{PAYMENT_STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-muted/20 p-4">
                  <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Customer</p>
                  <p className="font-sans text-sm font-semibold">{viewOrder.customer_name}</p>
                  <p className="font-sans text-xs text-muted-foreground">{viewOrder.customer_email}</p>
                  {viewOrder.customer_phone && <p className="font-sans text-xs text-muted-foreground">{viewOrder.customer_phone}</p>}
                </div>
                {viewOrder.shipping_address && (
                  <div className="rounded-lg border border-border bg-muted/20 p-4">
                    <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Ship To</p>
                    <div className="font-sans text-xs text-foreground space-y-0.5">
                      <p>{viewOrder.shipping_address.line1}</p>
                      <p>{viewOrder.shipping_address.city}, {viewOrder.shipping_address.state} {viewOrder.shipping_address.postal_code}</p>
                      <p>{viewOrder.shipping_address.country}</p>
                    </div>
                  </div>
                )}
              </div>
              {Array.isArray(viewOrder.items) && viewOrder.items.length > 0 && (
                <div>
                  <p className="font-sans text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Items</p>
                  <div className="space-y-2">
                    {viewOrder.items.map((item: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 rounded border border-border p-3">
                        {item.image && <img src={item.image} alt="" className="h-10 w-10 rounded object-cover flex-shrink-0" />}
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-xs font-semibold line-clamp-1">{item.product_title}</p>
                          <p className="font-sans text-[11px] text-muted-foreground">{item.variant_title} × {item.quantity}</p>
                        </div>
                        <p className="font-sans text-sm font-bold">₹{Number(item.total).toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
                <div className="flex justify-between font-sans text-xs text-muted-foreground"><span>Subtotal</span><span>₹{Number(viewOrder.subtotal).toLocaleString('en-IN')}</span></div>
                <div className="flex justify-between font-sans text-xs text-muted-foreground"><span>Shipping</span><span>₹{Number(viewOrder.shipping_cost).toLocaleString('en-IN')}</span></div>
                {viewOrder.discount > 0 && <div className="flex justify-between font-sans text-xs text-green-600"><span>Discount</span><span>−₹{Number(viewOrder.discount).toLocaleString('en-IN')}</span></div>}
                <div className="flex justify-between border-t border-border pt-2 font-sans text-sm font-bold"><span>Total</span><span>₹{Number(viewOrder.total).toLocaleString('en-IN')}</span></div>
              </div>
            </div>
          </>}
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={!!delTarget} onOpenChange={o => !o && setDelTarget(null)}
        title="Delete Order" description={`Delete order ${delTarget?.order_number}? Cannot be undone.`}
        confirmLabel="Delete" onConfirm={handleDelete} />
    </div>
  );
};
export default AdminOrders;
