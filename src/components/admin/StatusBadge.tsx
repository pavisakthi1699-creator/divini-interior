import { Badge } from '@/components/ui/badge';
import type { OrderStatus, PaymentStatus, BlogStatus } from '@/types/database';

const ORDER_STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  pending:    { label: 'Pending',    className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  confirmed:  { label: 'Confirmed',  className: 'bg-blue-100 text-blue-800 border-blue-200' },
  processing: { label: 'Processing', className: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  shipped:    { label: 'Shipped',    className: 'bg-purple-100 text-purple-800 border-purple-200' },
  delivered:  { label: 'Delivered',  className: 'bg-green-100 text-green-800 border-green-200' },
  cancelled:  { label: 'Cancelled',  className: 'bg-red-100 text-red-800 border-red-200' },
  refunded:   { label: 'Refunded',   className: 'bg-gray-100 text-gray-800 border-gray-200' },
};

const PAYMENT_STATUS_CONFIG: Record<PaymentStatus, { label: string; className: string }> = {
  pending:  { label: 'Pending',  className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  paid:     { label: 'Paid',     className: 'bg-green-100 text-green-800 border-green-200' },
  failed:   { label: 'Failed',   className: 'bg-red-100 text-red-800 border-red-200' },
  refunded: { label: 'Refunded', className: 'bg-gray-100 text-gray-800 border-gray-200' },
};

const BLOG_STATUS_CONFIG: Record<BlogStatus, { label: string; className: string }> = {
  draft:     { label: 'Draft',     className: 'bg-gray-100 text-gray-800 border-gray-200' },
  published: { label: 'Published', className: 'bg-green-100 text-green-800 border-green-200' },
  archived:  { label: 'Archived',  className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
};

export const OrderStatusBadge = ({ status }: { status: OrderStatus }) => {
  const cfg = ORDER_STATUS_CONFIG[status] ?? { label: status, className: '' };
  return <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>{cfg.label}</Badge>;
};

export const PaymentStatusBadge = ({ status }: { status: PaymentStatus }) => {
  const cfg = PAYMENT_STATUS_CONFIG[status] ?? { label: status, className: '' };
  return <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>{cfg.label}</Badge>;
};

export const BlogStatusBadge = ({ status }: { status: BlogStatus }) => {
  const cfg = BLOG_STATUS_CONFIG[status] ?? { label: status, className: '' };
  return <Badge variant="outline" className={`text-xs font-medium ${cfg.className}`}>{cfg.label}</Badge>;
};
