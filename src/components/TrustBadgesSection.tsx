import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Leaf, IndianRupee, Truck, ShieldCheck } from "lucide-react";

const badges = [
  {
    icon: Leaf,
    color: "#4CAF50",
    bg: "rgba(76,175,80,0.10)",
    title: "Sustainable Choice",
    sub: "Give products a second life, reduce environmental impact",
  },
  {
    icon: IndianRupee,
    color: "#C9A96E",
    bg: "rgba(201,169,110,0.10)",
    title: "Affordable Prices",
    sub: "High-quality ergonomic chairs at honest prices",
  },
  {
    icon: Truck,
    color: "#2196F3",
    bg: "rgba(33,150,243,0.10)",
    title: "Pan-India Delivery",
    sub: "Reliable delivery to your doorstep across India",
  },
  {
    icon: ShieldCheck,
    color: "#9C27B0",
    bg: "rgba(156,39,176,0.10)",
    title: "Trusted Quality",
    sub: "Thoroughly checked, cleaned, and ready to use",
  },
];

const TrustBadgesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <section className="border-b border-border bg-white py-12" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          {badges.map((b, i) => {
            const Icon = b.icon;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col items-center gap-3 rounded-xl border border-border bg-background p-5 text-center shadow-sm"
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-full"
                  style={{ background: b.bg }}
                >
                  <Icon className="h-6 w-6" style={{ color: b.color }} />
                </div>
                <div>
                  <p className="font-sans text-sm font-bold text-foreground">{b.title}</p>
                  <p className="mt-1 font-sans text-[11px] leading-snug text-muted-foreground">{b.sub}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TrustBadgesSection;
