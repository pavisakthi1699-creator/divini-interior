import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, ShoppingBag, Truck, MapPin, User, Phone, Mail, ChevronRight, Banknote } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useCartStore } from '@/stores/cartStore';
import { useCustomerStore } from '@/stores/customerStore';
import { checkoutApi } from '@/lib/api';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const checkoutSchema = z.object({
  customer_name:  z.string().min(2, 'Name is required'),
  customer_email: z.string().email('Valid email required'),
  customer_phone: z.string().min(10, 'Valid phone required'),
  addr_line1:     z.string().min(3, 'Address is required'),
  addr_line2:     z.string().optional(),
  addr_city:      z.string().min(1, 'City is required'),
  addr_state:     z.string().min(1, 'State is required'),
  addr_postal:    z.string().min(4, 'Postal code is required'),
  addr_country:   z.string().default('India'),
  notes:          z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const INDIAN_STATES = ['Andhra Pradesh','Assam','Bihar','Chhattisgarh','Delhi','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal'];

const Checkout = () => {
  const navigate   = useNavigate();
  const { items, clearCart } = useCartStore();
  const { user }   = useCustomerStore();
  const [placing, setPlacing] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customer_name:  user?.name  ?? '',
      customer_email: user?.email ?? '',
      customer_phone: user?.phone ?? '',
      addr_country: 'India',
      // pre-fill first saved address
      addr_line1:  (user?.addresses?.[0]?.line1)  ?? '',
      addr_line2:  (user?.addresses?.[0]?.line2)  ?? '',
      addr_city:   (user?.addresses?.[0]?.city)   ?? '',
      addr_state:  (user?.addresses?.[0]?.state)  ?? '',
      addr_postal: (user?.addresses?.[0]?.postal_code) ?? '',
    },
  });

  // Build cart items for API
  const cartItems = items.map(item => ({
    product_id:    item.product.node.id,
    product_title: item.product.node.title,
    variant_title: item.variantTitle,
    price:         parseFloat(item.price.amount),
    quantity:      item.quantity,
    image:         item.product.node.images?.edges?.[0]?.node?.url,
  }));

  const subtotal     = items.reduce((s, i) => s + parseFloat(i.price.amount) * i.quantity, 0);
  const shippingCost = subtotal >= 50000 ? 0 : 500;
  const total        = subtotal + shippingCost;

  // Redirect if cart empty
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 text-center px-6">
          <ShoppingBag className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h2 className="font-display text-2xl font-light mb-3">Your cart is empty</h2>
          <p className="font-sans text-sm text-muted-foreground mb-6">Add some products before checking out.</p>
          <Button asChild className="bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90">
            <Link to="/shop">Continue Shopping</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const onSubmit = async (data: CheckoutForm) => {
    setPlacing(true);
    try {
      const res = await checkoutApi.place({
        customer_name:  data.customer_name,
        customer_email: data.customer_email,
        customer_phone: data.customer_phone,
        shipping_address: {
          name:        data.customer_name,
          line1:       data.addr_line1,
          line2:       data.addr_line2,
          city:        data.addr_city,
          state:       data.addr_state,
          postal_code: data.addr_postal,
          country:     data.addr_country,
        },
        items: cartItems,
        notes: data.notes,
        total,
      });

      clearCart();
      navigate(`/order-confirmation?order=${res.order_number}&total=${res.total}`);
    } catch (e: any) {
      toast.error('Order failed', { description: e.message });
    }
    setPlacing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-12 lg:px-12">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 font-sans text-xs text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Continue Shopping
        </Link>

        <h1 className="font-display text-3xl font-light tracking-wide mb-8">Checkout</h1>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">

            {/* ── Left column ── */}
            <div className="space-y-6">

              {/* Contact */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="font-display text-lg font-light tracking-wide">Contact Information</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Full Name *</Label>
                    <Input {...register('customer_name')} placeholder="Your full name" className="font-sans text-sm" />
                    {errors.customer_name && <p className="text-xs text-destructive">{errors.customer_name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Email *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input {...register('customer_email')} type="email" placeholder="your@email.com" className="pl-9 font-sans text-sm" />
                    </div>
                    {errors.customer_email && <p className="text-xs text-destructive">{errors.customer_email.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Phone *</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input {...register('customer_phone')} type="tel" placeholder="+91 98765 43210" className="pl-9 font-sans text-sm" />
                    </div>
                    {errors.customer_phone && <p className="text-xs text-destructive">{errors.customer_phone.message}</p>}
                  </div>
                </div>
              </motion.div>

              {/* Shipping address */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="font-display text-lg font-light tracking-wide">Shipping Address</h2>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Address Line 1 *</Label>
                    <Input {...register('addr_line1')} placeholder="Street, building, apartment" className="font-sans text-sm" />
                    {errors.addr_line1 && <p className="text-xs text-destructive">{errors.addr_line1.message}</p>}
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Address Line 2</Label>
                    <Input {...register('addr_line2')} placeholder="Landmark, area (optional)" className="font-sans text-sm" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">City *</Label>
                    <Input {...register('addr_city')} placeholder="Mumbai" className="font-sans text-sm" />
                    {errors.addr_city && <p className="text-xs text-destructive">{errors.addr_city.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">State *</Label>
                    <select {...register('addr_state')} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 font-sans text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                      <option value="">Select state</option>
                      {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.addr_state && <p className="text-xs text-destructive">{errors.addr_state.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Postal Code *</Label>
                    <Input {...register('addr_postal')} placeholder="400001" className="font-sans text-sm" />
                    {errors.addr_postal && <p className="text-xs text-destructive">{errors.addr_postal.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-sans text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Country</Label>
                    <Input {...register('addr_country')} className="font-sans text-sm" readOnly />
                  </div>
                </div>
              </motion.div>

              {/* Payment method */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-lg border border-border bg-card p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                    <Banknote className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="font-display text-lg font-light tracking-wide">Payment Method</h2>
                </div>
                <div className="flex items-start gap-3 rounded-lg border-2 border-primary bg-primary/5 p-4">
                  <div className="mt-0.5 h-4 w-4 rounded-full border-4 border-primary flex-shrink-0" />
                  <div>
                    <p className="font-sans text-sm font-semibold text-foreground">Cash on Delivery (COD)</p>
                    <p className="font-sans text-xs text-muted-foreground mt-0.5">Pay in cash when your order arrives. Please keep the exact amount ready.</p>
                  </div>
                </div>
              </motion.div>

              {/* Notes */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="rounded-lg border border-border bg-card p-6">
                <h2 className="font-display text-base font-light tracking-wide mb-4">Order Notes (optional)</h2>
                <Textarea {...register('notes')} rows={2} placeholder="Special instructions, delivery preferences…" className="font-sans text-sm resize-none" />
              </motion.div>
            </div>

            {/* ── Right column — Order Summary ── */}
            <div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-lg border border-border bg-card p-6 sticky top-24">
                <h2 className="font-display text-lg font-light tracking-wide mb-5">Order Summary</h2>

                <div className="space-y-3 mb-5 max-h-64 overflow-y-auto">
                  {items.map(item => {
                    const img  = item.product.node.images?.edges?.[0]?.node?.url;
                    const price = parseFloat(item.price.amount);
                    return (
                      <div key={item.variantId} className="flex items-center gap-3">
                        <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded border border-border bg-muted">
                          {img && <img src={img} alt={item.product.node.title} className="h-full w-full object-cover" />}
                          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-sans text-xs font-medium line-clamp-1">{item.product.node.title}</p>
                          <p className="font-sans text-[11px] text-muted-foreground">{item.variantTitle}</p>
                        </div>
                        <p className="font-sans text-xs font-semibold flex-shrink-0">₹{(price * item.quantity).toLocaleString('en-IN')}</p>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between font-sans text-xs text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-sans text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Truck className="h-3 w-3" /> Shipping</span>
                    <span>{shippingCost === 0 ? <span className="text-green-600">Free</span> : `₹${shippingCost}`}</span>
                  </div>
                  {shippingCost > 0 && (
                    <p className="font-sans text-[10px] text-muted-foreground/60">Free shipping on orders above ₹50,000</p>
                  )}
                  <div className="flex justify-between border-t border-border pt-3 font-sans text-base font-bold text-foreground">
                    <span>Total</span>
                    <span>₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <Button type="submit" disabled={placing}
                  className="mt-5 w-full bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90 py-6">
                  {placing
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing Order…</>
                    : <><ShoppingBag className="mr-2 h-4 w-4" /> Place Order (COD)</>
                  }
                </Button>

                {!user && (
                  <p className="mt-3 text-center font-sans text-[11px] text-muted-foreground">
                    <Link to="/auth?redirect=/checkout" className="text-primary hover:underline">Sign in</Link> to track your order
                  </p>
                )}
              </motion.div>
            </div>

          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
