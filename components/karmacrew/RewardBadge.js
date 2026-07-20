export default function RewardBadge({ amount }) {
  return <span className="kc-task-reward">${amount.toFixed(2)}</span>;
}
