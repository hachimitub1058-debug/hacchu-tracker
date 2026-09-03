const TABS = [
  { key: 'active', label: '施行中' },
  { key: 'archived', label: '施行済み' },
  { key: 'trashed', label: 'ゴミ箱' },
]

export function ArchiveFilterTabs({ value, onChange }) {
  return (
    <div className="archive-filter-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          className={
            value === tab.key
              ? 'archive-filter-tab archive-filter-tab-active'
              : 'archive-filter-tab'
          }
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
