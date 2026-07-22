import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

const brandLogos = [
  { name: "Steelcase", logo: "/brands/SteelCase-1.webp" },
  { name: "Featherlite", logo: "/brands/Featherlite-new.webp" },
  { name: "Haworth", logo: "/brands/Haworth-1.webp" },
  { name: "Humanscale", logo: "/brands/Humanscale-1.webp" },
  { name: "Vitra", logo: "/brands/vitra.png" },
  { name: "HNI", logo: "/brands/HNI_logo.svg.webp" },
  { name: "Orangebox", logo: "/brands/images.png" },
];

const BrandsSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -240, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 240, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    let intervalId: NodeJS.Timeout;

    const startAutoScroll = () => {
      intervalId = setInterval(() => {
        if (!container) return;
        const maxScroll = container.scrollWidth - container.clientWidth;
        if (container.scrollLeft >= maxScroll - 5) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: 240, behavior: "smooth" });
        }
      }, 3000);
    };

    startAutoScroll();

    const handleMouseEnter = () => clearInterval(intervalId);
    const handleMouseLeave = () => startAutoScroll();

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      clearInterval(intervalId);
      if (container) {
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <section className="bg-[#FAFAF8] py-12 lg:py-16 border-b border-border">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between border-b border-border pb-4">
          <div>
            <p className="font-sans text-[10px] uppercase tracking-[0.3em] text-primary font-medium mb-1">
              Trusted Brands
            </p>
            <h2 className="font-sans text-lg font-bold tracking-tight text-foreground md:text-xl">
              Shop By Top Brands
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={scrollLeft}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-muted-foreground hover:text-foreground transition-colors shadow-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={scrollRight}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-white text-muted-foreground hover:text-foreground transition-colors shadow-sm"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Brand logo carousel */}
        <div
          ref={scrollRef}
          className="no-scrollbar mb-10 flex gap-6 overflow-x-auto scroll-smooth py-2 px-1"
        >
          {brandLogos.map((brand, idx) => (
            <Link
              key={`${brand.name}-${idx}`}
              to="/shop"
              className="flex h-20 w-44 flex-shrink-0 items-center justify-center rounded-lg border border-border/85 bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/40 hover:-translate-y-0.5 duration-300"
            >
              <img
                src={brand.logo}
                alt={brand.name}
                className="h-full w-full object-contain"
              />
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
