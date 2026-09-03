import { Link } from 'react-router-dom'
import { UnorderedBadge } from './UnorderedBadge'

function formatFuneralDate(funeralDate) {
  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)
  const tomorrowStr = new Date(today.getTime() + 86400000).toISOString().slice(0, 10)

  const [, month, day] = funeralDate.split('-')
  const label = `${Number(month)}月${Number(day)}日`

  if (funeralDate === todayStr) return { label: `本日（${label}）`, emphasize: true }
  if (funeralDate === tomorrowStr) return { label: `明日（${label}）`, emphasize: true }
  return { label, emphasize: false }
}

export function CaseCard({ caseItem }) {
  const { label, emphasize } = formatFuneralDate(caseItem.funeralDate)

  return (
    <Link to={`/cases/${caseItem.id}`} className="case-card">
      <div className="case-card-main">
        <span className="case-card-name">{caseItem.clientName}</span>
        <span className={emphasize ? 'case-card-date case-card-date-emphasis' : 'case-card-date'}>
          {label}
        </span>
      </div>
      <UnorderedBadge count={caseItem.unorderedCount} />
    </Link>
  )
}
