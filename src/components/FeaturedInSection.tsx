import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const pressLogos = [
  "Architectural Digest",
  "Elle Decor",
  "Better Interiors",
  "Dezeen",
  "Living Etc",
  "Vogue Living",
];

const FeaturedInSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section className="py-20" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <span className="mb-10 inline-block font-sans text-[10px] font-medium uppercase tracking-[0.4em] text-muted-foreground">
            Featured In
          </span>

          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-8">
            {pressLogos.map((logo, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="font-display text-lg font-light tracking-[0.1em] text-muted-foreground/50 transition-colors hover:text-foreground sm:text-xl"
              >
                {logo}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturedInSection;
