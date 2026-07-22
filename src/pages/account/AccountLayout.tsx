import { useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { User, ShoppingBag, MapPin, Settings, LogOut, ChevronRight, ClipboardList } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useCustomerStore } from '@/stores/customerStore';
import { getCustomerToken } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const NAV = [
  { label: 'My Enquiries',  href: '/account/orders',   icon: ClipboardList },
  { label: 'Profile',    href: '/account/profile',   icon: User },
  { label: 'Addresses',  href: '/account/addresses', icon: MapPin },
];

const AccountLayout = () => {
  const { user, signOut, loadMe } = useCustomerStore();
  const navigate  = useNavigate();
  const location  = useLocation();

  useEffect(() => {
    if (!getCustomerToken()) { navigate('/auth?redirect=' + location.pathname, { replace: true }); return; }
    if (!user) loadMe();
  }, []);

  if (!getCustomerToken()) return null;

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'ME';

  const handleSignOut = () => { signOut(); navigate('/'); };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-12">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">

          {/* Sidebar */}
          <aside className="space-y-2">
            {/* User card */}
            <div className="rounded-lg border border-border bg-card p-5 mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="font-sans text-sm font-semibold text-foreground truncate">{user?.name ?? '…'}</p>
                  <p className="font-sans text-[11px] text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Nav links */}
            <nav className="space-y-1">
              {NAV.map(item => {
                const Icon    = item.icon;
                const active  = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
                return (
                  <Link key={item.href} to={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-4 py-2.5 font-sans text-sm transition-colors',
                      active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    )}>
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {active && <ChevronRight className="h-3 w-3 opacity-60" />}
                  </Link>
                );
              })}
              <button onClick={handleSignOut}
                className="flex w-full items-center gap-3 rounded-md px-4 py-2.5 font-sans text-sm text-muted-foreground hover:bg-muted hover:text-destructive transition-colors mt-2">
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </nav>
          </aside>

          {/* Content */}
          <main><Outlet /></main>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AccountLayout;
