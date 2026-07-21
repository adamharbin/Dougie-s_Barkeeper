"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";

export default function ResetPasswordForm() {
  const { updatePassword } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }
    setSubmitting(true);
    try {
      await updatePassword(password);
    } catch (err) {
      setError(err.message || "Couldn't update your password — try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="bk-auth-screen">
      <div className="bk-auth-card">
        <img src="/logo.png" alt="Dougie's Barkeeper" className="bk-auth-logo" />
        <h2>Set a new password</h2>
        <form onSubmit={handleSubmit}>
          <label className="bk-field">
            <span>New password</span>
            <input
              className="bk-input"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          <label className="bk-field">
            <span>Confirm password</span>
            <input
              className="bk-input"
              type="password"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
          </label>
          {error && <p className="bk-error-text">{error}</p>}
          <button className="bk-btn-primary" type="submit" disabled={submitting}>
            {submitting ? "Saving…" : "Save new password"}
          </button>
        </form>
      </div>
    </div>
  );
}
