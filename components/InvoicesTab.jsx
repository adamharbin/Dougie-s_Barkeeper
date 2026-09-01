"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { loadInvoices, deleteInvoice, getInvoiceSignedUrl } from "@/lib/db";
import { fmtMoney, fmtDate } from "@/lib/costing";
import { SectionHead, EmptyState } from "./ui";
import InvoiceModal from "./InvoiceModal";

export default function InvoicesTab({ vendors }) {
  const { isAdmin } = useAuth();
  const [invoices, setInvoices] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [vendorFilter, setVendorFilter] = useState("");
  const [editing, setEditing] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [openingId, setOpeningId] = useState(null);

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

  const filtered = invoices.filter((inv) => {
    if (vendorFilter && inv.vendor_id !== vendorFilter) return false;
    if (!search.trim()) return true;
    const q = search.trim().toLowerCase();
    const vendorName = vendors.find((v) => v.id === inv.vendor_id)?.name || "";
    return (
      (inv.file_name || "").toLowerCase().includes(q) ||
      (inv.notes || "").toLowerCase().includes(q) ||
      vendorName.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <SectionHead
        title="Invoices"
        desc="A running archive of invoices — reference pricing and order frequency any time."
        action={<button className="bk-btn-primary" onClick={() => setAddingNew(true)}>+ Upload invoice</button>}
      />
      <div className="bk-toolbar">
        <input className="bk-input" placeholder="Search invoices…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className="bk-input" value={vendorFilter} onChange={(e) => setVendorFilter(e.target.value)}>
          <option value="">All vendors</option>
          {vendors.map((v) => (
            <option key={v.id} value={v.id}>{v.name}</option>
          ))}
        </select>
      </div>
      {filtered.length === 0 ? (
        <EmptyState text="No invoices yet." sub="Upload one to start building the archive." />
      ) : (
        <table className="bk-table bk-table-sticky-head">
          <thead>
            <tr><th>Date</th><th>Vendor</th><th>Total</th><th>File</th><th>Notes</th><th></th></tr>
          </thead>
          <tbody>
            {filtered.map((inv) => {
              const vendorName = vendors.find((v) => v.id === inv.vendor_id)?.name;
              return (
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
              );
            })}
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
