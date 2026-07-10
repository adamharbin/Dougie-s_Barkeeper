"use client";

import { useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { deleteVendor } from "@/lib/db";
import { SectionHead, EmptyState } from "./ui";
import VendorModal from "./VendorModal";

export default function VendorsTab({ vendors, onSaved }) {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [addingNew, setAddingNew] = useState(false);

  const filtered = vendors.filter((v) => v.name.toLowerCase().includes(search.toLowerCase()));

  async function handleDelete(id) {
    if (!isAdmin) return;
    if (!confirm("Delete this vendor?")) return;
    await deleteVendor(id);
    await onSaved();
  }

  return (
    <div>
      <SectionHead
        title="Vendors"
        desc="Who supplies what, and when to have the order in."
        action={<button className="bk-btn-primary" onClick={() => setAddingNew(true)}>+ Add vendor</button>}
      />
      <div className="bk-toolbar">
        <input className="bk-input" placeholder="Search vendors…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {filtered.length === 0 ? (
        <EmptyState text="No vendors yet." sub="Add one to start linking purchases." />
      ) : (
        <table className="bk-table">
          <thead><tr><th>Name</th><th>Contact</th><th>Order deadline</th><th>Delivery days</th><th>Supplies</th><th></th></tr></thead>
          <tbody>
            {filtered.map((v) => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.contact_name}{v.contact_method ? ` (${v.contact_method})` : ""}</td>
                <td>{v.order_deadline || "—"}</td>
                <td>{v.delivery_days || "—"}</td>
                <td>{v.supplies_notes || "—"}</td>
                <td className="bk-row-actions">
                  <button className="bk-link" onClick={() => setEditing(v)}>Edit</button>
                  {isAdmin && <button className="bk-link bk-link-danger" onClick={() => handleDelete(v.id)}>Delete</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {(editing || addingNew) && (
        <VendorModal vendor={editing} onClose={() => { setEditing(null); setAddingNew(false); }} onSaved={onSaved} />
      )}
    </div>
  );
}
