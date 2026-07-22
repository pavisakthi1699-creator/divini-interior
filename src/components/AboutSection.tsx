import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Heart, DollarSign, Truck, Award } from "lucide-react";
import { Link } from "react-router-dom";

const pillars = [
  {
    icon: Heart,
    color: "hsl(47 85% 50%)",
    bg: "rgba(202, 156, 18, 0.15)",
    title: "Ergonomic Design",
    desc: "Experience superior lumbar support and all-day ease for healthier, more productive work.",
  },
  {
    icon: DollarSign,
    color: "hsl(47 85% 50%)",
    bg: "rgba(202, 156, 18, 0.15)",
    title: "Competitive Pricing",
    desc: "Premium-quality office chairs that deliver exceptional value without compromising on quality.",
  },
  {
    icon: Truck,
    color: "hsl(47 85% 50%)",
    bg: "rgba(202, 156, 18, 0.15)",
    title: "Pan-India Delivery",
    desc: "Reliable and timely delivery to businesses and offices across India.",
  },
  {
    icon: Award,
    color: "hsl(47 85% 50%)",
    bg: "rgba(202, 156, 18, 0.15)",
    title: "Built to Last",
    desc: "Durable materials and quality craftsmanship designed to perform every working day.",
  },
];

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-16 lg:py-24"
      style={{
        background: "linear-gradient(135deg, #13100c 0%, #1c1711 50%, #241e17 100%)",
      }}
    >
      {/* Decorative gold-glow radial blobs */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, hsl(47 85% 43%) 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, hsl(47 85% 43%) 0%, transparent 70%)" }} />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="mb-3 inline-block font-sans text-[10px] uppercase tracking-[0.35em] text-primary font-bold">
              Why Choose Divine
            </span>
            <h2 className="font-display text-3xl font-light leading-snug text-white sm:text-4xl lg:text-5xl">
              Every Workspace<br />
              <span className="italic" style={{ color: "hsl(47 85% 48%)" }}>Deserves Comfort</span>
            </h2>
            <p className="mt-6 font-sans text-sm font-light leading-relaxed text-white/70 sm:text-base max-w-lg">
              The right office chair does more than provide a place to sit, it improves focus, supports posture, and enhances productivity. At Divine Interiors, we offer premium commercial office chairs that combine ergonomic design, lasting durability, and exceptional value for every modern workspace.
            </p>
            <p className="mt-4 font-sans text-sm font-light leading-relaxed text-white/60 max-w-lg">
              Whether you're furnishing a startup, corporate office, or coworking space, we deliver seating solutions built for everyday use.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-2 rounded-sm px-7 py-3.5 font-sans text-xs font-bold uppercase tracking-widest text-primary-foreground transition-all hover:brightness-110"
              style={{ background: "hsl(47 85% 43%)" }}
            >
              SHOP NOW →
            </Link>
          </motion.div>

          {/* Right — 4 benefit cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="rounded-xl p-5 border transition-all duration-300 hover:border-primary/30"
                  style={{
                    background: "rgba(255,255,255,0.025)",
                    backdropFilter: "blur(12px)",
                    borderColor: "rgba(202, 156, 18, 0.12)",
                  }}
                >
                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ background: p.bg }}
                  >
                    <Icon className="h-5 w-5" style={{ color: p.color }} />
                  </div>
                  <p className="font-sans text-sm font-bold text-white leading-snug">{p.title}</p>
                  <p className="mt-1.5 font-sans text-[11px] leading-relaxed text-white/50">{p.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-14 grid grid-cols-2 gap-6 border-t border-white/10 pt-10 sm:grid-cols-4"
        >
          {[
            { n: "500+", l: "Happy Clients" },
            { n: "10+", l: "Premium Brands" },
            { n: "Pan-India", l: "Delivery" },
            { n: "100%", l: "Quality Checked" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="font-display text-3xl font-light text-white" style={{ color: i % 2 === 0 ? "hsl(47 85% 48%)" : "#fff" }}>
                {s.n}
              </p>
              <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.25em] text-white/40">{s.l}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
