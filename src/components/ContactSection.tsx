import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const ContactSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="relative bg-muted py-28 lg:py-36" ref={ref}>
      <div className="mx-auto max-w-7xl px-6 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-24">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <span className="mb-4 inline-block font-sans text-[10px] font-medium uppercase tracking-[0.4em] text-primary">
              Get in Touch
            </span>
            <h2 className="font-display text-3xl font-light tracking-wide sm:text-4xl lg:text-5xl">
              Begin Your <span className="italic">Journey</span>
            </h2>
            <div className="my-8 h-[1px] w-16 bg-border" />
            <p className="font-serif text-lg font-light leading-relaxed text-muted-foreground">
              Let us craft a living experience that reflects your unique style and legacy.
              Our design consultants are ready to bring your vision to life.
            </p>

            <div className="mt-12 space-y-6">
              {[
                { label: "Visit Us", value: "Exclusive Showroom, India" },
                { label: "Call Us", value: "+91 (0) 000 000 0000" },
                { label: "Email", value: "hello@divineinterior.in" },
              ].map((item, i) => (
                <div key={i} className="border-l border-primary/30 pl-4">
                  <span className="font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
                    {item.label}
                  </span>
                  <p className="mt-1 font-serif text-base font-light">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <form className="space-y-8">
              {[
                { label: "Full Name", type: "text", placeholder: "Your name" },
                { label: "Phone", type: "tel", placeholder: "+91" },
                { label: "Email", type: "email", placeholder: "your@email.com" },
                { label: "City", type: "text", placeholder: "City & area of project" },
              ].map((field, i) => (
                <div key={i}>
                  <label className="mb-2 block font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    placeholder={field.placeholder}
                    className="w-full border-b border-border bg-transparent pb-3 font-serif text-base font-light placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none transition-colors duration-300"
                  />
                </div>
              ))}

              <div>
                <label className="mb-2 block font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
                  Service
                </label>
                <select className="w-full border-b border-border bg-transparent pb-3 font-serif text-base font-light focus:border-primary focus:outline-none transition-colors duration-300">
                  <option value="">Select your service</option>
                  <option value="interior">Interior Design Solutions</option>
                  <option value="furniture">Bespoke Luxury Furniture</option>
                  <option value="decor">Exclusive Home Décor</option>
                  <option value="kitchen">Premium Kitchens</option>
                  <option value="wardrobe">Luxury Wardrobes</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-sans text-[10px] font-medium uppercase tracking-[0.3em] text-muted-foreground">
                  Message
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your vision"
                  className="w-full resize-none border-b border-border bg-transparent pb-3 font-serif text-base font-light placeholder:text-muted-foreground/40 focus:border-primary focus:outline-none transition-colors duration-300"
                />
              </div>

              <button
                type="submit"
                className="group relative mt-4 overflow-hidden border border-primary bg-primary px-12 py-4 font-sans text-xs font-medium uppercase tracking-[0.3em] text-primary-foreground transition-all duration-500 hover:bg-foreground hover:border-foreground"
              >
                Send Enquiry
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
