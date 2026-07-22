"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { loadAll } from "@/lib/db";
import { isStalePrice, estimatedExpiration, daysUntil } from "@/lib/costing";
import Nav from "./Nav";
import Dashboard from "./Dashboard";
import InventoryTab from "./InventoryTab";
import RecipesTab from "./RecipesTab";
import VendorsTab from "./VendorsTab";
import SettingsTab from "./SettingsTab";

const TAB_IDS = ["dashboard", "inventory", "recipes", "vendors", "settings"];

export default function AppShell() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialTab = TAB_IDS.includes(searchParams.get("tab")) ? searchParams.get("tab") : "dashboard";
  const [tab, setTab] = useState(initialTab);

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
          <SettingsTab settings={data.settings} onSaved={refresh} />
        )}
      </main>
    </div>
  );
}
