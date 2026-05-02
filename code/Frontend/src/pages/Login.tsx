import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // University Email Validation
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.pdn\.ac\.lk$/;
        if (!emailRegex.test(email.trim())) {
            setError("Please enter a valid University Email Address.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8080/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || "Login failed. Please try again.");
                return;
            }

            if (data.token) {
                sessionStorage.setItem("token", data.token);
            }

            // Navigate to home, passing the user object
            navigate("/home", { state: { user: data.user } });

        } catch (err) {
            setError("Failed to connect to the server. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <button className="back-btn" onClick={() => navigate("/")}>
                &larr; Back to Welcome
            </button>

            <div className="login-card">
                <div className="login-header">
                    <h2>Welcome Back</h2>
                    <p>Please enter your details to sign in.</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                    <div className="input-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            placeholder="Enter your university email"
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
                            placeholder="Enter your password"
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

                    {error && (
                        <p style={{ color: "#ef4444", fontSize: "14px", margin: "-8px 0 0 0", padding: "8px 12px", background: "#fef2f2", borderRadius: "8px", border: "1px solid #fecaca" }}>
                            {error}
                        </p>
                    )}

                    <div className="form-options">
                        <label className="remember-me">
                            <input type="checkbox" /> Remember me
                        </label>
                        <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); navigate("/forgot-password"); }}>Forgot Password?</a>
                    </div>

                    <button type="submit" className="login-submit-btn" disabled={isLoading}>
                        {isLoading ? "Signing in..." : "Log In"}
                    </button>
                </form>

                <p className="signup-link">
                    Don't have an account? <span onClick={() => navigate("/register")}>Sign up</span>
                </p>
            </div>
        </div>
    );
};

export default Login;
