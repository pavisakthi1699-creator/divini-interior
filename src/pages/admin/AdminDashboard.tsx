import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp, TrendingDown, ShoppingCart, Package,
  Users, IndianRupee, ArrowUpRight, Loader2, MoreHorizontal,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { dashboardApi, type DashboardData } from '@/lib/api';
import { useAdminStore } from '@/stores/adminStore';

// ─── Mock chart data (used when DB is empty) ─────────────
const MOCK_CHART = [
  { day: '01 Jul', revenue: 8200  },
  { day: '02 Jul', revenue: 4100  },
  { day: '03 Jul', revenue: 12600 },
  { day: '04 Jul', revenue: 47800 },
  { day: '05 Jul', revenue: 3200  },
  { day: '06 Jul', revenue: 9800  },
  { day: '07 Jul', revenue: 5400  },
  { day: '08 Jul', revenue: 7100  },
  { day: '09 Jul', revenue: 11300 },
  { day: '10 Jul', revenue: 6700  },
  { day: '11 Jul', revenue: 9200  },
  { day: '12 Jul', revenue: 4800  },
  { day: '13 Jul', revenue: 14200 },
  { day: '14 Jul', revenue: 8900  },
  { day: '15 Jul', revenue: 22100 },
];

const STATUS_PILL: Record<string, { bg: string; text: string; dot: string }> = {
  pending:    { bg: '#FFF7E6', text: '#B45309', dot: '#F59E0B' },
  confirmed:  { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
  processing: { bg: '#F5F3FF', text: '#6D28D9', dot: '#8B5CF6' },
  shipped:    { bg: '#FDF4FF', text: '#7E22CE', dot: '#A855F7' },
  delivered:  { bg: '#ECFDF5', text: '#065F46', dot: '#10B981' },
  cancelled:  { bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444' },
  refunded:   { bg: '#F9FAFB', text: '#374151', dot: '#9CA3AF' },
};

// ─── Stat card ────────────────────────────────────────────
interface StatCardProps {
  title: string; sub: string; value: string;
  change?: number; icon: React.ElementType;
  accent: string; accentBg: string; href: string;
  linkLabel?: string;
}

const StatCard = ({ title, sub, value, change, icon: Icon, accent, accentBg, href, linkLabel }: StatCardProps) => (
  <div className="rounded-2xl bg-white border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="font-sans text-xs font-medium text-gray-400 mb-0.5">{title}</p>
        <p className="font-sans text-[11px] text-gray-400">{sub}</p>
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: accentBg }}>
        <Icon className="h-4.5 w-4.5" style={{ color: accent }} />
      </div>
    </div>

    <p className="font-display text-3xl font-semibold text-gray-900 tracking-tight mb-3">
      {value}
    </p>

    {change !== undefined && (
      <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${change >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
        {change >= 0
          ? <TrendingUp className="h-3 w-3" />
          : <TrendingDown className="h-3 w-3" />
        }
        {Math.abs(change)}%
      </div>
    )}

    <Link
      to={href}
      className="mt-4 flex items-center gap-1 font-sans text-[11px] font-semibold transition-colors"
      style={{ color: accent }}
    >
      {linkLabel ?? 'View all'} <ArrowUpRight className="h-3 w-3" />
    </Link>
  </div>
);

// ─── Custom chart tooltip ─────────────────────────────────
const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-100 bg-white px-3 py-2 shadow-lg">
      <p className="font-sans text-[11px] font-semibold text-gray-600 mb-1">{label}</p>
      <p className="font-sans text-xs text-gray-800">
        ₹{Number(payload[0]?.value ?? 0).toLocaleString('en-IN')}
      </p>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────
const AdminDashboard = () => {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { adminProfile }      = useAdminStore();

  useEffect(() => {
    dashboardApi.get()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-gray-400" />
    </div>
  );

  const stats  = data?.stats ?? { total_revenue: 0, total_orders: 0, total_customers: 0, total_products: 0 };
  const recent = data?.recent_orders ?? [];
  const chartData = (data?.revenue_chart?.length
    ? data.revenue_chart.map(r => ({ day: r.month, revenue: r.revenue }))
    : MOCK_CHART);

  return (
    <div className="space-y-6 pb-6">

      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-gray-900">Overview</h1>
          <p className="font-sans text-sm text-gray-400 mt-0.5">
            Here is the summary of overall data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-sans text-xs font-medium text-gray-600 shadow-sm">
            This Month
          </div>
          <button className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-sans text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-1.5">
            ↺ Reset Data
          </button>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          title="Total Revenue" sub="Store Revenue &amp; Sales"
          value={`₹${stats.total_revenue.toLocaleString('en-IN')}`}
          change={4.6} icon={IndianRupee}
          accent="#16A34A" accentBg="#F0FDF4"
          href="/studio/orders" linkLabel="See details"
        />
        <StatCard
          title="Total Orders" sub="Order Processing"
          value={String(stats.total_orders)}
          change={3.2} icon={ShoppingCart}
          accent="#2563EB" accentBg="#EFF6FF"
          href="/studio/orders" linkLabel="View all orders"
        />
        <StatCard
          title="Total Customers" sub="Customer Base Growth"
          value={String(stats.total_customers)}
          change={4.7} icon={Users}
          accent="#7C3AED" accentBg="#F5F3FF"
          href="/studio/customers" linkLabel="View customers"
        />
      </div>

      {/* ── Cash Flow chart ── */}
      <div className="rounded-2xl bg-white border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-1">
          <div>
            <h3 className="font-sans text-sm font-semibold text-gray-800">Cash Flow (Last 7 Days)</h3>
          </div>
          <span className="rounded-full bg-green-100 px-3 py-1 font-sans text-[11px] font-bold text-green-700">
            Realtime
          </span>
        </div>

        {/* Big revenue number */}
        <p className="font-display text-3xl font-semibold text-gray-900 mb-6 mt-2">
          ₹{stats.total_revenue.toLocaleString('en-IN')}
        </p>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={20}>
            <CartesianGrid strokeDasharray="0" stroke="#F3F4F6" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fontFamily: 'Montserrat', fill: '#9CA3AF' }}
              tickLine={false} axisLine={false}
            />
            <YAxis
              tickFormatter={v => v === 0 ? '0' : `${(v/1000).toFixed(0)}k`}
              tick={{ fontSize: 10, fontFamily: 'Montserrat', fill: '#9CA3AF' }}
              tickLine={false} axisLine={false}
            />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F9FAFB' }} />
            <Bar dataKey="revenue" fill="#16A34A" radius={[4, 4, 0, 0]}
              background={{ fill: '#F9FAFB', radius: 4 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Recent Activities ── */}
      <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h3 className="font-sans text-sm font-semibold text-gray-800">Recent Activities</h3>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className="h-8 rounded-lg border border-gray-200 bg-gray-50 pl-8 pr-3 font-sans text-xs text-gray-600 placeholder-gray-400 outline-none focus:border-gray-300 w-36"
              />
              <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button className="flex items-center gap-1.5 h-8 rounded-lg border border-gray-200 bg-gray-50 px-3 font-sans text-xs text-gray-500 hover:bg-gray-100 transition-colors">
              Filter ▾
            </button>
          </div>
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <ShoppingCart className="mb-3 h-10 w-10 text-gray-200" />
            <p className="font-sans text-sm text-gray-400">No orders yet.</p>
            <p className="font-sans text-xs text-gray-300 mt-1">Orders will appear here once customers start purchasing.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="w-8 px-4 py-3">
                    <input type="checkbox" className="rounded border-gray-200" />
                  </th>
                  {['Activity', 'Order ID', 'Date', 'Time', 'Price', 'Status'].map(h => (
                    <th key={h} className="px-3 py-3 text-left font-sans text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recent.map((o: any) => {
                  const s = STATUS_PILL[o.status] ?? STATUS_PILL.pending;
                  const date = new Date(o.created_at);
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/60 transition-colors group">
                      <td className="px-4 py-3.5">
                        <input type="checkbox" className="rounded border-gray-200" />
                      </td>
                      <td className="px-3 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                            <Users className="h-3.5 w-3.5 text-gray-400" />
                          </div>
                          <div>
                            <p className="font-sans text-xs font-semibold text-gray-800">{o.customer_name}</p>
                            <p className="font-sans text-[10px] text-gray-400">{o.customer_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3.5 font-sans text-xs text-gray-500">
                        {o.order_number}
                      </td>
                      <td className="px-3 py-3.5 font-sans text-xs text-gray-500">
                        {date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-3 py-3.5 font-sans text-xs text-gray-500">
                        {date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="px-3 py-3.5 font-sans text-xs font-semibold text-gray-800">
                        ₹{Number(o.total).toLocaleString('en-IN')}
                      </td>
                      <td className="px-3 py-3.5">
                        <span
                          className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold capitalize"
                          style={{ background: s.bg, color: s.text }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: s.dot }} />
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
