"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import LoginForm from "./LoginForm";
import Nav from "./Nav";

function ComingSoon({ title, desc }) {
  return (
    <div>
      <div className="bk-section-head">
        <div>
          <h2>{title}</h2>
          <p>{desc}</p>
        </div>
      </div>
      <div className="bk-card">
        <div className="bk-empty">
          <div className="bk-empty-text">This module is next up on the leash.</div>
          <div className="bk-empty-sub">Foundation (auth, nav, schema) is in for review — module build-out comes next.</div>
        </div>
      </div>
    </div>
  );
}

const TAB_CONTENT = {
  dashboard: { title: "Dashboard", desc: "Where the whole bar's numbers land, at a glance." },
  inventory: { title: "Inventory", desc: "Food, bar & shared items — priced from real purchase history." },
  recipes: { title: "Recipes", desc: "Costed off live inventory prices — food and bar, same math." },
  vendors: { title: "Vendors", desc: "Who supplies what, and when it's due." },
  settings: { title: "Settings", desc: "Labor rates and goal margins — these drive the color-coding everywhere else." },
};

export default function AppShell() {
  const { user, loading, configured } = useAuth();
  const [tab, setTab] = useState("dashboard");

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

  if (loading) {
    return <div className="bk-loading">Fetching the bowl of data…</div>;
  }

  if (!user) {
    return <LoginForm />;
  }

  const content = TAB_CONTENT[tab];

  return (
    <div className="bk-app">
      <Nav tab={tab} onTabChange={setTab} />
      <main className="bk-main">
        <ComingSoon title={content.title} desc={content.desc} />
      </main>
    </div>
  );
}
