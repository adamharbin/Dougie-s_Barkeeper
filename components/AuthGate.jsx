"use client";

import { useAuth } from "@/lib/useAuth";
import LoginForm from "./LoginForm";
import ResetPasswordForm from "./ResetPasswordForm";

// Shared guard used by every route in the app: not-configured / still
// loading / password-recovery / signed-out all short-circuit before any
// page-specific content renders.
export default function AuthGate({ children }) {
  const { user, loading: authLoading, configured, recovery } = useAuth();

  if (!configured) {
    return (
      <div className="bk-auth-screen">
        <div className="bk-auth-card">
          <img src="/logo.png" alt="Dougie's Barkeeper" className="bk-auth-logo" />
          <h2>Connect Supabase</h2>
          <p className="bk-disclaimer" style={{ marginTop: 0 }}>
            Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then run supabase/schema.sql
            against your project to enable sign-in.
          </p>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return <div className="bk-loading">Fetching the bowl of data…</div>;
  }

  if (recovery) {
    return <ResetPasswordForm />;
  }

  if (!user) {
    return <LoginForm />;
  }

  return children;
}
