import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, FileText,
  Users, UserCog, LogOut, Menu, ChevronRight,
  Bell, Settings, ExternalLink, BarChart2,
  Tag, HelpCircle, MessageSquare,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAdminStore } from '@/stores/adminStore';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

// ─── Navigation groups matching reference screenshot ─────
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { label: 'Dashboard', href: '/studio',         icon: LayoutDashboard },
      { label: 'Analytics', href: '/studio/analytics', icon: BarChart2 },
    ],
  },
  {
    label: 'Sales',
    items: [
      { label: 'Orders',    href: '/studio/orders',    icon: ShoppingCart },
    ],
  },
  {
    label: 'Store',
    items: [
      { label: 'Products',  href: '/studio/products',  icon: Package },
      { label: 'Customers', href: '/studio/customers', icon: Users },
    ],
  },
  {
    label: 'Content',
    items: [
      { label: 'Blogs',     href: '/studio/blogs',     icon: FileText },
    ],
  },
  {
    label: 'System',
    items: [
      { label: 'Settings',      href: '/studio/users',    icon: Settings },
      { label: 'Staff members', href: '/studio/users',    icon: UserCog },
    ],
  },
];

const PAGE_NAMES: Record<string, string> = {
  '':          'Dashboard',
  'analytics': 'Analytics',
  'products':  'Products',
  'orders':    'Orders',
  'blogs':     'Blogs',
  'customers': 'Customers',
  'users':     'Settings',
};

interface AdminLayoutProps { children: React.ReactNode; }

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const [mobileSidebarOpen, setMobile] = useState(false);
  const location  = useLocation();
  const navigate  = useNavigate();
  const { adminProfile, signOut } = useAdminStore();

  const handleSignOut = async () => { await signOut(); navigate('/studio/login'); };

  const initials = adminProfile?.name
    ? adminProfile.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  const currentSegment = location.pathname.split('/').pop() ?? '';
  const currentPage    = PAGE_NAMES[currentSegment] ?? 'Dashboard';

  // ── Single nav link ──────────────────────────────────
  const NavItem = ({ item }: { item: { label: string; href: string; icon: React.ElementType } }) => {
    const Icon = item.icon;
    const isActive =
      item.href === '/studio'
        ? location.pathname === '/studio'
        : location.pathname.startsWith(item.href);

    return (
      <Link
        to={item.href}
        onClick={() => setMobile(false)}
        className={cn(
          'flex items-center gap-2.5 rounded-lg px-3 py-2 transition-all duration-150 group',
          isActive
            ? 'bg-gray-100 text-gray-900 font-semibold'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
        )}
      >
        <Icon className={cn('h-4 w-4 flex-shrink-0', isActive ? 'text-gray-800' : 'text-gray-400 group-hover:text-gray-600')} />
        <span className="font-sans text-[13px] leading-none">{item.label}</span>
      </Link>
    );
  };

  // ── Full sidebar content ─────────────────────────────
  const SidebarContent = () => (
    <div className="flex h-full flex-col bg-white border-r border-gray-100">

      {/* Logo / brand */}
      <div className="flex h-[60px] items-center gap-3 border-b border-gray-100 px-5">
        <Link to="/studio" className="flex items-center gap-2.5">
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg"
            style={{ background: 'linear-gradient(135deg,#3a4132,#2c3226)' }}
          >
            <span className="font-display text-xs font-bold text-white">DI</span>
          </div>
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold text-gray-900 leading-none tracking-wide">
              Divine Interior
            </p>
            <p className="font-sans text-[9px] uppercase tracking-[0.25em] text-gray-400 mt-0.5">
              Admin
            </p>
          </div>
        </Link>
      </div>

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
        {NAV_GROUPS.map(group => (
          <div key={group.label}>
            <p className="mb-1.5 px-3 font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map(item => <NavItem key={item.href + item.label} item={item} />)}
            </div>
          </div>
        ))}

        {/* Divider */}
        <div className="border-t border-gray-100 pt-4">
          {/* View storefront */}
          <Link
            to="/"
            target="_blank"
            onClick={() => setMobile(false)}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-gray-400 hover:bg-gray-50 hover:text-gray-700 transition-all group"
          >
            <ExternalLink className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-gray-600" />
            <span className="font-sans text-[13px]">View Store</span>
          </Link>

          {/* Log out */}
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all group"
          >
            <LogOut className="h-4 w-4 flex-shrink-0 text-gray-400 group-hover:text-red-400" />
            <span className="font-sans text-[13px]">Log out</span>
          </button>
        </div>
      </nav>

      {/* User card at bottom */}
      <div className="border-t border-gray-100 p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50 transition-colors">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback
                  className="text-white text-xs font-bold"
                  style={{ background: 'linear-gradient(135deg,#3a4132,#2c3226)' }}
                >
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <p className="font-sans text-xs font-semibold text-gray-800 truncate leading-none">
                  {adminProfile?.name ?? 'Admin'}
                </p>
                <p className="font-sans text-[10px] text-gray-400 truncate mt-0.5 capitalize">
                  {adminProfile?.email ?? 'admin@divine.com'}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-52 mb-1">
            <DropdownMenuLabel className="font-normal">
              <p className="font-semibold text-sm">{adminProfile?.name ?? 'Admin'}</p>
              <p className="text-xs text-muted-foreground">{adminProfile?.email ?? ''}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link to="/studio/users" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" /> Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#F8F7F5]">

      {/* ── Desktop Sidebar (fixed 224px) ── */}
      <aside className="hidden lg:flex w-56 flex-shrink-0 flex-col">
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar overlay ── */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              onClick={() => setMobile(false)}
            />
            <motion.aside
              initial={{ x: -240 }} animate={{ x: 0 }} exit={{ x: -240 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute left-0 top-0 flex h-full w-56 flex-col"
            >
              <SidebarContent />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ── Main area ── */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Topbar */}
        <header className="flex h-[60px] flex-shrink-0 items-center justify-between border-b border-gray-100 bg-white px-5 lg:px-6">

          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setMobile(true)}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-gray-100 lg:hidden transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Page title */}
            <h2 className="font-sans text-sm font-semibold text-gray-700 hidden sm:block">
              {currentPage}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Help */}
            <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-colors">
              <HelpCircle className="h-4.5 w-4.5" />
            </button>

            {/* Messages */}
            <button className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-colors">
              <MessageSquare className="h-4.5 w-4.5" />
            </button>

            {/* Notifications */}
            <button className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-100 transition-colors">
              <Bell className="h-4.5 w-4.5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Avatar dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-gray-100 transition-colors ml-1">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback
                      className="text-white text-[10px] font-bold"
                      style={{ background: 'linear-gradient(135deg,#3a4132,#2c3226)' }}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="font-normal">
                  <p className="font-semibold text-sm">{adminProfile?.name ?? 'Admin'}</p>
                  <p className="text-xs text-muted-foreground truncate">{adminProfile?.email ?? ''}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/studio/users" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" /> Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-5 lg:p-7">
          {children}
        </main>
      </div>
    </div>
  );
};
