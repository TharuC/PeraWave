import { useNavigate } from "react-router-dom";
import logo from "../assets/PeraWaveLogo.png";
import "../styles/welcome.css";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="logo-container">
        <img src={logo} alt="PeraWave Logo" className="logo-img" />
        <div className="logo">PeraWave</div>
      </div>

      <div className="nav-buttons">
        <button
          className="create-btn"
          onClick={() => navigate("/register")}
        >
          Create an account
        </button>

        <button
          className="login-btn"
          onClick={() => navigate("/login")}
        >
          Log in
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
