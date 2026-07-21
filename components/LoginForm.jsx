"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";

export default function LoginForm() {
  const { signIn, sendPasswordReset } = useAuth();
  const [mode, setMode] = useState("signin"); // signin | forgot
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

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

  async function handleResetRequest(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await sendPasswordReset(email);
      setResetSent(true);
    } catch (err) {
      setError(err.message || "Couldn't send a reset email — check the address and try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function switchMode(next) {
    setMode(next);
    setError("");
    setResetSent(false);
  }

  if (mode === "forgot") {
    return (
      <div className="bk-auth-screen">
        <div className="bk-auth-card">
          <img src="/logo.png" alt="Dougie's Barkeeper" className="bk-auth-logo" />
          <h2>Reset password</h2>
          {resetSent ? (
            <>
              <p className="bk-disclaimer" style={{ marginTop: 0 }}>
                Check {email} for a link to set a new password.
              </p>
              <button className="bk-link" onClick={() => switchMode("signin")}>Back to sign in</button>
            </>
          ) : (
            <form onSubmit={handleResetRequest}>
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
              {error && <p className="bk-error-text">{error}</p>}
              <button className="bk-btn-primary" type="submit" disabled={submitting}>
                {submitting ? "Sending…" : "Send reset link"}
              </button>
              <button type="button" className="bk-link" style={{ marginTop: 12 }} onClick={() => switchMode("signin")}>
                Back to sign in
              </button>
            </form>
          )}
        </div>
      </div>
    );
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
          <button type="button" className="bk-link" style={{ marginTop: 12 }} onClick={() => switchMode("forgot")}>
            Forgot password?
          </button>
        </form>
      </div>
    </div>
  );
}
