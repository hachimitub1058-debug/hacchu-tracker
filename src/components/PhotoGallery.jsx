import { useState } from 'react'
import { usePhotoUrl } from '../hooks/usePhotoUrl'

function ExistingPhoto({ path, onDelete, onOpen }) {
  const { url, failed } = usePhotoUrl(path)

  return (
    <div className="photo-thumb">
      {url && (
        <img src={url} alt="" onClick={() => onOpen(url)} />
      )}
      {!url && !failed && <div className="photo-thumb-loading" />}
      {failed && (
        <div className="photo-thumb-overlay">
          <span>読み込み失敗</span>
        </div>
      )}
      <button type="button" className="photo-thumb-remove" onClick={onDelete}>
        ×
      </button>
    </div>
  )
}

export function PhotoGallery({ photoPaths, pendingFiles, onDeleteExisting, onRemovePending, onRetryPending }) {
  const [lightboxUrl, setLightboxUrl] = useState(null)

  if (photoPaths.length === 0 && pendingFiles.length === 0) return null

  return (
    <div className="photo-gallery">
      {photoPaths.map((path) => (
        <ExistingPhoto
          key={path}
          path={path}
          onDelete={() => onDeleteExisting(path)}
          onOpen={setLightboxUrl}
        />
      ))}
      {pendingFiles.map((pf) => (
        <div
          key={pf.id}
          className={
            'photo-thumb photo-thumb-pending' + (pf.failed ? ' photo-thumb-failed' : '')
          }
        >
          <img src={pf.previewUrl} alt="" onClick={() => setLightboxUrl(pf.previewUrl)} />
          {pf.failed && (
            <div className="photo-thumb-overlay">
              <span>失敗</span>
              <button type="button" onClick={() => onRetryPending(pf.id)}>
                再試行
              </button>
            </div>
          )}
          {pf.uploading && (
            <div className="photo-thumb-overlay">
              <span>アップロード中...</span>
            </div>
          )}
          {!pf.uploading && (
            <button
              type="button"
              className="photo-thumb-remove"
              onClick={() => onRemovePending(pf.id)}
            >
              ×
            </button>
          )}
        </div>
      ))}

      {lightboxUrl && (
        <div className="photo-lightbox" onClick={() => setLightboxUrl(null)}>
          <button type="button" className="photo-lightbox-close" onClick={() => setLightboxUrl(null)}>
            ×
          </button>
          <img src={lightboxUrl} alt="" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  )
}
