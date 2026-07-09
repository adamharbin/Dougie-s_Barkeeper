"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";

export default function LoginForm() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message || "Couldn't sign in — check your email and password.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bk-auth-screen">
      <div className="bk-auth-card">
        <img src="/logo.png" alt="Dougie's Barkeeper" className="bk-auth-logo" />
        <h2>Sign in</h2>
        <form onSubmit={handleSubmit}>
          <label className="bk-field">
            <span>Email</span>
            <input
              className="bk-input"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="bk-field">
            <span>Password</span>
            <input
              className="bk-input"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {error && <p className="bk-error-text">{error}</p>}
          <button className="bk-btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
