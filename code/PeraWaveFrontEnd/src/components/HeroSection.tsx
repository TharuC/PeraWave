import React, { useRef } from "react";
import "../styles/welcome.css";

const HeroSection: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div className="hero">
      <div
        className="glass-card"
        ref={cardRef}
        onMouseMove={handleMouseMove}
      >
        <h1>
          Welcome to <br /> PeraWave
        </h1>

        <p className="tagline">
          Connect. Share. Grow together.
        </p>
      </div>

    </div>
  );
};

export default HeroSection;