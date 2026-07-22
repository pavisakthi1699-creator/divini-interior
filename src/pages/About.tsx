import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TestimonialsSection from "@/components/TestimonialsSection";
import { motion } from "framer-motion";
import { Heart, Shield, Award, CheckCircle2, Star, ShieldAlert, Laptop, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const philosophyItems = [
  {
    icon: Heart,
    title: "Ergonomic Excellence",
    desc: "Designed to support healthy posture, reduce fatigue, and enhance productivity throughout every workday.",
  },
  {
    icon: Shield,
    title: "Premium Craftsmanship",
    desc: "Built with high-quality materials and expert construction for dependable performance and long-term durability.",
  },
  {
    icon: Award,
    title: "Trusted Brands",
    desc: "Featuring office chairs from Herman Miller, Steelcase, Haworth, Featherlite, and other globally recognized brands.",
  },
];

const qualityCards = [
  {
    title: "Ergonomic",
    subtext: "DESIGNED FOR SUPPORT",
    icon: CheckCircle2,
  },
  {
    title: "Premium",
    subtext: "TRUSTED BRANDS",
    icon: Star,
  },
  {
    title: "Durable",
    subtext: "BUILT TO LAST",
    icon: Shield,
  },
  {
    title: "Modern",
    subtext: "WORKSPACE READY",
    icon: Laptop,
  },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* ── Header / Hero ── */}
      <section className="pt-36 pb-20 bg-[#FAFAF8] border-b border-border">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <span className="inline-block font-sans text-[10px] font-semibold uppercase tracking-[0.4em] text-primary">
              OUR STORY
            </span>
            <h1 className="font-display text-4xl font-light tracking-wide sm:text-5xl lg:text-6xl text-foreground">
              About <span className="italic">Divine Interior</span>
            </h1>
            <div className="mx-auto h-[1px] w-12 bg-border my-6" />
            <p className="mx-auto max-w-2xl font-serif text-lg font-light leading-relaxed text-muted-foreground">
              Delivering premium office seating solutions designed to inspire productivity, comfort, and modern workspaces.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Section 1: Our Philosophy ── */}
      <section className="py-20 lg:py-28 bg-white border-b border-border">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-start">
            
            {/* Left Philosophy Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <span className="inline-block font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                OUR PHILOSOPHY
              </span>
              <h2 className="font-display text-3xl font-light tracking-wide sm:text-4xl lg:text-5xl text-foreground">
                Creating Exceptional <span className="italic">Workspaces</span>
              </h2>
              <p className="font-serif text-base font-light leading-relaxed text-muted-foreground max-w-lg">
                We deliver ergonomic office chairs that combine thoughtful design, premium quality, and lasting reliability.
              </p>
              <div className="pt-4">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-widest text-primary hover:text-primary/80 transition-colors"
                >
                  LEARN MORE <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.div>

            {/* Right Philosophy Cards list */}
            <div className="space-y-8">
              {philosophyItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.15 }}
                    className="flex gap-5 border-l border-primary/20 pl-6 py-1 hover:border-primary transition-colors duration-300"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-sans text-sm font-semibold text-foreground">{item.title}</h4>
                      <p className="font-sans text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* ── Section 2: Commitment to Quality ── */}
      <section className="py-20 lg:py-28 bg-[#12100d] text-white overflow-hidden relative">
        {/* Glow blob */}
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-10" style={{ background: "radial-gradient(circle, hsl(47 85% 43%) 0%, transparent 70%)" }} />

        <div className="mx-auto max-w-7xl px-6 lg:px-12 relative">
          <div className="grid gap-16 lg:grid-cols-2 lg:gap-24 items-center">
            
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <span className="inline-block font-sans text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                A COMMITMENT TO QUALITY
              </span>
              <h2 className="font-display text-3xl font-light tracking-wide sm:text-4xl lg:text-5xl">
                Delivering Premium<br />
                <span className="italic" style={{ color: "hsl(47 85% 48%)" }}>Office Seating</span>
              </h2>
              <p className="font-sans text-sm font-light leading-relaxed text-white/60 max-w-lg">
                Every chair at Divine Interior is selected with quality, durability, and ergonomic excellence in mind. We bring together trusted global brands and reliable craftsmanship to provide office seating solutions that enhance productivity, support everyday work, and complement modern professional spaces.
              </p>
            </motion.div>

            {/* Right 2x2 Grid of Cards */}
            <div className="grid grid-cols-2 gap-4">
              {qualityCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    className="p-5 border rounded-xl space-y-4 hover:border-primary/45 transition-colors duration-300"
                    style={{
                      background: "rgba(255, 255, 255, 0.02)",
                      borderColor: "rgba(202, 156, 18, 0.12)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-sans text-sm font-bold text-white leading-none">{card.title}</h4>
                      <p className="font-sans text-[9px] uppercase tracking-[0.2em] text-primary/80 mt-1.5 leading-none">
                        {card.subtext}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <TestimonialsSection />

      <Footer />
    </div>
  );
};

export default About;
