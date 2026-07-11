"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { deleteItem } from "@/lib/db";
import { downloadCSV } from "@/lib/csv";
import { weightedAvgCost, checkedInDate, estimatedExpiration, daysUntil, onHandValue, formatPurchaseUnitLabel, fmtMoney, MENU_CATEGORIES } from "@/lib/costing";
import { SectionHead, EmptyState } from "./ui";
import ItemModal from "./ItemModal";
import PricesDrawer from "./PricesDrawer";
import UploadInvoiceModal from "./UploadInvoiceModal";
import InventoryCountModal from "./InventoryCountModal";
import CountHistory from "./CountHistory";
import InventoryRow from "./InventoryRow";

export default function InventoryTab({ items, prices, vendors, onSaved }) {
  const { isAdmin } = useAuth();
  const [view, setView] = useState("items"); // items | counts
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("All");
  const [menuCategoryFilter, setMenuCategoryFilter] = useState("All");
  const [sortKey, setSortKey] = useState("name");
  const [editing, setEditing] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [pricesFor, setPricesFor] = useState(null);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [countOpen, setCountOpen] = useState(false);

  const filtered = useMemo(() => {
    let list = items.filter((i) => (tagFilter === "All" ? true : i.category_tag === tagFilter));
    if (menuCategoryFilter !== "All") {
      list = list.filter((i) => (menuCategoryFilter === "Uncategorized" ? !i.menu_category : i.menu_category === menuCategoryFilter));
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) => i.name.toLowerCase().includes(q));
    }
    const withCalc = list.map((i) => ({
      ...i,
      _cost: weightedAvgCost(i.id, prices),
      _checkedIn: checkedInDate(i.id, prices),
      _exp: estimatedExpiration(i, prices),
      _onHandValue: onHandValue(i, prices),
    }));
    withCalc.sort((a, b) => {
      if (sortKey === "name") return a.name.localeCompare(b.name);
      if (sortKey === "cost") return (b._cost || 0) - (a._cost || 0);
      if (sortKey === "expiring") {
        const da = a._exp ? daysUntil(a._exp) : 9999;
        const db = b._exp ? daysUntil(b._exp) : 9999;
        return da - db;
      }
      return 0;
    });
    return withCalc;
  }, [items, prices, search, tagFilter, menuCategoryFilter, sortKey]);

  const totalOnHandValue = filtered.reduce((s, i) => s + (i._onHandValue || 0), 0);
  const missingCount = filtered.filter((i) => i._onHandValue == null).length;

  async function handleDelete(id) {
    if (!isAdmin) return;
    if (!confirm("Delete this inventory item? Purchase history will be deleted with it.")) return;
    try {
      await deleteItem(id);
      await onSaved();
    } catch (e) {
      if (e.code === "23503") {
        alert("Can't delete this item — it's still used in a recipe or a saved inventory count. Remove it from those first, then delete it.");
      } else {
        console.error(e);
        alert("Couldn't delete that item — check your connection and try again.");
      }
    }
  }

  function exportCSV() {
    const rows = [["Name", "Tag", "Menu category", "Purchase unit", "Recipe unit", "Weighted avg cost", "Par level", "Shelf life (days)", "On hand qty", "On hand value", "Checked in", "Est. expiration"]];
    filtered.forEach((i) => rows.push([
      i.name, i.category_tag, i.menu_category ?? "", formatPurchaseUnitLabel(i), i.recipe_unit ?? "", i._cost ?? "",
      i.par_level ?? "", i.shelf_life_days ?? "", i.on_hand_qty ?? "", i._onHandValue ?? "", i._checkedIn ?? "", i._exp ?? "",
    ]));
    downloadCSV(rows, "barkeeper-inventory.csv");
  }

  return (
    <div>
      <SectionHead
        title="Inventory"
        desc="Food, bar, and shared items — one list, weighted-average priced."
        action={
          <div className="bk-action-group">
            <button className="bk-btn-secondary" onClick={() => setCountOpen(true)}>Run inventory count</button>
            <button className="bk-btn-secondary" onClick={() => setUploadOpen(true)}>Upload invoice</button>
            <button className="bk-btn-primary" onClick={() => setAddingNew(true)}>+ Add item</button>
          </div>
        }
      />

      <div className="bk-toolbar">
        <button className={`bk-subtab ${view === "items" ? "active" : ""}`} onClick={() => setView("items")}>Items</button>
        <button className={`bk-subtab ${view === "counts" ? "active" : ""}`} onClick={() => setView("counts")}>Count history</button>
      </div>

      {view === "counts" ? (
        <CountHistory />
      ) : (
        <>
          <div className="bk-toolbar">
            <input className="bk-input" placeholder="Search inventory…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="bk-input" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
              <option>All</option><option>Food</option><option>Bar</option><option>Shared</option>
            </select>
            <select className="bk-input" value={menuCategoryFilter} onChange={(e) => setMenuCategoryFilter(e.target.value)}>
              <option value="All">All menu categories</option>
              {MENU_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              <option value="Uncategorized">— Uncategorized —</option>
            </select>
            <select className="bk-input" value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
              <option value="name">Sort: Name</option>
              <option value="cost">Sort: Cost (high→low)</option>
              <option value="expiring">Sort: Expiring soon</option>
            </select>
            <button className="bk-btn-secondary" onClick={exportCSV}>Export CSV</button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState text="No inventory yet — let's dig some up." sub="Add an item or upload an invoice to get started." />
          ) : (
            <>
              <p className="bk-disclaimer" style={{ marginTop: 0 }}>
                Name, tag, recipe unit, par level, and shelf life save as you edit them. Logging a purchase or a new
                on-hand count both write a real entry, same as the full Prices/Count screens. Purchase-unit details
                (case size, pack qty, etc.) are set via Edit, since there&apos;s more to them than fits in a cell.
              </p>
              <div style={{ overflowX: "auto" }}>
                <table className="bk-table">
                  <thead>
                    <tr>
                      <th>Name</th><th>Tag</th><th>Menu category</th><th>Purchase unit</th><th>Recipe unit</th><th>Log a purchase</th><th>Par level</th>
                      <th>Shelf life (days)</th><th>On hand</th><th>On-hand value</th>
                      <th>Checked in</th><th>Est. expiration</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((i) => (
                      <InventoryRow
                        key={i.id}
                        item={i}
                        items={items}
                        prices={prices}
                        isAdmin={isAdmin}
                        onSaved={onSaved}
                        onOpenPrices={setPricesFor}
                        onOpenEdit={setEditing}
                        onDelete={handleDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bk-drawer-summary" style={{ marginTop: 10 }}>
                Inventory on hand ({filtered.length} item{filtered.length === 1 ? "" : "s"}): <strong>{fmtMoney(totalOnHandValue)}</strong>
                {missingCount > 0 && ` · ${missingCount} not yet counted or priced, excluded from this total`}
              </div>
            </>
          )}
        </>
      )}

      {uploadOpen && (
        <UploadInvoiceModal items={items} vendors={vendors} onClose={() => setUploadOpen(false)} onSaved={onSaved} />
      )}
      {countOpen && (
        <InventoryCountModal items={items} prices={prices} onClose={() => setCountOpen(false)} onSaved={onSaved} />
      )}
      {(addingNew || editing) && (
        <ItemModal item={editing} onClose={() => { setAddingNew(false); setEditing(null); }} onSaved={onSaved} />
      )}
      {pricesFor && (
        <PricesDrawer
          item={pricesFor}
          prices={prices.filter((p) => p.item_id === pricesFor.id)}
          allPrices={prices}
          vendors={vendors}
          onClose={() => setPricesFor(null)}
          onSaved={onSaved}
        />
      )}
      <p className="bk-disclaimer">
        Estimated expirations are calculated from shelf-life settings, not a food-safety guarantee — always trust a manager&apos;s own check first.
      </p>
    </div>
  );
}
