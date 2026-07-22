import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";

const slides = [
  {
    bg: "/banner/Banner-01.jpg.jpeg",
    tag: "DELIVERY ACROSS INDIA",
    title: "Premium Office Chairs\nBuilt for Productivity",
    sub: "Ergonomic office chairs designed for support, durability, and modern workspaces.",
    cta: "EXPLORE",
    ctaLink: "/shop",
    accent: "#C9A96E",
  },
  {
    bg: "/banner/Banner-02.jpg.jpeg",
    tag: "ERGONOMIC • EXECUTIVE • WORKSTATION",
    title: "Professional Seating\nFor Every Office",
    sub: "Discover premium office chairs that combine lasting support with modern design.",
    cta: "VIEW COLLECTION",
    ctaLink: "/shop",
    accent: "#C9A96E",
  },
  {
    bg: "/banner/Banner-03.jpg.jpeg",
    tag: "PREMIUM OFFICE CHAIRS",
    title: "Comfort That\nWorks All Day",
    sub: "Smart seating solutions crafted to support productivity and everyday efficiency.",
    cta: "SHOP NOW",
    ctaLink: "/shop",
    accent: "#C9A96E",
  },
];

const HeroSection = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const go = (idx: number) => {
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
  };
  const prev = () => go((current - 1 + slides.length) % slides.length);
  const next = () => go((current + 1) % slides.length);

  useEffect(() => {
    const t = setInterval(next, 5500);
    return () => clearInterval(t);
  }, [current]);

  return (
    <section className="relative w-full overflow-hidden" style={{ height: "clamp(420px, 56vw, 680px)" }}>
      {/* Slides */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={current}
          custom={direction}
          variants={{
            enter: (d: number) => ({ x: d > 0 ? "100%" : "-100%", opacity: 0 }),
            center: { x: 0, opacity: 1 },
            exit:  (d: number) => ({ x: d > 0 ? "-100%" : "100%", opacity: 0 }),
          }}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.65, ease: [0.32, 0, 0.18, 1] }}
          className="absolute inset-0"
        >
          {/* Background */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slides[current].bg})` }}
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />

          {/* Content */}
          <div className="relative z-10 flex h-full items-center px-8 sm:px-14 lg:px-20">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="max-w-xl"
            >
              {/* Tag */}
              <div className="mb-4 inline-flex items-center gap-2">
                <span
                  className="h-[2px] w-8 rounded-full"
                  style={{ background: slides[current].accent }}
                />
                <span className="font-sans text-[11px] font-semibold uppercase tracking-[0.3em] text-white/80">
                  {slides[current].tag}
                </span>
              </div>

              {/* Headline */}
              <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
                {slides[current].title.split("\n").map((line, i) => (
                  <span key={i}>
                    {i === 0 ? line : <><br /><span style={{ color: slides[current].accent }}>{line}</span></>}
                  </span>
                ))}
              </h1>

              {/* Sub */}
              <p className="mt-4 font-sans text-sm font-light text-white/70 sm:text-base">
                {slides[current].sub}
              </p>

              {/* CTA */}
              <Link
                to={slides[current].ctaLink}
                className="mt-8 inline-flex items-center gap-2 rounded-sm px-8 py-3.5 font-sans text-sm font-bold uppercase tracking-widest text-white transition-all"
                style={{ background: slides[current].accent }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                {slides[current].cta}
                <ChevronRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next arrows */}
      <button
        onClick={prev}
        className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/55"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/55"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot nav */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className="rounded-full transition-all duration-500"
            style={{
              width: current === i ? 28 : 8,
              height: 8,
              background: current === i ? "#C9A96E" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
