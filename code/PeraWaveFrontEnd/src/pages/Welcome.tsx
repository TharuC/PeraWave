import React from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";
import FeaturesSection from "../components/FeaturesSection";

const Welcome: React.FC = () => {

  return (
    <div className="welcome-page-container">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
};

export default Welcome;