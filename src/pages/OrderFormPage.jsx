import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useOrders } from '../hooks/useOrders'
import {
  addOrderPhoto,
  deleteOrder,
  newOrderId,
  removeOrderPhoto,
  setOrder,
  updateOrder,
} from '../firebase/firestore'
import { deleteOrderPhoto, uploadOrderPhoto } from '../firebase/storage'
import { PhotoUploader } from '../components/PhotoUploader'
import { PhotoGallery } from '../components/PhotoGallery'
import { recalcCaseFlag } from '../utils/recalcCaseFlag'
import { ORDER_CATEGORIES } from '../utils/categories'

let pendingFileSeq = 0

export function OrderFormPage() {
  const { caseId, orderId } = useParams()
  const navigate = useNavigate()
  const { orders } = useOrders(caseId)
  const isEdit = Boolean(orderId)
  const existingOrder = isEdit ? orders.find((o) => o.id === orderId) : null

  const [draftOrderId] = useState(() => orderId || newOrderId(caseId))
  const [orderDocExists, setOrderDocExists] = useState(isEdit)

  const [category, setCategory] = useState('')
  const [memo, setMemo] = useState('')
  const [ordered, setOrdered] = useState(false)
  const [photoPaths, setPhotoPaths] = useState([])
  const [pendingFiles, setPendingFiles] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [uploadErrorMessage, setUploadErrorMessage] = useState('')
  const [initialized, setInitialized] = useState(!isEdit)

  useEffect(() => {
    if (isEdit && existingOrder && !initialized) {
      setCategory(existingOrder.category || '')
      setMemo(existingOrder.memo || '')
      setOrdered(existingOrder.ordered || false)
      setPhotoPaths(existingOrder.photoPaths || [])
      setInitialized(true)
    }
  }, [isEdit, existingOrder, initialized])

  function handleFilesSelected(files) {
    const newPending = files.map((file) => ({
      id: `p${++pendingFileSeq}`,
      file,
      previewUrl: URL.createObjectURL(file),
      uploading: false,
      failed: false,
    }))
    setPendingFiles((prev) => [...prev, ...newPending])
  }

  function handleRemovePending(id) {
    setPendingFiles((prev) => {
      const target = prev.find((pf) => pf.id === id)
      if (target) URL.revokeObjectURL(target.previewUrl)
      return prev.filter((pf) => pf.id !== id)
    })
  }

  async function handleDeleteExisting(path) {
    setPhotoPaths((prev) => prev.filter((p) => p !== path))
    await Promise.allSettled([
      deleteOrderPhoto(path),
      removeOrderPhoto(caseId, draftOrderId, path),
    ])
  }

  async function uploadOne(pf) {
    try {
      const path = await uploadOrderPhoto(caseId, draftOrderId, pf.file)
      await addOrderPhoto(caseId, draftOrderId, path)
      return { id: pf.id, success: true, path }
    } catch {
      return { id: pf.id, success: false }
    }
  }

  async function runUploads(targets) {
    if (targets.length === 0) return true
    setPendingFiles((prev) =>
      prev.map((pf) => (targets.some((t) => t.id === pf.id) ? { ...pf, uploading: true, failed: false } : pf))
    )
    const results = await Promise.all(targets.map(uploadOne))

    const succeededPaths = results.filter((r) => r.success).map((r) => r.path)
    const failedIds = new Set(results.filter((r) => !r.success).map((r) => r.id))

    if (succeededPaths.length > 0) {
      setPhotoPaths((prev) => [...prev, ...succeededPaths])
    }
    setPendingFiles((prev) =>
      prev
        .filter((pf) => !results.some((r) => r.success && r.id === pf.id))
        .map((pf) => (failedIds.has(pf.id) ? { ...pf, uploading: false, failed: true } : pf))
    )

    if (failedIds.size > 0) {
      setUploadErrorMessage(`${failedIds.size}枚のアップロードに失敗しました`)
      return false
    }
    setUploadErrorMessage('')
    return true
  }

  async function handleRetryPending(id) {
    const target = pendingFiles.find((pf) => pf.id === id)
    if (!target) return
    await runUploads([target])
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!category) return
    setSubmitting(true)
    try {
      if (orderDocExists) {
        await updateOrder(caseId, draftOrderId, { category, memo, ordered })
      } else {
        await setOrder(caseId, draftOrderId, { category, memo, ordered })
        setOrderDocExists(true)
      }
      recalcCaseFlag(caseId)

      const allUploaded = await runUploads(pendingFiles)

      if (allUploaded) {
        navigate(`/cases/${caseId}`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('この発注を削除しますか？この操作は取り消せません。')) return
    await Promise.allSettled(photoPaths.map((p) => deleteOrderPhoto(p)))
    await deleteOrder(caseId, orderId)
    recalcCaseFlag(caseId)
    navigate(`/cases/${caseId}`)
  }

  if (isEdit && !initialized) {
    return (
      <div className="case-list-page">
        <p className="page-loading">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="case-list-page">
      <Link to={`/cases/${caseId}`} className="back-link">
        ← 案件詳細に戻る
      </Link>
      <h1>{isEdit ? '発注を編集' : '発注を追加'}</h1>
      <form className="order-form" onSubmit={handleSubmit}>
        <label>
          カテゴリ
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            autoFocus
          >
            <option value="" disabled>
              選択してください
            </option>
            {ORDER_CATEGORIES.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <label>
          メモ
          <textarea value={memo} onChange={(e) => setMemo(e.target.value)} rows={4} />
        </label>
        <label className="order-form-checkbox">
          <input
            type="checkbox"
            checked={ordered}
            onChange={(e) => setOrdered(e.target.checked)}
          />
          確認済み
        </label>

        <div className="photo-section">
          <span className="photo-section-label">発注書類の写真</span>
          <PhotoGallery
            photoPaths={photoPaths}
            pendingFiles={pendingFiles}
            onDeleteExisting={handleDeleteExisting}
            onRemovePending={handleRemovePending}
            onRetryPending={handleRetryPending}
          />
          <PhotoUploader onFilesSelected={handleFilesSelected} />
          {uploadErrorMessage && <p className="login-error">{uploadErrorMessage}</p>}
        </div>

        <div className="new-case-form-actions">
          {isEdit && (
            <button type="button" className="delete-button" onClick={handleDelete}>
              削除
            </button>
          )}
          <button type="submit" disabled={submitting}>
            {submitting ? '保存中...' : isEdit ? '保存する' : '追加する'}
          </button>
        </div>
      </form>
    </div>
  )
}
