import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const brands = [
  {
    name: "Herman Miller",
    tagline: "World's #1 Ergonomic Chair",
    image: "/products/HermanMiller1.png",
    bg: "#F0EDE8",
    href: "/shop",
  },
  {
    name: "Featherlite",
    tagline: "India's Leading Office Furniture",
    image: "/products/Featherlite1.png",
    bg: "#EDF0F5",
    href: "/shop",
  },
  {
    name: "Steelcase",
    tagline: "Engineered for Performance",
    image: "/products/STEELCASE1.png",
    bg: "#F5F0ED",
    href: "/shop",
  },
  {
    name: "Haworth",
    tagline: "Endorsed by Physical Therapists",
    image: "/products/HAWORTH1.png",
    bg: "#EDF5ED",
    href: "/shop",
  },
  {
    name: "Herman Miller",
    tagline: "Aeron Remastered Series",
    image: "/products/HMAeron1.png",
    bg: "#F0EDE8",
    href: "/shop",
  },
  {
    name: "Herman Miller",
    tagline: "Classic Aeron — Size B",
    image: "/products/HMclassic1.png",
    bg: "#F5F0F5",
    href: "/shop",
  },
];

const BrandsSection = () => {
  return (
    <section className="bg-[#FAFAF8] py-12 lg:py-16 border-b border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-primary font-medium mb-1">
              Trusted Brands
            </p>
            <h2 className="font-sans text-base font-bold tracking-tight text-foreground sm:text-lg">
              Shop By Top Brands
            </h2>
          </div>
          <Link
            to="/shop"
            className="font-sans text-xs font-bold uppercase tracking-wider text-primary hover:underline"
          >
            View All →
          </Link>
        </div>

        {/* Brand logo strip */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 rounded-xl border border-border bg-white px-6 py-5">
          {["Herman Miller", "Featherlite", "Steelcase", "Haworth"].map((b) => (
            <Link
              key={b}
              to="/shop"
              className="font-display text-lg font-semibold tracking-wide text-foreground/50 transition-all hover:text-primary sm:text-xl"
            >
              {b}
            </Link>
          ))}
        </div>

        {/* Brand product cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {brands.map((brand, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.06 }}
            >
              <Link
                to={brand.href}
                className="group flex flex-col overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all hover:shadow-md hover:border-primary/30"
              >
                {/* Image */}
                <div
                  className="relative aspect-square w-full overflow-hidden"
                  style={{ background: brand.bg }}
                >
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="h-full w-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                {/* Info */}
                <div className="border-t border-border px-3 py-2.5">
                  <p className="font-sans text-[11px] font-bold text-foreground leading-none">
                    {brand.name}
                  </p>
                  <p className="mt-0.5 font-sans text-[10px] text-muted-foreground leading-tight">
                    {brand.tagline}
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandsSection;
