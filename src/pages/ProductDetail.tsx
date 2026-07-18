import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ArrowLeft, ShoppingCart, Package, Star } from "lucide-react";
import { productsApi, type Product } from "@/lib/api";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Convert MySQL product → cart-compatible shape
function toCartProduct(p: Product) {
  return {
    node: {
      id: String(p.id),
      title: p.title,
      description: p.description,
      handle: p.slug,
      priceRange: {
        minVariantPrice: { amount: String(p.price), currencyCode: p.currency },
      },
      images: {
        edges: p.images.map(url => ({ node: { url, altText: p.title } })),
      },
      variants: {
        edges: [{
          node: {
            id: `variant-${p.id}`,
            title: 'Default',
            price: { amount: String(p.price), currencyCode: p.currency },
            compareAtPrice: p.compare_at_price
              ? { amount: String(p.compare_at_price), currencyCode: p.currency }
              : null,
            availableForSale: p.stock > 0,
            selectedOptions: [{ name: 'Size', value: 'Standard' }],
          },
        }],
      },
      options: (p.options as any[]) || [],
    },
  };
}

const ProductDetail = () => {
  const { handle } = useParams<{ handle: string }>();
  const [product, setProduct]           = useState<Product | null>(null);
  const [loading, setLoading]           = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem   = useCartStore(s => s.addItem);
  const isLoading = useCartStore(s => s.isLoading);

  useEffect(() => {
    if (!handle) return;
    setLoading(true);
    productsApi.getBySlug(handle)
      .then(p => setProduct(p))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [handle]);

  const handleAddToCart = async () => {
    if (!product) return;
    const cartProduct = toCartProduct(product);
    const variant = cartProduct.node.variants.edges[0].node;
    await addItem({
      product: cartProduct as any,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions,
    });
    toast.success("Added to cart", { description: product.title });
  };

  // ─── Loading ─────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // ─── Not found ───────────────────────────────────────────
  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center pt-40 text-center px-6">
          <Package className="mb-4 h-16 w-16 text-muted-foreground/30" />
          <h2 className="font-display text-2xl font-light mb-2">Product Not Found</h2>
          <p className="font-sans text-sm text-muted-foreground mb-6">
            This product doesn't exist or may have been removed.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.2em] text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  const images       = product.images;
  const inStock      = product.stock > 0;
  const currentAmt   = Number(product.price);
  const compareAmt   = product.compare_at_price ? Number(product.compare_at_price) : null;
  const discount     = compareAmt && compareAmt > currentAmt
    ? Math.round(((compareAmt - currentAmt) / compareAmt) * 100)
    : null;
  const options      = (product.options as any[]) ?? [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="mx-auto max-w-7xl px-6 pt-28 pb-20 lg:px-12">
        <Link
          to="/shop"
          className="mb-8 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Shop
        </Link>

        <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">

          {/* ── Images ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Main image */}
            <div className="aspect-square overflow-hidden rounded-md bg-[#F8F9FA] relative">
              {images[selectedImage] ? (
                <img
                  src={images[selectedImage]}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ShoppingCart className="h-16 w-16 text-muted-foreground/30" />
                </div>
              )}
              {discount && (
                <span className="absolute left-3 top-3 bg-primary text-primary-foreground text-[10px] font-bold px-2.5 py-1 rounded-sm uppercase tracking-wider">
                  {discount}% OFF
                </span>
              )}
              {!inStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-md">
                  <span className="bg-black/70 text-white font-sans text-sm font-bold uppercase tracking-widest px-4 py-2 rounded-sm">
                    Sold Out
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
                {images.map((url, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded border-2 transition-all ${
                      selectedImage === i
                        ? "border-primary shadow-sm"
                        : "border-transparent opacity-60 hover:opacity-90"
                    }`}
                  >
                    <img src={url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* ── Details ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col"
          >
            {/* Brand label */}
            <span className="mb-2 inline-block font-sans text-[10px] font-medium uppercase tracking-[0.4em] text-primary">
              Divine Interior
            </span>

            {/* Title */}
            <h1 className="font-display text-3xl font-light tracking-wide sm:text-4xl">
              {product.title}
            </h1>

            {/* SKU */}
            {product.sku && (
              <p className="mt-1 font-sans text-xs text-muted-foreground">
                SKU: {product.sku}
              </p>
            )}

            {/* Price */}
            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-sans text-3xl font-bold text-primary">
                ₹{currentAmt.toLocaleString('en-IN')}
              </span>
              {compareAmt && compareAmt > currentAmt && (
                <span className="font-sans text-lg text-muted-foreground line-through">
                  ₹{compareAmt.toLocaleString('en-IN')}
                </span>
              )}
              {discount && (
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 font-sans text-xs font-semibold text-green-700">
                  Save {discount}%
                </span>
              )}
            </div>

            {/* MRP note */}
            {compareAmt && (
              <p className="mt-1 font-sans text-[11px] text-muted-foreground">
                MRP: ₹{compareAmt.toLocaleString('en-IN')} (incl. of all taxes)
              </p>
            )}

            <div className="my-6 h-px w-12 bg-primary/30" />

            {/* Description */}
            <p className="font-serif text-base font-light leading-relaxed text-muted-foreground">
              {product.description}
            </p>

            {/* Options */}
            {options.length > 0 && (
              <div className="mt-8 space-y-4">
                {options.map((opt: any) => (
                  <div key={opt.name}>
                    <p className="mb-2 font-sans text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
                      {opt.name}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(opt.values ?? []).map((val: string) => (
                        <span
                          key={val}
                          className="rounded-sm border border-border px-3 py-1.5 font-sans text-xs text-muted-foreground"
                        >
                          {val}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Stock indicator */}
            <div className="mt-6 flex items-center gap-2">
              <span
                className={`inline-block h-2 w-2 rounded-full ${
                  product.stock > 10
                    ? 'bg-green-500'
                    : product.stock > 0
                    ? 'bg-yellow-500'
                    : 'bg-red-500'
                }`}
              />
              <span className="font-sans text-xs text-muted-foreground">
                {product.stock > 10
                  ? 'In Stock'
                  : product.stock > 0
                  ? `Only ${product.stock} left`
                  : 'Out of Stock'}
              </span>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAddToCart}
              disabled={isLoading || !inStock}
              className="mt-8 w-full border border-primary bg-primary py-4 font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-sm"
            >
              {isLoading
                ? 'Adding…'
                : inStock
                ? 'Add to Cart'
                : 'Sold Out'}
            </button>

            {/* Trust badges */}
            <div className="mt-6 grid grid-cols-3 gap-3 border-t border-border pt-6">
              {[
                { icon: '🔒', label: 'Secure Checkout' },
                { icon: '🚚', label: 'Free Delivery ₹50k+' },
                { icon: '↩️', label: 'Easy Returns' },
              ].map(b => (
                <div key={b.label} className="flex flex-col items-center gap-1 text-center">
                  <span className="text-lg">{b.icon}</span>
                  <span className="font-sans text-[10px] text-muted-foreground">{b.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetail;
