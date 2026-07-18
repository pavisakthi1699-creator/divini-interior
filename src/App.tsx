import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useCartSync } from "@/hooks/useCartSync";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

// ── Storefront pages ──────────────────────────────────────
import Index from "./pages/Index";
import Shop from "./pages/Shop";
import Sale from "./pages/Sale";
import About from "./pages/About";
import Contact from "./pages/Contact";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";

// ── Customer pages ────────────────────────────────────────
import CustomerAuth from "./pages/CustomerAuth";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import AccountLayout from "./pages/account/AccountLayout";
import AccountOrders from "./pages/account/AccountOrders";
import AccountProfile from "./pages/account/AccountProfile";
import AccountAddresses from "./pages/account/AccountAddresses";

// ── Admin pages ───────────────────────────────────────────
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminBlogs from "./pages/admin/AdminBlogs";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminUsers from "./pages/admin/AdminUsers";

// ── Layout / stores ───────────────────────────────────────
import { AdminLayout } from "./components/admin/AdminLayout";
import { useAdminStore } from "./stores/adminStore";
import { useCustomerStore } from "./stores/customerStore";
import { getToken, getCustomerToken } from "./lib/api";

const queryClient = new QueryClient();

// ── Admin protected route ─────────────────────────────────
const AdminGuard = () => {
  const { user, loadMe } = useAdminStore();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!getToken()) { setChecking(false); return; }
    if (user)        { setChecking(false); return; }
    loadMe().finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: '#0f0d0b' }}>
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#C9A96E' }} />
      </div>
    );
  }
  if (!getToken() || !user) return <Navigate to="/studio/login" replace />;
  return <AdminLayout><Outlet /></AdminLayout>;
};

const AdminLoginGuard = () => {
  const { user } = useAdminStore();
  if (getToken() && user) return <Navigate to="/studio" replace />;
  return <AdminLogin />;
};

// ── App routes ────────────────────────────────────────────
const AppContent = () => {
  useCartSync();

  const { loadMe } = useCustomerStore();
  useEffect(() => {
    if (getCustomerToken()) loadMe();
  }, []);

  return (
    <Routes>
      {/* ── Storefront ── */}
      <Route path="/"                    element={<Index />} />
      <Route path="/shop"                element={<Shop />} />
      <Route path="/sale"                element={<Sale />} />
      <Route path="/about"               element={<About />} />
      <Route path="/contact"             element={<Contact />} />
      <Route path="/product/:handle"     element={<ProductDetail />} />
      <Route path="/blogs"               element={<Blogs />} />
      <Route path="/blog/:slug"          element={<BlogDetail />} />

      {/* ── Customer auth ── */}
      <Route path="/auth"                element={<CustomerAuth />} />

      {/* ── Checkout flow ── */}
      <Route path="/checkout"            element={<Checkout />} />
      <Route path="/order-confirmation"  element={<OrderConfirmation />} />

      {/* ── Customer account ── */}
      <Route path="/account"             element={<AccountLayout />}>
        <Route index                     element={<Navigate to="/account/orders" replace />} />
        <Route path="orders"             element={<AccountOrders />} />
        <Route path="profile"            element={<AccountProfile />} />
        <Route path="addresses"          element={<AccountAddresses />} />
      </Route>

      {/* ── Admin — /studio prefix ── */}
      <Route path="/studio/login"        element={<AdminLoginGuard />} />

      <Route path="/studio"              element={<AdminGuard />}>
        <Route index                     element={<AdminDashboard />} />
        <Route path="products"           element={<AdminProducts />} />
        <Route path="orders"             element={<AdminOrders />} />
        <Route path="blogs"              element={<AdminBlogs />} />
        <Route path="customers"          element={<AdminCustomers />} />
        <Route path="users"              element={<AdminUsers />} />
      </Route>

      {/* Legacy redirect — old /admin links still work */}
      <Route path="/admin/login"         element={<Navigate to="/studio/login" replace />} />
      <Route path="/admin/*"             element={<Navigate to="/studio" replace />} />

      <Route path="*"                    element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
