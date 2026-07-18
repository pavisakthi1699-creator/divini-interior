import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AboutSection from "@/components/AboutSection";
import CraftsmanshipSection from "@/components/CraftsmanshipSection";
import DesignEthosSection from "@/components/DesignEthosSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import { motion } from "framer-motion";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="mb-4 inline-block font-sans text-[10px] font-medium uppercase tracking-[0.4em] text-primary">
            Our Story
          </span>
          <h1 className="font-display text-4xl font-light tracking-wide sm:text-5xl lg:text-6xl">
            About <span className="italic">Divine Interior</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-serif text-base font-light text-muted-foreground px-6">
            A legacy of craftsmanship, design, and devotion to the art of refined living.
          </p>
        </motion.div>
      </section>
      <AboutSection />
      <DesignEthosSection />
      <CraftsmanshipSection />
      <TestimonialsSection />
      <Footer />
    </div>
  );
};

export default About;
