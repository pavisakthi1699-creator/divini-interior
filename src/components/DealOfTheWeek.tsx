import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, ShoppingCart } from "lucide-react";
import { productsApi, type Product } from "@/lib/api";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";

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
            compareAtPrice: p.compare_at_price ? { amount: String(p.compare_at_price), currencyCode: p.currency } : null,
            availableForSale: p.stock > 0,
            selectedOptions: [{ name: 'Size', value: 'Standard' }],
          },
        }],
      },
      options: (p.options as any[]) || [],
    },
  };
}

const DealOfTheWeek = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const addItem   = useCartStore(s => s.addItem);
  const isLoading = useCartStore(s => s.isLoading);

  useEffect(() => {
    productsApi.list({ active: '1', per_page: '5' })
      .then(res => setProducts(res.items.slice(0, 5)))
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
    <section className="bg-background py-16 lg:py-24 border-t border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="mb-10 flex items-center justify-between border-b border-border pb-5">
          <h2 className="font-sans text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Featured Products
          </h2>
          <Link to="/shop" className="font-sans text-xs font-bold uppercase tracking-wider text-foreground hover:text-primary transition-colors flex items-center gap-1">
            View All <span className="text-sm">→</span>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center font-serif text-muted-foreground">New products coming soon.</div>
        ) : (
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
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
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="flex"
                >
                  <Link
                    to={`/product/${p.slug}`}
                    className="group flex flex-col w-full bg-white border border-gray-100 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative aspect-square w-full overflow-hidden bg-[#F8F9FA]">
                      {image ? (
                        <img src={image} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}
                      {discount && (
                        <span className="absolute left-2 top-2 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider">
                          {discount}% OFF
                        </span>
                      )}
                    </div>

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
        )}
      </div>
    </section>
  );
};

export default DealOfTheWeek;
