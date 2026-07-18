import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import ethosDesign from "@/assets/ethos-design.jpg";
import ethosCraft from "@/assets/ethos-craft.jpg";
import ethosQuality from "@/assets/ethos-quality.jpg";

const pillars = [
  {
    image: ethosDesign,
    title: "Our Design Ethos",
    description:
      "Timeless aesthetics and thoughtful functionality come together to craft designs that inspire and elevate the spaces they inhabit.",
  },
  {
    image: ethosCraft,
    title: "Crafting with Care",
    description:
      "From premium materials to artisanal techniques, every detail is thoughtfully crafted for enduring beauty and quality.",
  },
  {
    image: ethosQuality,
    title: "Quality You Can Trust",
    description:
      "Superior craftsmanship, ergonomic design, and practical functionality that enriches everyday living.",
  },
];

const DesignEthosSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="py-28 lg:py-36" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <span className="mb-4 inline-block font-sans text-[10px] font-medium uppercase tracking-[0.4em] text-primary">
            Our Philosophy
          </span>
          <h2 className="font-display text-3xl font-light tracking-wide sm:text-4xl lg:text-5xl">
            Crafting <span className="italic">Timeless</span> Living
          </h2>
          <p className="mx-auto mt-6 max-w-2xl font-serif text-lg font-light text-muted-foreground">
            Explore our philosophy, materials, and commitment to quality that define every Divine Interior creation.
          </p>
        </motion.div>

        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {pillars.map((pillar, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 50 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.15 }}
              className="group text-center"
            >
              <div className="mx-auto mb-8 h-64 w-64 overflow-hidden rounded-full">
                <img
                  src={pillar.image}
                  alt={pillar.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              </div>
              <h3 className="font-display text-xl font-light tracking-wide">
                {pillar.title}
              </h3>
              <p className="mt-4 font-serif text-sm font-light leading-relaxed text-muted-foreground">
                {pillar.description}
              </p>
              <a
                href="#"
                className="mt-4 inline-block font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-primary transition-colors hover:text-foreground"
              >
                Learn More →
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DesignEthosSection;
