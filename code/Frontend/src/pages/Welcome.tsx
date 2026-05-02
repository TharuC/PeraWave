import React, { useEffect } from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";

const Welcome: React.FC = () => {
  useEffect(() => {
    // Disable scrolling on the welcome page
    document.body.style.overflow = 'hidden';
    
    // Cleanup: Re-enable scrolling when leaving the page
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <>
      <Navbar />
      <HeroSection />
      <Footer />
    </>
  );
};

export default Welcome;