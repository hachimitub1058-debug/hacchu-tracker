import { hardDeleteCase, restoreCase } from '../firebase/firestore'

const RETENTION_DAYS = 30

function daysRemaining(trashedAt) {
  if (!trashedAt) return RETENTION_DAYS
  const trashedMs = trashedAt.toMillis ? trashedAt.toMillis() : new Date(trashedAt).getTime()
  const elapsedDays = (Date.now() - trashedMs) / (24 * 60 * 60 * 1000)
  return Math.max(0, Math.ceil(RETENTION_DAYS - elapsedDays))
}

export function TrashedCaseCard({ caseItem }) {
  const remaining = daysRemaining(caseItem.trashedAt)

  async function handleDeleteNow() {
    if (
      !window.confirm(
        `「${caseItem.clientName}」を完全に削除します。この操作は取り消せません。よろしいですか？`
      )
    )
      return
    await hardDeleteCase(caseItem.id)
  }

  return (
    <div className="trashed-case-card">
      <div className="trashed-case-main">
        <span className="case-card-name">{caseItem.clientName}</span>
        <span className="case-card-date">{caseItem.funeralDate}</span>
        <span className="trashed-case-remaining">あと{remaining}日で完全削除されます</span>
      </div>
      <div className="trashed-case-actions">
        <button type="button" onClick={() => restoreCase(caseItem.id)}>
          復元
        </button>
        <button type="button" className="delete-button" onClick={handleDeleteNow}>
          今すぐ完全に削除
        </button>
      </div>
    </div>
  )
}
