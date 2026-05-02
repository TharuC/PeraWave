import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

// All recognized faculty codes at University of Peradeniya
const VALID_FACULTY_CODES = [
    "sci", "eng", "agri", "ahs", "arts",
    "dental", "mgt", "med", "vet"
];

const RegisterEmail: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");

        // University Email Regex: registration_number@faculty.pdn.ac.lk
        const pdnEmailRegex = /^([a-zA-Z0-9]+)@([a-zA-Z]+)\.pdn\.ac\.lk$/;
        const match = email.match(pdnEmailRegex);

        if (!match) {
            setError("Please use a valid university email");
            return;
        }

        const faculty = match[2].toLowerCase();

        // Validate that the faculty code is a recognized UoP faculty
        if (!VALID_FACULTY_CODES.includes(faculty)) {
            setError(`"${faculty}" is not a recognized faculty code.`);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://localhost:8080/api/auth/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await res.json();
            if (res.ok) {
                setSuccessMsg("OTP sent! Please check your backend terminal for the code.");
                setStep(2);
            } else {
                setError(data.error || "Failed to send OTP");
            }
        } catch (err) {
            setError("Network error. Please make sure the backend is running.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccessMsg("");

        if (!otp || otp.length < 6) {
            setError("Please enter a valid 6-digit OTP");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("http://localhost:8080/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp })
            });

            const data = await res.json();
            if (res.ok) {
                // OTP verified, move to next page
                const match = email.match(/^([a-zA-Z0-9]+)@([a-zA-Z]+)\.pdn\.ac\.lk$/)!;
                const regNumber = match[1];
                const faculty = match[2].toLowerCase();

                navigate('/register/details', {
                    state: { regNumber, faculty, email }
                });
            } else {
                setError(data.error || "Invalid OTP");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">
            <button className="back-btn" onClick={() => navigate(step === 2 ? "#" : "/")} onMouseDown={() => step === 2 && setStep(1)}>
                &larr; Back
            </button>

            <div className="login-card">
                <div className="login-header">
                    <h2>Create an Account</h2>
                    <p>{step === 1 ? "Lets get started! Enter your email address." : "Verify your email address."}</p>
                </div>

                {successMsg && <p className="success-message fade-in" style={{ color: '#10b981', fontSize: '0.9rem', marginBottom: '1rem', background: '#d1fae5', padding: '10px', borderRadius: '8px' }}>{successMsg}</p>}

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="login-form">
                        <div className="input-group">
                            <label htmlFor="email">University Email</label>
                            <input
                                type="email"
                                id="email"
                                placeholder="UoP email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                            />
                        </div>

                        {error && <p className="error-message fade-in" style={{ color: '#ff6b6b', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}

                        <button type="submit" className="login-submit-btn" disabled={loading}>
                            {loading ? "Sending OTP..." : "Send OTP"}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="login-form">
                        <div className="input-group">
                            <label htmlFor="otp">One-Time Password (OTP)</label>
                            <input
                                type="text"
                                id="otp"
                                placeholder="Enter 6-digit OTP"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength={6}
                                disabled={loading}
                            />
                        </div>

                        {error && <p className="error-message fade-in" style={{ color: '#ff6b6b', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}

                        <button type="submit" className="login-submit-btn" disabled={loading}>
                            {loading ? "Verifying..." : "Verify OTP & Continue"}
                        </button>
                    </form>
                )}

                <p className="signup-link">
                    Already have an account? <span onClick={() => navigate("/login")}>Log in</span>
                </p>
            </div>
        </div>
    );
};

export default RegisterEmail;
