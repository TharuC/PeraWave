import React, { useRef, useState, useEffect } from "react";
import backgroundImage from "../assets/Background_Image.jpg";
import "../styles/welcome.css";

const HeroSection: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = backgroundImage;
    img.onload = () => {
      setIsLoaded(true);
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    cardRef.current.style.setProperty("--mouse-x", `${x}px`);
    cardRef.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div className={`hero ${isLoaded ? "bg-loaded" : ""}`}>
      <div
        className={`glass-card ${isLoaded ? "animate-slide" : ""}`}
        ref={cardRef}
        onMouseMove={handleMouseMove}
        style={{ opacity: isLoaded ? 1 : 0 }}
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