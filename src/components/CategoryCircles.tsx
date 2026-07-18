import { motion } from "framer-motion";
import { Link } from "react-router-dom";

// Each category uses a REAL product image from /products/
// Green circle background exactly like the Toqri reference — no laptop
const categories = [
  {
    label: "Accessories",
    image: "/products/HMAeron4.png",
    href: "/shop",
  },
  {
    label: "Adjustable Desk",
    image: "/products/STEELCASE2.png",
    href: "/shop",
  },
  {
    label: "Cafeteria Chairs",
    image: "/products/Featherlite2.png",
    href: "/shop",
  },
  {
    label: "Chairs",
    image: "/products/HMmirra2-1.png",
    href: "/shop",
  },
  {
    label: "Storage",
    image: "/products/HMclassic2.png",
    href: "/shop",
  },
  {
    label: "Executive",
    image: "/products/OptimaHigh1.png",
    href: "/shop",
  },
  {
    label: "Table",
    image: "/products/HAWORTH1.png",
    href: "/shop",
  },
];

const CategoryCircles = () => {
  return (
    <section className="border-b border-border bg-white py-10 lg:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-12">

        {/* Header row */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="font-sans text-base font-bold tracking-tight text-foreground sm:text-lg">
            Shop by Category
          </h2>
          <Link
            to="/shop"
            className="font-sans text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
          >
            VIEW ALL →
          </Link>
        </div>

        {/* Category circles — identical layout to Toqri reference */}
        <div className="flex flex-wrap justify-center gap-6 sm:gap-10 lg:gap-14">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: i * 0.06 }}
            >
              <Link
                to={cat.href}
                className="group flex flex-col items-center gap-3"
              >
                {/* Green circle — matches Toqri style exactly */}
                <div
                  className="relative flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-full transition-all duration-300 group-hover:shadow-lg sm:h-[110px] sm:w-[110px]"
                  style={{ background: "#e8f5e9" }}
                >
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="h-[82px] w-[82px] object-contain transition-transform duration-500 group-hover:scale-110 sm:h-[90px] sm:w-[90px]"
                    style={{ mixBlendMode: "multiply" }}
                  />
                </div>

                {/* Label */}
                <span className="text-center font-sans text-[12px] font-medium text-gray-700 transition-colors group-hover:text-primary sm:text-[13px]">
                  {cat.label}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default CategoryCircles;
