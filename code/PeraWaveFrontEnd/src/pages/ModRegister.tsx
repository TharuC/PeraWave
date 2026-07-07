import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import { API_URL } from "../config";

const ModRegister: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [adminCode, setAdminCode] = useState("");
    const [otp, setOtp] = useState("");
    
    const [successMsg, setSuccessMsg] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [otpLocked, setOtpLocked] = useState(false);

    // Password Standard Flags
    const hasLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const isPasswordValid = hasLength && hasUpper && hasLower && hasNumber && hasSpecial;

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");

        if (!isPasswordValid) {
            setError("Please ensure your password meets all the required standards.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (!adminCode) {
            setError("Admin authorization code is required.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/mod-register-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();
            if (response.ok) {
                setSuccessMsg(`OTP sent to ${email}. Please check your inbox.`);
                setOtp("");
                setOtpLocked(false);
                setStep(2);
            } else {
                setError(data.error || "Failed to send OTP.");
            }
        } catch (err) {
            setError("Failed to connect to the server.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = async () => {
        setError("");
        setSuccessMsg("");
        setOtp("");
        setOtpLocked(false);
        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/mod-register-otp`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccessMsg(`New OTP sent to ${email}. Please check your inbox.`);
            } else {
                setError(data.error || "Failed to resend OTP.");
            }
        } catch {
            setError("Failed to connect to the server.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!isPasswordValid) {
            setError("Please ensure your password meets all the required standards.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_URL}/api/auth/mod-register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password, adminCode, otp }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.locked) {
                    setOtpLocked(true);
                }
                setError(data.error || "Registration failed. Please try again.");
                return;
            }

            // Redirect to mod login after successful registration
            navigate("/mods");

        } catch (err) {
            setError("Failed to connect to the server. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page mod-login-page" style={{ height: "100vh", overflowY: "auto", padding: "40px 0", display: "flex", alignItems: "flex-start", justifyContent: "center" }}>
            <button className="back-btn" onClick={() => navigate(step === 2 ? "#" : "/mods")} onMouseDown={() => step === 2 && setStep(1)} style={{ top: "20px" }}>
                &larr; Back{step === 1 ? " to Login" : ""}
            </button>

            <div className="login-card" style={{ borderTop: "4px solid #ef4444", width: "450px", marginTop: "20px" }}>
                <div className="login-header">
                    <h2>{step === 1 ? "Create Admin Account" : "Verify Email"}</h2>
                    <p>{step === 1 ? "Register as a new platform moderator." : "Enter the OTP to complete registration."}</p>
                </div>
                
                {successMsg && <p className="success-message fade-in" style={{ color: '#10b981', fontSize: '0.9rem', marginBottom: '1rem', background: '#d1fae5', padding: '10px', borderRadius: '8px' }}>{successMsg}</p>}

                {step === 1 ? (
                <form onSubmit={handleSendOTP} className="login-form">
                    <div className="input-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            type="text"
                            id="name"
                            placeholder="Enter your full name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="email">Admin Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your admin email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="input-group" style={{ position: "relative" }}>
                        <label htmlFor="password">Password</label>
                        <input
                            type={showPassword ? "text" : "password"}
                            id="password"
                            placeholder="Create a strong password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ paddingRight: "44px" }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{ position: "absolute", right: "12px", bottom: "10px", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    {/* Password Standards Checklist */}
                    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "-10px", display: "flex", flexDirection: "column", gap: "6px", background: "#f8fafc", padding: "12px", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                        <div style={{ fontWeight: 600, marginBottom: "4px", color: "#475569" }}>Password Standards:</div>
                        <div style={{ color: hasLength ? "#16a34a" : "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                            {hasLength ? "✅" : "○"} At least 8 characters
                        </div>
                        <div style={{ color: hasUpper ? "#16a34a" : "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                            {hasUpper ? "✅" : "○"} One uppercase letter
                        </div>
                        <div style={{ color: hasLower ? "#16a34a" : "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                            {hasLower ? "✅" : "○"} One lowercase letter
                        </div>
                        <div style={{ color: hasNumber ? "#16a34a" : "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                            {hasNumber ? "✅" : "○"} One number
                        </div>
                        <div style={{ color: hasSpecial ? "#16a34a" : "#64748b", display: "flex", alignItems: "center", gap: "6px" }}>
                            {hasSpecial ? "✅" : "○"} One special character (!@#$%^&*)
                        </div>
                    </div>

                    <div className="input-group" style={{ position: "relative" }}>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            id="confirmPassword"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{ paddingRight: "44px" }}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            style={{ position: "absolute", right: "12px", bottom: "10px", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", padding: 0 }}
                        >
                            {showConfirmPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{ width: "20px", height: "20px" }}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            )}
                        </button>
                    </div>

                    <div className="input-group">
                        <label htmlFor="adminCode">Admin Authorization Code</label>
                        <input
                            type="password"
                            id="adminCode"
                            placeholder="Secret code required to register"
                            value={adminCode}
                            onChange={(e) => setAdminCode(e.target.value)}
                            required
                        />
                        <small style={{ color: "#64748b", fontSize: "12px", marginTop: "4px" }}>
                            Contact Prowave Team for this code.
                        </small>
                    </div>

                    {error && (
                        <p style={{ color: "#ef4444", fontSize: "14px", margin: "0", padding: "8px 12px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca" }}>
                            {error}
                        </p>
                    )}

                    <button type="submit" className="login-submit-btn" disabled={isLoading || !isPasswordValid || password !== confirmPassword} style={{ background: "linear-gradient(90deg, #ef4444, #f87171)", color: "#fff", opacity: (!isPasswordValid || isLoading || password !== confirmPassword) ? 0.7 : 1, cursor: (!isPasswordValid || isLoading || password !== confirmPassword) ? "not-allowed" : "pointer" }}>
                        {isLoading ? "Sending OTP..." : "Send Verification Code"}
                    </button>
                </form>
                ) : (
                <form onSubmit={handleRegister} className="login-form">
                    <div className="input-group">
                        <label htmlFor="otp">Verification Code (OTP)</label>
                        <input
                            type="text"
                            id="otp"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            maxLength={6}
                        />
                    </div>
                    {error && (
                        <p style={{ color: "#ef4444", fontSize: "14px", margin: "0", padding: "8px 12px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca" }}>
                            {error}
                        </p>
                    )}
                    {otpLocked ? (
                        <button
                            type="button"
                            className="login-submit-btn"
                            onClick={handleResendOTP}
                            disabled={isLoading}
                            style={{ background: 'linear-gradient(45deg, #f59e0b, #d97706)', color: '#fff' }}
                        >
                            {isLoading ? "Resending..." : "Resend OTP"}
                        </button>
                    ) : (
                        <button type="submit" className="login-submit-btn" disabled={isLoading || !otp} style={{ background: "linear-gradient(90deg, #ef4444, #f87171)", color: "#fff", opacity: (isLoading || !otp) ? 0.7 : 1, cursor: (isLoading || !otp) ? "not-allowed" : "pointer" }}>
                            {isLoading ? "Creating Account..." : "Verify & Register"}
                        </button>
                    )}
                </form>
                )}
            </div>
        </div>
    );
};

export default ModRegister;
