"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import AuthGate from "@/components/AuthGate";
import RecipeDetailPage from "@/components/RecipeDetailPage";
import { loadAll } from "@/lib/db";

function RecipeRoute() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
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
  }, []);

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

  if (dataLoading) {
    return <div className="bk-loading">Fetching the bowl of data…</div>;
  }

  if (loadError && !data) {
    return (
      <div className="bk-save-error">
        {loadError} <button className="bk-user-signout" onClick={refresh}>Retry</button>
      </div>
    );
  }

  return (
    <RecipeDetailPage
      recipeId={id}
      recipes={data.recipes}
      items={data.items}
      prices={data.prices}
      settings={data.settings}
      onSaved={refresh}
    />
  );
}

export default function Page() {
  return (
    <AuthGate>
      <RecipeRoute />
    </AuthGate>
  );
}
