import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Tag, ShoppingCart } from "lucide-react";
import { productsApi, type Product } from "@/lib/api";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Convert MySQL product → cart shape
function toCartProduct(p: Product) {
  return {
    node: {
      id: String(p.id),
      title: p.title,
      description: p.description,
      handle: p.slug,
      priceRange: { minVariantPrice: { amount: String(p.price), currencyCode: p.currency } },
      images: { edges: p.images.map(url => ({ node: { url, altText: p.title } })) },
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

const Sale = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const addItem   = useCartStore(s => s.addItem);
  const isLoading = useCartStore(s => s.isLoading);

  useEffect(() => {
    // Fetch all active products — those with compare_at_price > price show as "sale"
    productsApi.list({ active: '1', per_page: '50' })
      .then(res => {
        // Show only products that have a discount (compare_at_price set)
        const onSale = res.items.filter(
          p => p.compare_at_price && Number(p.compare_at_price) > Number(p.price)
        );
        setProducts(onSale.length > 0 ? onSale : res.items);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = async (p: Product, e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (p.stock === 0) return;
    const cartProduct = toCartProduct(p);
    const variant = cartProduct.node.variants.edges[0].node;
    await addItem({
      product: cartProduct as any,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions,
    });
    toast.success("Added to cart", { description: p.title });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="mb-4 inline-block font-sans text-[10px] font-medium uppercase tracking-[0.4em] text-primary">
            Limited Time
          </span>
          <h1 className="font-display text-4xl font-light tracking-wide sm:text-5xl lg:text-6xl">
            Discounted <span className="italic">Pieces</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg px-6 font-serif text-base font-light text-muted-foreground">
            Premium ergonomic chairs at exclusive prices — quality you can trust.
          </p>
        </motion.div>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-6 pb-28 lg:px-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Tag className="mb-6 h-16 w-16 text-muted-foreground/40" />
            <h3 className="mb-2 font-display text-2xl font-light tracking-wide">No Sale Items Right Now</h3>
            <p className="max-w-md font-serif text-muted-foreground">
              Check back soon for special offers and discounted products.
            </p>
            <Link to="/shop" className="mt-6 inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.2em] text-primary hover:underline">
              Browse All Products →
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-6 font-sans text-sm text-muted-foreground">{products.length} items on sale</p>
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((p, i) => {
                const image      = p.images[0];
                const currentAmt = Number(p.price);
                const compareAmt = p.compare_at_price ? Number(p.compare_at_price) : null;
                const discount   = compareAmt && compareAmt > currentAmt
                  ? Math.round(((compareAmt - currentAmt) / compareAmt) * 100) : null;
                const inStock    = p.stock > 0;

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.04 }}
                    className="flex"
                  >
                    <Link
                      to={`/product/${p.slug}`}
                      className="group flex flex-col w-full bg-white border border-gray-100 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="relative aspect-square w-full overflow-hidden bg-[#F8F9FA]">
                        {image ? (
                          <img
                            src={image}
                            alt={p.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
                          </div>
                        )}
                        {discount ? (
                          <span className="absolute left-3 top-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider z-10">
                            {discount}% OFF
                          </span>
                        ) : (
                          <span className="absolute left-3 top-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider z-10">
                            Sale
                          </span>
                        )}
                        {!inStock && (
                          <span className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="bg-black/70 text-white font-sans text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-sm">Sold Out</span>
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="p-3 flex flex-col flex-grow justify-between">
                        <div>
                          <h3 className="line-clamp-2 font-sans text-xs font-semibold text-gray-800 leading-snug group-hover:text-primary transition-colors mb-1.5 min-h-[32px]">
                            {p.title}
                          </h3>
                          <div className="flex items-baseline gap-1.5 mb-3">
                            <span className="font-sans text-sm font-bold text-primary">
                              ₹{currentAmt.toLocaleString("en-IN")}
                            </span>
                            {compareAmt && compareAmt > currentAmt && (
                              <span className="font-sans text-[11px] text-gray-400 line-through">
                                ₹{compareAmt.toLocaleString("en-IN")}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={e => handleAddToCart(p, e)}
                          disabled={isLoading || !inStock}
                          className={`w-full py-2 rounded-sm font-sans text-[10px] font-bold uppercase tracking-wider text-center transition-colors ${
                            inStock
                              ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                              : "bg-gray-200 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          {isLoading ? "Adding…" : inStock ? "Add to Cart" : "Sold Out"}
                        </button>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          </>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Sale;
