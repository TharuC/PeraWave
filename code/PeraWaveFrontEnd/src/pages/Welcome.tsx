import React from "react";
import Navbar from "../components/Navbar";
import HeroSection from "../components/HeroSection";
import Footer from "../components/Footer";

const Welcome: React.FC = () => {

  return (
    <div className="welcome-page-container">
      <Navbar />
      <HeroSection />
      <Footer />
    </div>
  );
};

export default Welcome;