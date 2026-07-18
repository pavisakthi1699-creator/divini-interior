import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2, Loader2, ShoppingBag } from "lucide-react";

export const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { items, isLoading, isSyncing, updateQuantity, removeItem, syncCart } = useCartStore();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + (parseFloat(item.price.amount) * item.quantity), 0);

  useEffect(() => { if (isOpen) syncCart(); }, [isOpen, syncCart]);

  const handleCheckout = () => {
    setIsOpen(false);
    navigate("/checkout");
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <button className="relative group" aria-label="Shopping cart">
          <ShoppingCart className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground">
              {totalItems}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col h-full bg-background">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="font-display text-xl tracking-wide">Shopping Cart</SheetTitle>
          <SheetDescription>
            {totalItems === 0 ? "Your cart is empty" : `${totalItems} item${totalItems !== 1 ? 's' : ''} in your cart`}
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col flex-1 pt-6 min-h-0">
          {items.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="font-serif text-muted-foreground">Your cart is empty</p>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pr-2 min-h-0">
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.variantId} className="flex gap-4 border-b border-border pb-4">
                      <div className="w-20 h-20 bg-muted rounded overflow-hidden flex-shrink-0">
                        {item.product.node.images?.edges?.[0]?.node && (
                          <img src={item.product.node.images.edges[0].node.url} alt={item.product.node.title} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-sm tracking-wide truncate">{item.product.node.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">{item.selectedOptions.map(o => o.value).join(' · ')}</p>
                        <p className="font-sans text-sm font-medium mt-1">₹{parseFloat(item.price.amount).toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <button onClick={() => removeItem(item.variantId)} className="text-muted-foreground hover:text-foreground">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <div className="flex items-center gap-1 border border-border rounded">
                          <button className="px-2 py-1" onClick={() => updateQuantity(item.variantId, item.quantity - 1)}>
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs">{item.quantity}</span>
                          <button className="px-2 py-1" onClick={() => updateQuantity(item.variantId, item.quantity + 1)}>
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-shrink-0 space-y-4 pt-4 border-t border-border">
                <div className="flex justify-between items-center">
                  <span className="font-display text-lg tracking-wide">Total</span>
                  <span className="font-sans text-lg font-semibold">₹{totalPrice.toLocaleString('en-IN')}</span>
                </div>
                <Button
                  onClick={handleCheckout}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                  disabled={items.length === 0 || isLoading || isSyncing}
                >
                  {isLoading || isSyncing
                    ? <Loader2 className="w-4 h-4 animate-spin" />
                    : <><ShoppingBag className="w-4 h-4 mr-2" />Proceed to Checkout</>
                  }
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
