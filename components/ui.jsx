export function Pill({ tag }) {
  const cls = tag === "Food" ? "pill-food" : tag === "Bar" ? "pill-bar" : "pill-shared";
  return <span className={`bk-pill ${cls}`}>{tag}</span>;
}

export function StatCard({ label, value, sub, tone }) {
  return (
    <div className={`bk-stat ${tone}`}>
      <div className="bk-stat-label">{label}</div>
      <div className="bk-stat-value">{value}</div>
      {sub && <div className="bk-stat-sub">{sub}</div>}
    </div>
  );
}

export function SectionHead({ title, desc, action }) {
  return (
    <div className="bk-section-head">
      <div>
        <h2>{title}</h2>
        {desc && <p>{desc}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ text, sub }) {
  return (
    <div className="bk-empty">
      <div className="bk-empty-text">{text}</div>
      {sub && <div className="bk-empty-sub">{sub}</div>}
    </div>
  );
}
