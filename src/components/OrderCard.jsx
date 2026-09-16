import { useState } from 'react'
import { Link } from 'react-router-dom'
import { updateOrder } from '../firebase/firestore'
import { recalcCaseFlag } from '../utils/recalcCaseFlag'
import { usePhotoUrl } from '../hooks/usePhotoUrl'
import { PhotoLightbox } from './PhotoLightbox'

function OrderThumbnail({ photoPaths, onOpen }) {
  const { url, failed } = usePhotoUrl(photoPaths[0])

  if (photoPaths.length === 0) return null

  function handleClick(e) {
    e.preventDefault()
    e.stopPropagation()
    onOpen()
  }

  return (
    <div className="order-card-thumb" onClick={handleClick}>
      {url && <img src={url} alt="" />}
      {!url && !failed && <div className="order-card-thumb-loading" />}
      {failed && <div className="order-card-thumb-loading" />}
      {photoPaths.length > 1 && (
        <span className="order-card-thumb-count">+{photoPaths.length - 1}</span>
      )}
    </div>
  )
}

export function OrderCard({ caseId, order }) {
  const [lightboxOpen, setLightboxOpen] = useState(false)

  async function handleToggle(e) {
    e.preventDefault()
    e.stopPropagation()
    await updateOrder(caseId, order.id, { ordered: !order.ordered })
    recalcCaseFlag(caseId)
  }

  const photoPaths = order.photoPaths || []

  return (
    <div className="order-card">
      <Link to={`/cases/${caseId}/orders/${order.id}`} className="order-card-link">
        <OrderThumbnail photoPaths={photoPaths} onOpen={() => setLightboxOpen(true)} />
        <div className="order-card-text">
          <span className="order-card-category">{order.category || '（カテゴリ未入力）'}</span>
          {order.memo && <span className="order-card-memo">{order.memo}</span>}
        </div>
      </Link>
      <button
        className={order.ordered ? 'order-toggle order-toggle-done' : 'order-toggle order-toggle-pending'}
        onClick={handleToggle}
      >
        {order.ordered ? '確認済み' : '未確認'}
      </button>

      {lightboxOpen && (
        <PhotoLightbox
          photoPaths={photoPaths}
          initialIndex={0}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  )
}
