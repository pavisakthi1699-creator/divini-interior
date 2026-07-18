import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import craftsmanshipImg from "@/assets/ethos-craft.jpg";

const CraftsmanshipSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="craftsmanship" className="relative py-28 lg:py-36" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="overflow-hidden">
              <img
                src={craftsmanshipImg}
                alt="Master craftsmanship"
                className="w-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full border border-border" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <span className="mb-6 inline-block font-sans text-[10px] font-medium uppercase tracking-[0.4em] text-primary">
              A Legacy of Excellence
            </span>
            <h2 className="font-display text-3xl font-light leading-snug tracking-wide sm:text-4xl lg:text-5xl">
              Crafting <span className="italic">Luxury</span> Since Generations
            </h2>
            <div className="my-8 h-[1px] w-16 bg-border" />
            <p className="font-serif text-lg font-light leading-relaxed text-muted-foreground">
              Every piece from Divine Interior is a testament to generations of craftsmanship.
              Our master artisans pour their expertise into creating furniture and furnishings
              that transcend trends — pieces that become part of your family's legacy.
            </p>

            <div className="mt-12 grid grid-cols-2 gap-8">
              {[
                { label: "Handcrafted", desc: "Artisan Excellence" },
                { label: "Bespoke", desc: "Made to Order" },
                { label: "Premium", desc: "Finest Materials" },
                { label: "Timeless", desc: "Enduring Design" },
              ].map((item, i) => (
                <div key={i} className="border-l border-primary/30 pl-4">
                  <span className="font-display text-sm font-medium tracking-wide">
                    {item.label}
                  </span>
                  <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default CraftsmanshipSection;
