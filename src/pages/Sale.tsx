import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Tag, ShoppingCart } from "lucide-react";
import { storefrontApiRequest, STOREFRONT_PRODUCTS_QUERY, type ShopifyProduct } from "@/lib/shopify";
import { useCartStore } from "@/stores/cartStore";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const Sale = () => {
  const [products, setProducts] = useState<ShopifyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((s) => s.addItem);
  const isLoading = useCartStore((s) => s.isLoading);

  useEffect(() => {
    async function fetchSale() {
      try {
        // Try tag:sale first; fall back to all products if none tagged
        let data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 50, query: "tag:sale OR tag:discount" });
        let edges = data?.data?.products?.edges ?? [];
        if (edges.length === 0) {
          data = await storefrontApiRequest(STOREFRONT_PRODUCTS_QUERY, { first: 50 });
          edges = data?.data?.products?.edges ?? [];
        }
        setProducts(edges);
      } catch (e) {
        console.error("Failed to fetch sale products:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchSale();
  }, []);

  const handleAddToCart = async (product: ShopifyProduct, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = product.node.variants.edges[0]?.node;
    if (!variant) return;
    await addItem({
      product,
      variantId: variant.id,
      variantTitle: variant.title,
      price: variant.price,
      quantity: 1,
      selectedOptions: variant.selectedOptions || [],
    });
    toast.success("Added to cart", { description: product.node.title });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="mb-4 inline-block font-sans text-[10px] font-medium uppercase tracking-[0.4em] text-primary">
            Limited Time
          </span>
          <h1 className="font-display text-4xl font-light tracking-wide sm:text-5xl lg:text-6xl">
            Discounted <span className="italic">Pieces</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg px-6 font-serif text-base font-light text-muted-foreground">
            Curated rarities at exclusive prices — a quiet indulgence for the discerning collector.
          </p>
        </motion.div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-28 lg:px-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Tag className="mb-6 h-16 w-16 text-muted-foreground/40" />
            <h3 className="mb-2 font-display text-2xl font-light tracking-wide">No Discounted Pieces Yet</h3>
            <p className="max-w-md font-serif text-muted-foreground">
              Tag products with <span className="font-mono">sale</span> in Shopify to feature them here.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product, i) => {
              const image = product.node.images.edges[0]?.node;
              const price = product.node.priceRange.minVariantPrice;
              const variant = product.node.variants.edges[0]?.node;
              const compareAt = variant?.compareAtPrice;
              const isAvailable = variant?.availableForSale !== false;

              // Calculate discount percentage
              const currentAmt = parseFloat(price.amount);
              const compareAmt = compareAt ? parseFloat(compareAt.amount) : null;
              const discountPercent = compareAmt && compareAmt > currentAmt
                ? Math.round(((compareAmt - currentAmt) / compareAmt) * 100)
                : null;

              return (
                <motion.div
                  key={product.node.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="flex"
                >
                  <Link
                    to={`/product/${product.node.handle}`}
                    className="group flex flex-col w-full bg-white dark:bg-zinc-950 border border-gray-100 dark:border-zinc-800 rounded-md overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-square w-full overflow-hidden bg-[#F8F9FA] dark:bg-zinc-900 border-b border-gray-50 dark:border-zinc-900">
                      {image ? (
                        <img
                          src={image.url}
                          alt={image.altText || product.node.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingCart className="h-10 w-10 text-muted-foreground/30" />
                        </div>
                      )}

                      {/* Discount Badge */}
                      {discountPercent ? (
                        <span className="absolute left-3 top-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider z-10">
                          {discountPercent}% OFF
                        </span>
                      ) : (
                        <span className="absolute left-3 top-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider z-10">
                          Sale
                        </span>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="p-4 flex flex-col flex-grow justify-between">
                      <div>
                        {/* Title */}
                        <h3 className="line-clamp-2 font-sans text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug tracking-normal group-hover:text-primary transition-colors mb-2 min-h-[40px]">
                          {product.node.title}
                        </h3>

                        {/* Price */}
                        <div className="flex items-baseline gap-2 mb-3">
                          <span className="font-sans text-base font-bold text-primary">
                            ₹{currentAmt.toLocaleString("en-IN")}
                          </span>
                          {compareAmt && compareAmt > currentAmt && (
                            <span className="font-sans text-xs text-gray-400 dark:text-gray-500 line-through">
                              ₹{compareAmt.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>

                        {/* Description */}
                        <p className="font-serif text-xs text-muted-foreground line-clamp-2 mb-4 leading-relaxed">
                          {product.node.description}
                        </p>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={(e) => {
                          if (isAvailable) {
                            handleAddToCart(product, e);
                          } else {
                            e.preventDefault();
                            e.stopPropagation();
                          }
                        }}
                        disabled={isLoading || !isAvailable}
                        className={`w-full py-2.5 rounded-sm font-sans text-xs font-bold uppercase tracking-wider text-center transition-colors ${
                          isAvailable
                            ? "bg-primary hover:bg-primary/90 text-primary-foreground"
                            : "bg-destructive text-destructive-foreground opacity-90 cursor-not-allowed"
                        }`}
                      >
                        {isLoading && isAvailable ? "Adding..." : isAvailable ? "Add to Cart" : "Sold Out"}
                      </button>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Sale;
