import React from "react";
import "../styles/welcome.css";

const Footer: React.FC = () => {
    return (
        <footer className="footer-glass">
            <div className="footer-content">
                <p>&copy; {new Date().getFullYear()} ProWave. All rights reserved.</p>
                <p>Contact: <a href="mailto:support@perawave.com">support@perawave.com</a></p>
            </div>
        </footer>
    );
};

export default Footer;
