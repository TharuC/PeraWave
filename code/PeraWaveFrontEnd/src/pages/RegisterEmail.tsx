import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

const RegisterEmail: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [error, setError] = useState("");

    const handleContinue = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // University Email Regex: registration_number@faculty.pdn.ac.lk
        const pdnEmailRegex = /^([a-zA-Z0-9]+)@([a-zA-Z]+)\.pdn\.ac\.lk$/;
        const match = email.match(pdnEmailRegex);

        if (match) {
            const regNumber = match[1];
            const faculty = match[2];

            // Navigate to step 2 with state
            navigate('/register/details', {
                state: { regNumber, faculty, email }
            });
        } else {
            setError("Please use a valid university email");
        }
    };

    return (
        <div className="login-page">
            <button className="back-btn" onClick={() => navigate("/")}>
                &larr; Back
            </button>

            <div className="login-card">
                <div className="login-header">
                    <h2>Create an Account</h2>
                    <p>Lets get started! Enter your email address.</p>
                </div>

                <form onSubmit={handleContinue} className="login-form">
                    <div className="input-group">
                        <label htmlFor="email">University Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="UoP email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {error && <p className="error-message fade-in" style={{ color: '#ff6b6b', fontSize: '0.9rem', marginBottom: '1rem' }}>{error}</p>}

                    <button type="submit" className="login-submit-btn">
                        Continue &rarr;
                    </button>
                </form>

                <p className="signup-link">
                    Already have an account? <span onClick={() => navigate("/login")}>Log in</span>
                </p>
            </div>
        </div>
    );
};

export default RegisterEmail;
