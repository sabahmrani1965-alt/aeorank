export default function StatsBar({ totalEarned, tasksCompleted, streak, dailyCount, dailyLimit }) {
  return (
    <div className="kc-stats-bar">
      <div className="kc-stat-item">
        <span className="kc-stat-icon">💰</span>
        <span className="kc-stat-value">${totalEarned.toFixed(2)}</span>
      </div>
      <div className="kc-stat-item">
        <span className="kc-stat-icon">✅</span>
        <span className="kc-stat-value">{tasksCompleted}</span>
        <span className="kc-stat-label">tasks</span>
      </div>
      <div className="kc-stat-item">
        <span className="kc-stat-icon">🔥</span>
        <span className="kc-stat-value">{streak}</span>
        <span className="kc-stat-label">day streak</span>
      </div>
      <div className="kc-stat-item">
        <span className="kc-stat-icon">🎯</span>
        <span className="kc-stat-label">Daily</span>
        <span className="kc-stat-value">{dailyCount}/{dailyLimit}</span>
      </div>
    </div>
  );
}
