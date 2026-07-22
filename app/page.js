import { Suspense } from "react";
import AuthGate from "@/components/AuthGate";
import AppShell from "@/components/AppShell";

export default function Home() {
  return (
    <AuthGate>
      <Suspense fallback={<div className="bk-loading">Fetching the bowl of data…</div>}>
        <AppShell />
      </Suspense>
    </AuthGate>
  );
}
