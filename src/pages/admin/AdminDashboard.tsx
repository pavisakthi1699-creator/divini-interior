import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, ShoppingCart, Users, IndianRupee, ArrowUpRight, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { dashboardApi, type DashboardData } from '@/lib/api';
import { useAdminStore } from '@/stores/adminStore';

const MOCK_CHART = [
  { day: 'Jan', revenue: 142000 }, { day: 'Feb', revenue: 198000 },
  { day: 'Mar', revenue: 175000 }, { day: 'Apr', revenue: 230000 },
  { day: 'May', revenue: 210000 }, { day: 'Jun', revenue: 285000 },
  { day: 'Jul', revenue: 320000 },
];

const STATUS_PILL: Record<string, { bg: string; text: string }> = {
  pending:    { bg: '#FFF7E6', text: '#B45309' },
  confirmed:  { bg: '#EFF6FF', text: '#1D4ED8' },
  processing: { bg: '#F5F3FF', text: '#6D28D9' },
  shipped:    { bg: '#F0F9FF', text: '#0369A1' },
  delivered:  { bg: '#F0FDF4', text: '#15803D' },
  cancelled:  { bg: '#FEF2F2', text: '#DC2626' },
  refunded:   { bg: '#F9FAFB', text: '#374151' },
};

const StatCard = ({ title, sub, value, change, icon: Icon, href, linkLabel, dark }: {
  title: string; sub: string; value: string; change?: number;
  icon: React.ElementType; href: string; linkLabel?: string; dark?: boolean;
}) => (
  <div className={`rounded-2xl p-5 border transition-shadow hover:shadow-md ${dark ? 'bg-black border-black' : 'bg-white border-gray-200'}`}>
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className={`font-sans text-xs font-medium mb-0.5 ${dark ? 'text-white/50' : 'text-gray-400'}`}>{title}</p>
        <p className={`font-sans text-[11px] ${dark ? 'text-white/35' : 'text-gray-400'}`}>{sub}</p>
      </div>
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${dark ? 'bg-white/10' : 'bg-gray-100'}`}>
        <Icon className={`h-4 w-4 ${dark ? 'text-white' : 'text-black'}`} />
      </div>
    </div>
    <p className={`font-display text-3xl font-semibold tracking-tight mb-3 ${dark ? 'text-white' : 'text-black'}`}>
      {value}
    </p>
    {change !== undefined && (
      <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${
        change >= 0 ? (dark ? 'bg-green-500/15 text-green-400' : 'bg-green-50 text-green-700') : 'bg-red-50 text-red-600'
      }`}>
        {change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        +{Math.abs(change)}%
      </div>
    )}
    <Link to={href} className={`mt-4 flex items-center gap-1 font-sans text-[11px] font-semibold ${dark ? 'text-white/60 hover:text-white' : 'text-gray-500 hover:text-black'} transition-colors`}>
      {linkLabel ?? 'View all'} <ArrowUpRight className="h-3 w-3" />
    </Link>
  </div>
);

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-lg">
      <p className="font-sans text-[11px] font-semibold text-gray-500 mb-0.5">{label}</p>
      <p className="font-sans text-sm font-bold text-black">₹{Number(payload[0]?.value ?? 0).toLocaleString('en-IN')}</p>
    </div>
  );
};

const AdminDashboard = () => {
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const { adminProfile }      = useAdminStore();

  useEffect(() => {
    dashboardApi.get().then(setData).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex h-64 items-center justify-center">
      <Loader2 className="h-7 w-7 animate-spin text-black" />
    </div>
  );

  const stats  = data?.stats ?? { total_revenue: 0, total_orders: 0, total_customers: 0, total_products: 0 };
  const recent = data?.recent_orders ?? [];
  const chartData = data?.revenue_chart?.length
    ? data.revenue_chart.map(r => ({ day: r.month, revenue: r.revenue }))
    : MOCK_CHART;

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-black">Overview</h1>
          <p className="font-sans text-sm text-gray-400 mt-0.5">Summary of your store performance</p>
        </div>
        <div className="flex gap-2">
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 font-sans text-xs font-medium text-gray-600">This Month</div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Revenue" sub="Store Revenue & Sales"
          value={`₹${stats.total_revenue.toLocaleString('en-IN')}`} change={4.6}
          icon={IndianRupee} href="/studio/orders" linkLabel="See details" dark />
        <StatCard title="Total Orders" sub="Order Processing"
          value={String(stats.total_orders)} change={3.2}
          icon={ShoppingCart} href="/studio/orders" linkLabel="View orders" />
        <StatCard title="Total Customers" sub="Customer Growth"
          value={String(stats.total_customers)} change={4.7}
          icon={Users} href="/studio/customers" linkLabel="View customers" />
      </div>

      {/* Revenue chart */}
      <div className="rounded-2xl bg-white border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-sans text-sm font-semibold text-black">Revenue Overview</h3>
          <span className="rounded-full bg-black px-3 py-1 font-sans text-[11px] font-bold text-white">Live</span>
        </div>
        <p className="font-display text-3xl font-semibold text-black mb-6">
          ₹{stats.total_revenue.toLocaleString('en-IN')}
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={20}>
            <CartesianGrid strokeDasharray="0" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fontFamily: 'Montserrat', fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={v => v === 0 ? '0' : `${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10, fontFamily: 'Montserrat', fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: '#F9FAFB' }} />
            <Bar dataKey="revenue" fill="#000000" radius={[4, 4, 0, 0]} background={{ fill: '#F9FAFB', radius: 4 }} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent orders */}
      <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-sans text-sm font-semibold text-black">Recent Orders</h3>
          <Link to="/studio/orders" className="font-sans text-xs font-semibold text-gray-500 hover:text-black transition-colors flex items-center gap-1">
            View All <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <ShoppingCart className="mb-3 h-10 w-10 text-gray-200" />
            <p className="font-sans text-sm text-gray-400">No orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Customer','Order ID','Date','Total','Status'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-sans text-[10px] font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((o: any) => {
                  const s = STATUS_PILL[o.status] ?? STATUS_PILL.pending;
                  return (
                    <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5">
                        <p className="font-sans text-xs font-semibold text-black">{o.customer_name}</p>
                        <p className="font-sans text-[10px] text-gray-400">{o.customer_email}</p>
                      </td>
                      <td className="px-5 py-3.5 font-sans text-xs font-semibold text-black">{o.order_number}</td>
                      <td className="px-5 py-3.5 font-sans text-xs text-gray-500">
                        {new Date(o.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 font-sans text-sm font-bold text-black">
                        ₹{Number(o.total).toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="inline-flex items-center rounded-full px-2.5 py-1 font-sans text-[11px] font-semibold capitalize"
                          style={{ background: s.bg, color: s.text }}>
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
