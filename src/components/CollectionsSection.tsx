import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import collectionTimeless from "@/assets/collection-timeless.jpg";
import collectionModern from "@/assets/collection-modern.jpg";
import collectionHeritage from "@/assets/collection-heritage.jpg";

const collections = [
  {
    image: collectionTimeless,
    tag: "Timelessly Yours",
    title: "Timeless Collection",
    description:
      "The historic art of furniture craftsmanship through the ages, reimagined for the contemporary home. Explore artisanal furniture designs that are truly unbound by time.",
  },
  {
    image: collectionModern,
    tag: "Contemporary Forms",
    title: "Modern Collection",
    description:
      "The outcome of a journey through the rediscovery of form — undirected experimentation that yields serendipity and sculptural beauty.",
  },
  {
    image: collectionHeritage,
    tag: "An Ode to Design",
    title: "Heritage Collection",
    description:
      "With roots set in centuries of Indian craftsmanship, this exclusive collection takes inspiration from geometric styles and cultural artistry.",
  },
];

const CollectionsSection = () => {
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
            Exclusive Collections
          </span>
          <h2 className="font-display text-3xl font-light tracking-wide sm:text-4xl lg:text-5xl">
            Curated <span className="italic">Excellence</span>
          </h2>
        </motion.div>

        <div className="space-y-24">
          {collections.map((col, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 60 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: i * 0.2 }}
              className={`grid items-center gap-12 lg:grid-cols-2 lg:gap-20 ${
                i % 2 === 1 ? "lg:direction-rtl" : ""
              }`}
            >
              <div className={`${i % 2 === 1 ? "lg:order-2" : ""}`}>
                <div className="overflow-hidden">
                  <img
                    src={col.image}
                    alt={col.title}
                    className="w-full object-cover transition-transform duration-[1.2s] hover:scale-105"
                  />
                </div>
              </div>
              <div className={`${i % 2 === 1 ? "lg:order-1" : ""}`}>
                <span className="mb-2 inline-block font-serif text-sm italic text-muted-foreground">
                  {col.tag}
                </span>
                <h3 className="font-display text-2xl font-light tracking-wide sm:text-3xl lg:text-4xl">
                  {col.title}
                </h3>
                <div className="my-6 h-[1px] w-12 bg-primary/30" />
                <p className="font-serif text-base font-light leading-relaxed text-muted-foreground">
                  {col.description}
                </p>
                <a
                  href="#"
                  className="group mt-8 inline-flex items-center gap-2 font-sans text-[11px] font-medium uppercase tracking-[0.3em] text-primary transition-colors hover:text-foreground"
                >
                  Explore the Collection
                  <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CollectionsSection;
