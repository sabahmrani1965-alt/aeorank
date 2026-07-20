// Reuses the .skeleton shimmer class already defined in globals.css
// (same one the rest of the app uses) — just shapes it into a task-card
// silhouette so the marketplace grid has something alive to show while
// data loads, instead of a blank flash.
export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="kc-task-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="kc-task-card" style={{ gap: 12 }}>
          <div className="skeleton" style={{ height: 18, width: "60%" }} />
          <div className="skeleton" style={{ height: 12, width: "90%" }} />
          <div className="skeleton" style={{ height: 12, width: "70%" }} />
          <div className="skeleton" style={{ height: 40, width: "100%", marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}
