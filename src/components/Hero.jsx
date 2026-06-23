import Link from "next/link";
import "../styles/hero.scss";

const Hero = () => {
  return (
    <div className="hero-main">
      <div className="hero-content">
        <span className="hero-sub">PRE-AUTUMN COLLECTION 2026</span>
        <h1 className="hero-title">Threaded with Elegance</h1>
        <p className="hero-description">
          Experience clean lines, structural shapes, and curated crimson tailoring designed for the modern wardrobe.
        </p>
        <Link href="/shop" className="hero-cta-btn">
          Explore The Shop
        </Link>
      </div>
    </div>
  );
};

export default Hero;
