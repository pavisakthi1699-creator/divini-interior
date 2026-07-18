import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Leaf, IndianRupee, Truck, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";

const pillars = [
  {
    icon: Leaf,
    color: "#4CAF50",
    bg: "rgba(76,175,80,0.12)",
    title: "Sustainable Choice",
    desc: "Give products a second life, reduce environmental impact",
  },
  {
    icon: IndianRupee,
    color: "#C9A96E",
    bg: "rgba(201,169,110,0.12)",
    title: "Affordable Prices",
    desc: "High-quality refurbished furniture at low prices",
  },
  {
    icon: Truck,
    color: "#2196F3",
    bg: "rgba(33,150,243,0.12)",
    title: "Pan-India Delivery",
    desc: "Reliable delivery to your doorstep across India",
  },
  {
    icon: ShieldCheck,
    color: "#9C27B0",
    bg: "rgba(156,39,176,0.12)",
    title: "Trusted Quality",
    desc: "Thoroughly checked, cleaned, and ready to use",
  },
];

const AboutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-16 lg:py-20"
      style={{
        background: "linear-gradient(135deg, #2d5a27 0%, #3d7a35 50%, #4a8f40 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />
      <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, #fff 0%, transparent 70%)" }} />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">

          {/* Left — text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="mb-3 inline-block font-sans text-[10px] uppercase tracking-[0.35em] text-white/60 font-medium">
              🌍 Why It Matters
            </span>
            <h2 className="font-display text-3xl font-light leading-snug text-white sm:text-4xl lg:text-5xl">
              Every Purchase<br />
              <span className="italic" style={{ color: "#C9A96E" }}>Helps the Planet</span>
            </h2>
            <p className="mt-6 font-sans text-sm font-light leading-relaxed text-white/70 sm:text-base max-w-lg">
              Small choices lead to big change. Choosing quality ergonomic furniture means less waste, fewer resources consumed, and a lighter carbon footprint. Each piece you buy supports smarter, more sustainable workspaces — giving great chairs a longer life and the planet a brighter future.
            </p>
            <p className="mt-4 font-sans text-sm font-light leading-relaxed text-white/60 max-w-lg">
              It's not just smart. It's sustainable.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-2 rounded-sm px-7 py-3 font-sans text-xs font-bold uppercase tracking-widest text-white transition-all hover:opacity-90"
              style={{ background: "#C9A96E" }}
            >
              Shop Now →
            </Link>
          </motion.div>

          {/* Right — 4 benefit cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {pillars.map((p, i) => {
              const Icon = p.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1 }}
                  className="rounded-xl p-5"
                  style={{ background: "rgba(255,255,255,0.10)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)" }}
                >
                  <div
                    className="mb-3 flex h-10 w-10 items-center justify-center rounded-full"
                    style={{ background: p.bg }}
                  >
                    <Icon className="h-5 w-5" style={{ color: p.color }} />
                  </div>
                  <p className="font-sans text-sm font-bold text-white leading-snug">{p.title}</p>
                  <p className="mt-1 font-sans text-[11px] leading-snug text-white/60">{p.desc}</p>
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
          className="mt-14 grid grid-cols-2 gap-6 border-t border-white/15 pt-10 sm:grid-cols-4"
        >
          {[
            { n: "500+", l: "Happy Clients" },
            { n: "10+", l: "Premium Brands" },
            { n: "Pan-India", l: "Delivery" },
            { n: "100%", l: "Quality Checked" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="font-display text-3xl font-light text-white" style={{ color: i % 2 === 0 ? "#C9A96E" : "#fff" }}>
                {s.n}
              </p>
              <p className="mt-1 font-sans text-[10px] uppercase tracking-[0.25em] text-white/50">{s.l}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AboutSection;
