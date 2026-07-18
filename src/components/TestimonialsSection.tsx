import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Rajesh Mehta",
    city: "Mumbai",
    rating: 5,
    text: "Got a Herman Miller Aeron at a fraction of the price. The chair was spotless and exactly as described. My back pain has completely gone after using it for two weeks!",
    avatar: "RM",
    product: "Herman Miller Aeron Remastered",
  },
  {
    name: "Priya Sharma",
    city: "Bengaluru",
    rating: 5,
    text: "The Steelcase Leap V2 I ordered arrived well-packed and in perfect condition. Incredible build quality. Best purchase I've made for my home office setup.",
    avatar: "PS",
    product: "Steelcase Leap V2",
  },
  {
    name: "Anand Kapoor",
    city: "Delhi",
    rating: 5,
    text: "Excellent service and fast delivery across India. The Mirra 2 chair is exactly what I needed. Highly recommend Divine Interior for premium ergonomic chairs.",
    avatar: "AK",
    product: "Herman Miller Mirra 2",
  },
  {
    name: "Sunita Reddy",
    city: "Hyderabad",
    rating: 5,
    text: "Haworth Zody at an unbeatable price. Delivery was on time and the team was very professional. Would definitely order again!",
    avatar: "SR",
    product: "Haworth Zody",
  },
];

const TestimonialsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [active, setActive] = useState(0);

  const prev = () => setActive((active - 1 + testimonials.length) % testimonials.length);
  const next = () => setActive((active + 1) % testimonials.length);

  return (
    <section className="bg-[#FAFAF8] py-14 lg:py-18 border-t border-border" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="mb-10 flex items-center justify-between border-b border-border pb-5"
        >
          <div>
            <p className="mb-1 font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-primary">
              Customer Stories
            </p>
            <h2 className="font-sans text-xl font-bold tracking-tight text-foreground md:text-2xl">
              Customer Reviews
            </h2>
          </div>
          <div className="flex gap-2">
            <button onClick={prev}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-all hover:border-primary hover:text-primary">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button onClick={next}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-muted-foreground transition-all hover:border-primary hover:text-primary">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </motion.div>

        {/* Cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.55, delay: i * 0.1 }}
              className={`rounded-xl border p-5 transition-all ${
                active === i
                  ? "border-primary bg-primary/5 shadow-md"
                  : "border-border bg-white hover:border-primary/30 hover:shadow-sm"
              }`}
              onClick={() => setActive(i)}
              style={{ cursor: "pointer" }}
            >
              {/* Stars */}
              <div className="mb-3 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="font-sans text-xs leading-relaxed text-muted-foreground line-clamp-4">
                "{t.text}"
              </p>

              {/* Product */}
              <p className="mt-3 font-sans text-[10px] font-semibold uppercase tracking-wide text-primary/70">
                {t.product}
              </p>

              {/* Author */}
              <div className="mt-4 flex items-center gap-2.5 border-t border-border pt-3">
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full font-sans text-xs font-bold text-white"
                  style={{ background: "linear-gradient(135deg, #C9A96E, #8B6914)" }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="font-sans text-xs font-semibold text-foreground">{t.name}</p>
                  <p className="font-sans text-[10px] text-muted-foreground">{t.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
