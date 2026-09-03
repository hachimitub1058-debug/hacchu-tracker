export function UnorderedBadge({ count }) {
  if (!count) return null
  return <span className="unordered-badge">未確認 {count}件</span>
}
