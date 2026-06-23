"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.scss";

const Login = () => {
  const { login, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const redirectUrl = searchParams.get("redirect") || "";

  useEffect(() => {
    // If already authenticated, redirect
    if (token) {
      router.push(redirectUrl ? `/${redirectUrl}` : "/");
    }
  }, [token, router, redirectUrl]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      router.push(redirectUrl ? `/${redirectUrl}` : "/");
    } catch (err) {
      console.error("Login page error:", err);
      setError(err.message || "Failed to log in. Please review your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-subtitle">Welcome Back</span>
        <h2 className="auth-title">Log In to Needle</h2>

        {error && <div className="auth-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              required
              disabled={loading}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? "Authenticating..." : "Log In"}
          </button>
        </form>

        <p className="auth-footer-text">
          New to our collections?{" "}
          <Link href={redirectUrl ? `/register?redirect=${redirectUrl}` : "/register"}>
            Create an Account
          </Link>
        </p>

        <div className="demo-accounts-hint">
          <p className="hint-title">Demo User Credentials:</p>
          <p><strong>Customer:</strong> user@needle.com / userpassword</p>
          <p><strong>Admin:</strong> admin@needle.com / adminpassword</p>
        </div>
      </div>
    </div>
  );
};

export default function LoginPage() {
  return (
    <React.Suspense fallback={
      <div className="auth-page">
        <div className="auth-card">
          <p>Loading credentials...</p>
        </div>
      </div>
    }>
      <Login />
    </React.Suspense>
  );
}

