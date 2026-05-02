import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/login.css"; // Reuse existing styles

const facultyMap: Record<string, string> = {
  sci: "Faculty of Science",
  eng: "Faculty of Engineering",
  agri: "Faculty of Agriculture",
  ahs: "Faculty of Allied Health Sciences",
  arts: "Faculty of Arts",
  dental: "Faculty of Dental Sciences",
  mgt: "Faculty of Management",
  med: "Faculty of Medicine",
  vet: "Faculty of Veterinary Medicine"
};

const formatRegNumber = (rawReg: string) => {
  const match = rawReg.match(/^([a-zA-Z]+)(\d{2})(\d{3})$/);
  if (match) {
    return `${match[1].toUpperCase()}/${match[2]}/${match[3]}`;
  }
  return rawReg.toUpperCase(); // Fallback if format is different
};

const RegisterDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [computedReg, setComputedReg] = useState("");
  const [computedFaculty, setComputedFaculty] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // If no state is passed, redirect back to email step
    if (!location.state || !location.state.email) {
      navigate("/register");
      return;
    }

    const { email, regNumber, faculty } = location.state;
    setEmail(email);
    setComputedReg(formatRegNumber(regNumber));
    const resolvedFaculty = facultyMap[faculty.toLowerCase()];
    if (!resolvedFaculty) {
      // Unknown faculty — send user back to email step
      navigate('/register');
      return;
    }
    setComputedFaculty(resolvedFaculty);
  }, [location, navigate]);

  const validatePassword = (pass: string) => {
    const minLength = pass.length >= 8;
    const hasUpper = /[A-Z]/.test(pass);
    const hasLower = /[a-z]/.test(pass);
    const hasNumber = /[0-9]/.test(pass);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    return minLength && hasUpper && hasLower && hasNumber && hasSpecial;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 8 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    // Send to backend
    try {
      const response = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          fullName: `${firstName} ${lastName}`,
          faculty: computedFaculty,
          registrationNumber: computedReg,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Backend returned error:", data);
        const errorMsg = data.error || data.message || `Server error ${response.status}: ${JSON.stringify(data)}`;
        setPasswordError(errorMsg);
        return;
      }

      // Success! Navigate to login or dashboard
      console.log("Registration successful!", data);
      navigate("/login", { state: { message: "Account created successfully! Please log in." } });

    } catch (err: any) {
      console.error("Failed to connect or parse response:", err);
      setPasswordError(`Network error: ${err.message}. Please check if the backend is running.`);
    }
  };

  return (
    <div className="login-page">
      <button className="back-btn" onClick={() => navigate("/register")}>
        &larr; Back
      </button>

      <div className="login-card" style={{ width: "450px", padding: "40px 50px", gap: "20px" }}>
        <div className="login-header">
          <h2>Create your account</h2>
          <p>Let's complete your profile for {email}</p>
        </div>

        <div className="user-derived-info" style={{ marginTop: "-5px", marginBottom: "5px", padding: "10px 15px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "10px", border: "1px solid rgba(0,0,0,0.05)" }}>
          <p style={{ margin: "2px 0", fontSize: "0.85rem", color: "#475569" }}><strong>Registration No:</strong> {computedReg}</p>
          <p style={{ margin: "2px 0", fontSize: "0.85rem", color: "#475569" }}><strong>Faculty:</strong> {computedFaculty}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div style={{ display: "flex", gap: "10px", marginBottom: "5px" }}>
            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
              <label htmlFor="firstName">First Name <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                id="firstName"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
              <label htmlFor="lastName">Last Name <span style={{ color: "red" }}>*</span></label>
              <input
                type="text"
                id="lastName"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Create Password <span style={{ color: "red" }}>*</span></label>
            <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: "100%", boxSizing: "border-box", paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, color: "#64748b" }}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="confirmPassword">Confirm Password <span style={{ color: "red" }}>*</span></label>
            <div style={{ position: "relative", display: "flex", alignItems: "center", width: "100%" }}>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ width: "100%", boxSizing: "border-box", paddingRight: "40px" }}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: "absolute", right: "12px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, color: "#64748b" }}
              >
                {showConfirmPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: '20px', height: '20px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {passwordError && (
            <p className="error-message fade-in" style={{ color: "#ff6b6b", fontSize: "0.85rem", marginBottom: "1rem", lineHeight: "1.4" }}>
              {passwordError}
            </p>
          )}

          <button type="submit" className="login-submit-btn">
            Create Account
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterDetails;
