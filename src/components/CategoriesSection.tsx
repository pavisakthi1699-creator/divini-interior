import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import serviceInterior from "@/assets/service-interior.jpg";
import serviceFurniture from "@/assets/service-furniture.jpg";
import categoryKitchen from "@/assets/category-kitchen.jpg";
import categoryWardrobe from "@/assets/category-wardrobe.jpg";

const categories = [
  {
    image: serviceInterior,
    title: "Interior Design",
    description:
      "Comprehensive interior design services that transform your vision into breathtaking reality. Every space tells a story of refined taste and sophisticated living.",
  },
  {
    image: serviceFurniture,
    title: "Bespoke Furniture",
    description:
      "Handcrafted furniture pieces that embody the pinnacle of artisan excellence. Each creation is a masterpiece of form and function.",
  },
  {
    image: categoryKitchen,
    title: "Premium Kitchens",
    description:
      "Thoughtfully designed with a perfect balance of form and function, bringing together superior materials, sleek aesthetics, and innovative layouts.",
  },
  {
    image: categoryWardrobe,
    title: "Luxury Wardrobes",
    description:
      "A harmonious blend of form, utility, and fashion, tailored to cater to your storage needs without compromising on style.",
  },
];

const CategoriesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="services" className="bg-muted py-28 lg:py-36" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <span className="mb-4 inline-block font-sans text-[10px] font-medium uppercase tracking-[0.4em] text-primary">
            Our Expertise
          </span>
          <h2 className="font-display text-3xl font-light tracking-wide sm:text-4xl lg:text-5xl">
            Designs That Define <span className="italic">Every Corner</span>
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-serif text-lg font-light text-muted-foreground">
            Crafted collections of furniture, furnishings, and kitchens for the refined home.
          </p>
        </motion.div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className="group cursor-pointer"
            >
              <div className="relative mb-6 aspect-[4/5] overflow-hidden">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
              <h3 className="font-display text-lg font-light tracking-wide transition-colors group-hover:text-primary">
                {cat.title}
              </h3>
              <p className="mt-3 font-serif text-xs font-light leading-relaxed text-muted-foreground">
                {cat.description}
              </p>
              <a
                href="#"
                className="mt-4 inline-block font-sans text-[10px] font-medium uppercase tracking-[0.25em] text-primary transition-colors hover:text-foreground"
              >
                Explore Now →
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
