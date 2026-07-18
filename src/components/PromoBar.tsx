import { Link } from "react-router-dom";

const PromoBar = () => {
  return (
    <div style={{ background: "#2d5a27" }} className="text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-2">
        <p className="font-sans text-[10px] font-medium uppercase tracking-[0.25em] text-white/80 sm:text-[11px]">
          🌿 Pan-India Delivery · Premium Ergonomic Chairs · Sustainable Choice
        </p>
        <Link
          to="/shop"
          className="hidden font-sans text-[10px] font-bold uppercase tracking-[0.25em] text-white/90 underline hover:text-white sm:block"
        >
          Shop Now →
        </Link>
      </div>
    </div>
  );
};

export default PromoBar;
