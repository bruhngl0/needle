"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import "../../styles/auth.scss";

const Register = () => {
  const { register, token } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
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

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await register(formData.name, formData.email, formData.password);
      router.push(redirectUrl ? `/${redirectUrl}` : "/");
    } catch (err) {
      console.error("Register page error:", err);
      setError(err.message || "Failed to create an account. Email might already be taken.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <span className="auth-subtitle">Get Started</span>
        <h2 className="auth-title">Create an Account</h2>

        {error && <div className="auth-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Jane Doe"
              required
              disabled={loading}
              autoComplete="name"
            />
          </div>

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
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              required
              disabled={loading}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" disabled={loading} className="auth-submit-btn">
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-footer-text">
          Already have an account?{" "}
          <Link href={redirectUrl ? `/login?redirect=${redirectUrl}` : "/login"}>
            Log In here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default function RegisterPage() {
  return (
    <React.Suspense fallback={
      <div className="auth-page">
        <div className="auth-card">
          <p>Preparing registration...</p>
        </div>
      </div>
    }>
      <Register />
    </React.Suspense>
  );
}

