import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Loader2, ChevronRight, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { customerOrdersApi, type Order } from '@/lib/api';
import { toast } from 'sonner';

const STATUS_STYLE: Record<string, string> = {
  pending:    'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed:  'bg-blue-100 text-blue-800 border-blue-200',
  processing: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  shipped:    'bg-purple-100 text-purple-800 border-purple-200',
  delivered:  'bg-green-100 text-green-800 border-green-200',
  cancelled:  'bg-red-100 text-red-800 border-red-200',
  refunded:   'bg-gray-100 text-gray-800 border-gray-200',
};

const AccountOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    customerOrdersApi.list(page)
      .then(res => { setOrders(res.items); setTotalPages(res.total_pages); })
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-light tracking-wide">My Enquiries</h1>
        <p className="font-sans text-sm text-muted-foreground mt-1">Track and manage your quote enquiries</p>
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : orders.length === 0 ? (
        <div className="rounded-lg border border-border bg-card py-20 text-center">
          <ClipboardList className="mx-auto mb-4 h-12 w-12 text-muted-foreground/30" />
          <p className="font-display text-xl font-light mb-2">No enquiries yet</p>
          <p className="font-sans text-sm text-muted-foreground mb-6">When you submit an enquiry, it will appear here.</p>
          <Button asChild className="bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90">
            <Link to="/shop">Browse Office Chairs</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="rounded-lg border border-border bg-card p-5 hover:border-primary/30 transition-colors">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <p className="font-sans text-sm font-bold text-primary">{order.order_number}</p>
                    <Badge variant="outline" className={`font-sans text-xs ${STATUS_STYLE[order.status] ?? ''}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <Badge variant="outline" className="font-sans text-xs">
                      RFQ
                    </Badge>
                  </div>
                  <p className="font-sans text-xs text-muted-foreground mt-1">
                    {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                    {' · '}
                    {Array.isArray(order.items) ? order.items.length : 0} item{Array.isArray(order.items) && order.items.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-sans text-lg font-bold text-foreground">
                    ₹{Number(order.total).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Items preview */}
              {Array.isArray(order.items) && order.items.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                  {order.items.slice(0, 4).map((item: any, i: number) => (
                    <div key={i} className="flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.product_title} className="h-12 w-12 rounded border border-border object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded border border-border bg-muted flex items-center justify-center">
                          <Package className="h-4 w-4 text-muted-foreground/40" />
                        </div>
                      )}
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded border border-border bg-muted">
                      <span className="font-sans text-xs text-muted-foreground">+{order.items.length - 4}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 pt-2">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="font-sans text-xs">Previous</Button>
              <span className="flex items-center font-sans text-xs text-muted-foreground px-3">Page {page} of {totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="font-sans text-xs">Next</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AccountOrders;
