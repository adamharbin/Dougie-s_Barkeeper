"use client";

import { AuthProvider } from "@/lib/useAuth";
import AppShell from "@/components/AppShell";

export default function Home() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
