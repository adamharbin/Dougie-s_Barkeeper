"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useAuth } from "@/lib/useAuth";
import { loadAll } from "@/lib/db";
import { isStalePrice, estimatedExpiration, daysUntil } from "@/lib/costing";
import LoginForm from "./LoginForm";
import Nav from "./Nav";
import Dashboard from "./Dashboard";
import InventoryTab from "./InventoryTab";
import RecipesTab from "./RecipesTab";
import VendorsTab from "./VendorsTab";
import { SectionHead, EmptyState } from "./ui";

function ComingSoon({ title, desc }) {
  return (
    <div>
      <SectionHead title={title} desc={desc} />
      <div className="bk-card">
        <EmptyState
          text="This module is next up on the leash."
          sub="Foundation (auth, nav, schema) is in for review — module build-out comes next."
        />
      </div>
    </div>
  );
}

const TAB_CONTENT = {
  settings: { title: "Settings", desc: "Labor rates and goal margins — these drive the color-coding everywhere else." },
};

export default function AppShell() {
  const { user, loading: authLoading, configured } = useAuth();
  const [tab, setTab] = useState("dashboard");

  const [data, setData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      try {
        const next = await loadAll();
        setData(next);
        setLoadError("");
      } catch (e) {
        console.error("loadAll failed:", e?.message || e, e);
        setLoadError("Couldn't load data — check your connection and try refreshing.");
      } finally {
        setDataLoading(false);
      }
    })();
  }, [user]);

  // Reload after a mutation (add/edit/delete), called from event handlers only —
  // never invoked directly inside an effect — so no loading-flash on every save.
  const refresh = useCallback(async () => {
    try {
      const next = await loadAll();
      setData(next);
      setLoadError("");
    } catch (e) {
      console.error("refresh failed:", e?.message || e, e);
      setLoadError("Couldn't reload data — check your connection and try again.");
    }
  }, []);

  const attention = useMemo(() => {
    if (!data) return { stale: [], expiring: [] };
    const stale = data.items.filter((i) => isStalePrice(i.id, data.prices));
    const expiring = data.items
      .map((i) => ({ item: i, exp: estimatedExpiration(i, data.prices) }))
      .filter((x) => x.exp && daysUntil(x.exp) <= 3 && daysUntil(x.exp) >= 0);
    return { stale, expiring };
  }, [data]);

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

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="bk-app">
      <Nav tab={tab} onTabChange={setTab} />
      <main className="bk-main">
        {loadError && (
          <div className="bk-save-error">
            {loadError} <button className="bk-user-signout" onClick={refresh}>Retry</button>
          </div>
        )}
        {dataLoading ? (
          <div className="bk-loading">Fetching the bowl of data…</div>
        ) : !data ? null : tab === "dashboard" ? (
          <Dashboard
            items={data.items}
            prices={data.prices}
            recipes={data.recipes}
            settings={data.settings}
            attention={attention}
            onGo={setTab}
          />
        ) : tab === "inventory" ? (
          <InventoryTab items={data.items} prices={data.prices} vendors={data.vendors} onSaved={refresh} />
        ) : tab === "recipes" ? (
          <RecipesTab recipes={data.recipes} items={data.items} prices={data.prices} settings={data.settings} onSaved={refresh} />
        ) : tab === "vendors" ? (
          <VendorsTab vendors={data.vendors} onSaved={refresh} />
        ) : (
          <ComingSoon title={TAB_CONTENT[tab].title} desc={TAB_CONTENT[tab].desc} />
        )}
      </main>
    </div>
  );
}
