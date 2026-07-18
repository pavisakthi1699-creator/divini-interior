import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactSection from "@/components/ContactSection";
import { motion } from "framer-motion";

const Contact = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <section className="pt-32 pb-16 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="mb-4 inline-block font-sans text-[10px] font-medium uppercase tracking-[0.4em] text-primary">
            Connect With Us
          </span>
          <h1 className="font-display text-4xl font-light tracking-wide sm:text-5xl lg:text-6xl">
            Contact <span className="italic">Us</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-serif text-base font-light text-muted-foreground px-6">
            We'd love to hear about your project. Reach out and our design consultants will respond shortly.
          </p>
        </motion.div>
      </section>
      <ContactSection />
      <Footer />
    </div>
  );
};

export default Contact;
