"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { loadInvoices, deleteInvoice, getInvoiceSignedUrl } from "@/lib/db";
import { fmtMoney, fmtDate } from "@/lib/costing";
import { SectionHead, EmptyState } from "./ui";
import InvoiceModal from "./InvoiceModal";
import InvoiceMonthlyChart from "./InvoiceMonthlyChart";

const SORT_DEFAULT_DIR = { vendor: "asc", file: "asc", notes: "asc", date: "desc", total: "desc" };

export default function InvoicesTab({ vendors }) {
  const { isAdmin } = useAuth();
  const [invoices, setInvoices] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [openingId, setOpeningId] = useState(null);
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(SORT_DEFAULT_DIR[key] || "asc");
    }
  }

  useEffect(() => {
    (async () => {
      try {
        setInvoices(await loadInvoices());
      } catch (e) {
        console.error("loadInvoices failed:", e?.message || e, e);
        setError("Couldn't load invoices — check your connection and try again.");
      }
    })();
  }, []);

  // Reused after a mutation (upload/edit/delete), called from event handlers
  // only — never invoked directly inside an effect. Same pattern as
  // AppShell.jsx's refresh().
  async function refresh() {
    try {
      setInvoices(await loadInvoices());
      setError("");
    } catch (e) {
      console.error("loadInvoices failed:", e?.message || e, e);
      setError("Couldn't reload invoices — check your connection and try again.");
    }
  }

  async function handleView(invoice) {
    setOpeningId(invoice.id);
    try {
      const url = await getInvoiceSignedUrl(invoice.file_path);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error("getInvoiceSignedUrl failed:", e?.message || e, e);
      alert("Couldn't open that file — check your connection and try again.");
    } finally {
      setOpeningId(null);
    }
  }

  async function handleDelete(invoice) {
    if (!isAdmin) return;
    if (!confirm("Delete this invoice? This can't be undone.")) return;
    try {
      await deleteInvoice(invoice);
      await refresh();
    } catch (e) {
      console.error("deleteInvoice failed:", e?.message || e, e);
      alert("Couldn't delete that invoice — check your connection and try again.");
    }
  }

  if (error) return <p className="bk-error-text">{error}</p>;
  if (!invoices) return <div className="bk-loading">Fetching the bowl of data…</div>;

  const filtered = invoices
    .filter((inv) => {
      if (vendorFilter && inv.vendor_id !== vendorFilter) return false;
      if (!search.trim()) return true;
      const q = search.trim().toLowerCase();
      const vendorName = vendors.find((v) => v.id === inv.vendor_id)?.name || "";
      return (
        (inv.file_name || "").toLowerCase().includes(q) ||
        (inv.notes || "").toLowerCase().includes(q) ||
        vendorName.toLowerCase().includes(q)
      );
    })
    .map((inv) => ({ inv, vendorName: vendors.find((v) => v.id === inv.vendor_id)?.name || "" }));

  const sorted = [...filtered].sort((a, b) => {
    let av, bv;
    switch (sortKey) {
      case "vendor":
        av = a.vendorName.toLowerCase();
        bv = b.vendorName.toLowerCase();
        break;
      case "total":
        av = a.inv.total_amount == null ? -Infinity : Number(a.inv.total_amount);
        bv = b.inv.total_amount == null ? -Infinity : Number(b.inv.total_amount);
        break;
      case "file":
        av = (a.inv.file_name || "").toLowerCase();
        bv = (b.inv.file_name || "").toLowerCase();
        break;
      case "notes":
        av = (a.inv.notes || "").toLowerCase();
        bv = (b.inv.notes || "").toLowerCase();
        break;
      case "date":
      default:
        av = a.inv.invoice_date || "";
        bv = b.inv.invoice_date || "";
        break;
    }
    if (av < bv) return sortDir === "asc" ? -1 : 1;
    if (av > bv) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  function sortTh(label, sortKeyName) {
    const active = sortKey === sortKeyName;
    return (
      <th className="bk-sortable-th" onClick={() => toggleSort(sortKeyName)}>
        {label}{active ? (sortDir === "asc" ? " ▲" : " ▼") : ""}
      </th>
    );
  }

  return (
    <div>
      <SectionHead
        title="Invoices"
        desc="A running archive of invoices — reference pricing and order frequency any time."
        action={<button className="bk-btn-primary" onClick={() => setAddingNew(true)}>+ Upload invoice</button>}
      />
      <InvoiceMonthlyChart invoices={filtered.map((f) => f.inv)} />
      <div className="bk-toolbar">
        <input className="bk-input" placeholder="Search invoices…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="bk-input" value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)}>
          <option value="">All vendors</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>
      {sorted.length === 0 ? (
        <EmptyState text="No invoices yet." sub="Upload one to start building the archive." />
      ) : (
        <table className="bk-table bk-table-sticky-head">
          <thead>
            <tr>
              {sortTh("Date", "date")}
              {sortTh("Vendor", "vendor")}
              {sortTh("Total", "total")}
              {sortTh("File", "file")}
              {sortTh("Notes", "notes")}
              <th></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(({ inv, vendorName }) => (
              <tr key={inv.id}>
                <td>{fmtDate(inv.invoice_date)}</td>
                <td>{vendorName || "—"}</td>
                <td>{inv.total_amount == null ? "—" : fmtMoney(inv.total_amount)}</td>
                <td>
                  <button className="bk-link" disabled={openingId === inv.id} onClick={() => handleView(inv)}>
                    {openingId === inv.id ? "Opening…" : inv.file_name || "View"}
                  </button>
                </td>
                <td>{inv.notes || "—"}</td>
                <td className="bk-row-actions">
                  <button className="bk-link" onClick={() => setEditing(inv)}>Edit</button>
                  {isAdmin && <button className="bk-link bk-link-danger" onClick={() => handleDelete(inv)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {(editing || addingNew) && (
        <InvoiceModal
          invoice={editing}
          vendors={vendors}
          onClose={() => { setEditing(null); setAddingNew(false); }}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
