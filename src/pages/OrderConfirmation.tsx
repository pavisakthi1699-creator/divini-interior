import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, Home, User, Mail, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCustomerStore } from '@/stores/customerStore';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const OrderConfirmation = () => {
  const [params]  = useSearchParams();
  const orderNum  = params.get('order')  ?? '';
  const totalStr  = params.get('total')  ?? '0';
  const total     = parseFloat(totalStr);
  const { user }  = useCustomerStore();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="font-display text-3xl font-light tracking-wide text-foreground mb-3">Enquiry Submitted!</h1>
          <p className="font-sans text-sm text-muted-foreground mb-2">
            Your enquiry has been received and our team will get back to you shortly with a customized quote.
          </p>
          {orderNum && (
            <p className="font-sans text-base font-semibold text-primary mb-1">Enquiry #{orderNum}</p>
          )}
          {total > 0 && (
            <p className="font-sans text-sm text-muted-foreground mb-8">
              Est. Value: <strong className="text-foreground">₹{total.toLocaleString('en-IN')}</strong>
            </p>
          )}

          {/* RFQ next steps */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-8 text-left">
            <div className="flex items-start gap-3">
              <Truck className="mt-0.5 h-5 w-5 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-sans text-sm font-semibold text-blue-900">Next Steps</p>
                <p className="font-sans text-xs text-blue-700 mt-1">
                  Our seating experts will check stock availability and calculate shipping details. We will send you a formal quotation via email shortly.
                </p>
              </div>
            </div>
          </div>

          {/* Email notice */}
          <div className="flex items-center gap-3 justify-center rounded-lg border border-border bg-muted/30 p-4 mb-8">
            <Mail className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <p className="font-sans text-xs text-muted-foreground text-left">
              A confirmation email with your enquiry details has been sent to your inbox.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
             {user ? (
              <Button asChild className="flex-1 bg-primary font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground hover:bg-primary/90">
                <Link to="/account/orders"><User className="mr-2 h-4 w-4" /> View My Enquiries</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="flex-1 font-sans text-xs font-semibold uppercase tracking-widest">
                <Link to="/auth"><User className="mr-2 h-4 w-4" /> Create Account to Track</Link>
              </Button>
            )}
            <Button asChild variant="outline" className="flex-1 font-sans text-xs font-semibold uppercase tracking-widest">
              <Link to="/shop"><ShoppingBag className="mr-2 h-4 w-4" /> Continue Browsing</Link>
            </Button>
            <Button asChild variant="ghost" className="flex-1 font-sans text-xs text-muted-foreground">
              <Link to="/"><Home className="mr-2 h-4 w-4" /> Home</Link>
            </Button>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
