import { useState } from 'react'
import { Link } from 'react-router-dom'
import { updateOrder } from '../firebase/firestore'
import { recalcCaseFlag } from '../utils/recalcCaseFlag'
import { usePhotoUrl } from '../hooks/usePhotoUrl'

function OrderThumbnail({ photoPaths }) {
  const { url, failed } = usePhotoUrl(photoPaths[0])
  const [open, setOpen] = useState(false)

  if (photoPaths.length === 0) return null

  function handleClick(e) {
    e.preventDefault()
    e.stopPropagation()
    if (url) setOpen(true)
  }

  return (
    <>
      <div className="order-card-thumb" onClick={handleClick}>
        {url && <img src={url} alt="" />}
        {!url && !failed && <div className="order-card-thumb-loading" />}
        {failed && <div className="order-card-thumb-loading" />}
        {photoPaths.length > 1 && (
          <span className="order-card-thumb-count">+{photoPaths.length - 1}</span>
        )}
      </div>
      {open && (
        <div
          className="photo-lightbox"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setOpen(false)
          }}
        >
          <button
            type="button"
            className="photo-lightbox-close"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              setOpen(false)
            }}
          >
            ×
          </button>
          <img src={url} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  )
}

export function OrderCard({ caseId, order }) {
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
        <OrderThumbnail photoPaths={photoPaths} />
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
    </div>
  )
}
