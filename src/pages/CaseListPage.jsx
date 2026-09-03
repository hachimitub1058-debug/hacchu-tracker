import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { logout } from '../firebase/auth'
import { useCases } from '../hooks/useCases'
import { createCase } from '../firebase/firestore'
import { purgeExpiredTrash } from '../utils/purgeExpiredTrash'
import { CaseCard } from '../components/CaseCard'
import { TrashedCaseCard } from '../components/TrashedCaseCard'
import { ArchiveFilterTabs } from '../components/ArchiveFilterTabs'

const EMPTY_MESSAGES = {
  active: '案件はまだ登録されていません',
  archived: '施行済みの案件はありません',
  trashed: 'ゴミ箱は空です',
}

export function CaseListPage() {
  const { user } = useAuth()
  const { cases, loading } = useCases()
  const [tab, setTab] = useState('active')
  const [showForm, setShowForm] = useState(false)
  const [clientName, setClientName] = useState('')
  const [funeralDate, setFuneralDate] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    purgeExpiredTrash()
  }, [])

  const visibleCases = useMemo(() => {
    return cases.filter((c) => {
      if (tab === 'trashed') return Boolean(c.trashedAt)
      if (tab === 'archived') return c.archived && !c.trashedAt
      return !c.archived && !c.trashedAt
    })
  }, [cases, tab])

  async function handleSubmit(e) {
    e.preventDefault()
    if (!clientName || !funeralDate) return
    setSubmitting(true)
    try {
      await createCase({ clientName, funeralDate })
      setClientName('')
      setFuneralDate('')
      setShowForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="case-list-page">
      <header className="case-list-header">
        <h1>案件一覧</h1>
        <button className="logout-link" onClick={() => logout()}>
          ログアウト（{user?.email}）
        </button>
      </header>

      <ArchiveFilterTabs value={tab} onChange={setTab} />

      {tab === 'active' && !showForm && (
        <button className="new-case-button" onClick={() => setShowForm(true)}>
          ＋ 案件を追加
        </button>
      )}

      {tab === 'active' && showForm && (
        <form className="new-case-form" onSubmit={handleSubmit}>
          <label>
            施主名
            <input
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              autoFocus
            />
          </label>
          <label>
            葬儀日
            <input
              type="date"
              value={funeralDate}
              onChange={(e) => setFuneralDate(e.target.value)}
              required
            />
          </label>
          <div className="new-case-form-actions">
            <button type="button" onClick={() => setShowForm(false)}>
              キャンセル
            </button>
            <button type="submit" disabled={submitting}>
              追加する
            </button>
          </div>
        </form>
      )}

      {!loading && visibleCases.length === 0 && !showForm && (
        <p className="empty-state">{EMPTY_MESSAGES[tab]}</p>
      )}

      <div className="case-list">
        {tab === 'trashed'
          ? visibleCases.map((caseItem) => (
              <TrashedCaseCard key={caseItem.id} caseItem={caseItem} />
            ))
          : visibleCases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
      </div>
    </div>
  )
}
