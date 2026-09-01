"use client";

import { latestPriceEntry, fmtMoney, fmtDate } from "@/lib/costing";
import { downloadCSV } from "@/lib/csv";
import { Modal, StockTag, EmptyState } from "./ui";

export default function LowStockReport({ lowStock, prices, vendors, onClose }) {
  const rows = lowStock.map(({ item, status, label }) => {
    const last = latestPriceEntry(item.id, prices);
    const vendorName = last?.vendor_id ? vendors.find((v) => v.id === last.vendor_id)?.name : null;
    return { item, status, label, last, vendorName };
  });

  function exportCSV() {
    const out = [["Item", "Stock status", "On hand", "Par level", "Vendor", "Last ordered", "Last order qty", "Last order price"]];
    rows.forEach(({ item, label, last, vendorName }) => out.push([
      item.name, label, item.on_hand_qty ?? "", item.par_level ?? "", vendorName || "",
      last ? last.purchase_date : "", last ? `${last.qty_purchased} ${last.purchase_unit || ""}`.trim() : "",
      last ? last.cost_per_purchase_unit : "",
    ]));
    downloadCSV(out, "barkeeper-low-stock-report.csv");
  }

  return (
    <Modal title="Needs to order — report" onClose={onClose} wide>
      <div id="bk-low-stock-print-area">
        <div className="bk-action-group bk-no-print" style={{ marginBottom: 14 }}>
          <button className="bk-btn-secondary" onClick={exportCSV}>Export CSV</button>
          <button className="bk-btn-primary" onClick={() => window.print()}>Print / Save as PDF</button>
        </div>

        {rows.length === 0 ? (
          <EmptyState text="Nothing below par right now." />
        ) : (
          <table className="bk-table bk-table-compact">
            <thead>
              <tr>
                <th>Item</th><th>Stock level</th><th>On hand</th><th>Par level</th>
                <th>Vendor</th><th>Last ordered</th><th>Last order qty</th><th>Last order price</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ item, status, label, last, vendorName }) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td><StockTag status={status} label={label} /></td>
                  <td>{item.on_hand_qty ?? "—"} {item.recipe_unit || ""}</td>
                  <td>{item.par_level ?? "—"} {item.recipe_unit || ""}</td>
                  <td>{vendorName || "—"}</td>
                  <td>{last ? fmtDate(last.purchase_date) : "—"}</td>
                  <td>{last ? `${last.qty_purchased} ${last.purchase_unit || ""}` : "—"}</td>
                  <td>{last ? fmtMoney(last.cost_per_purchase_unit) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Modal>
  );
}
