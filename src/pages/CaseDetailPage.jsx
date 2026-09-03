import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { onSnapshot } from 'firebase/firestore'
import { archiveCase, caseDocRef, trashCase } from '../firebase/firestore'
import { useOrders } from '../hooks/useOrders'
import { OrderCard } from '../components/OrderCard'

export function CaseDetailPage() {
  const { caseId } = useParams()
  const navigate = useNavigate()
  const [caseItem, setCaseItem] = useState(null)
  const { orders, loading } = useOrders(caseId)

  useEffect(() => {
    const unsubscribe = onSnapshot(caseDocRef(caseId), (snap) => {
      setCaseItem(snap.exists() ? { id: snap.id, ...snap.data() } : null)
    })
    return unsubscribe
  }, [caseId])

  const sortedOrders = [...orders].sort((a, b) => Number(a.ordered) - Number(b.ordered))

  async function handleDelete() {
    if (
      !window.confirm(
        'この案件をゴミ箱に移動します。30日後に自動的に完全削除されます。よろしいですか？'
      )
    )
      return
    await trashCase(caseId)
    navigate('/')
  }

  return (
    <div className="case-list-page">
      <Link to="/" className="back-link">
        ← 一覧に戻る
      </Link>

      {caseItem && (
        <header className="case-detail-header">
          <h1>{caseItem.clientName}</h1>
          <p className="case-detail-date">{caseItem.funeralDate}</p>
          <div className="case-detail-actions">
            <button
              type="button"
              onClick={() => archiveCase(caseId, !caseItem.archived)}
            >
              {caseItem.archived ? '施行中に戻す' : '施行済みにする'}
            </button>
            <button type="button" className="delete-button" onClick={handleDelete}>
              削除
            </button>
          </div>
        </header>
      )}

      <Link to={`/cases/${caseId}/orders/new`} className="new-case-button">
        ＋ 発注を追加
      </Link>

      {!loading && sortedOrders.length === 0 && (
        <p className="empty-state">発注はまだありません</p>
      )}

      <div className="order-list">
        {sortedOrders.map((order) => (
          <OrderCard key={order.id} caseId={caseId} order={order} />
        ))}
      </div>
    </div>
  )
}
