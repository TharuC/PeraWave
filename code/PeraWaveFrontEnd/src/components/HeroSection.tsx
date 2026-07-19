import React, { useRef, useState, useEffect } from "react";
import backgroundImage from "../assets/Background_Image.jpg";
import "../styles/welcome.css";

const FEATURES = [
  {
    title: "Targeted Feeds",
    text: "Filter discussions to see what matters most. Engage with University-wide topics, Faculty-specific news, or Batch-only groups effortlessly.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.315 48.315 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    )
  },
  {
    title: "Anonymity Control",
    text: "Discuss sensitive or personal academic issues with confidence. Choose to post or comment completely anonymously when needed.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
      </svg>
    )
  },
  {
    title: "Save & Upvote",
    text: "Bookmark important notices or resources for later. Upvote helpful community posts to bring the best threads to the top.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
      </svg>
    )
  },
  {
    title: "Safe Community",
    text: "Experience a clean, protected environment. Real-time reporting and active moderation keep spam and harassment out of the community.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    )
  }
];

const HeroSection: React.FC = () => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);

  useEffect(() => {
    const img = new Image();
    img.src = backgroundImage;
    img.onload = () => {
      setIsLoaded(true);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % FEATURES.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ref.current.style.setProperty("--mouse-x", `${x}px`);
    ref.current.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div className={`hero ${isLoaded ? "bg-loaded" : ""}`}>
      <div className="hero-content">
        <div
          className={`glass-card ${isLoaded ? "animate-slide" : ""}`}
          ref={cardRef}
          onMouseMove={(e) => handleMouseMove(e, cardRef)}
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

      <div className="hero-features">
        <div
          className={`solid-card feature-solid-card ${isLoaded ? "animate-slide" : ""}`}
          style={{ opacity: isLoaded ? 1 : 0 }}
        >
          <div className="feature-intro">
            <h3>Why PeraWave?</h3>
            <p>Built exclusively for the University of Peradeniya community to connect, share knowledge, and grow securely.</p>
          </div>

          <div className="features-container">
            {FEATURES.map((feature, index) => (
              <div 
                key={index} 
                className={`dynamic-feature ${index === activeFeature ? "active" : ""}`}
              >
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-card-title">{feature.title}</h3>
                <p className="feature-card-text">{feature.text}</p>
              </div>
            ))}
          </div>
          
          <div className="feature-indicators">
            {FEATURES.map((_, index) => (
              <span 
                key={index} 
                className={`indicator ${index === activeFeature ? "active" : ""}`}
                onClick={() => setActiveFeature(index)}
              />
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default HeroSection;