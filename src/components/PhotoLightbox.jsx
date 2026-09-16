import { useState } from 'react'
import { usePhotoUrl } from '../hooks/usePhotoUrl'

function LightboxImage({ path }) {
  const { url, failed } = usePhotoUrl(path)

  if (failed) {
    return (
      <div className="photo-lightbox-overlay-text">
        <span>読み込み失敗</span>
      </div>
    )
  }
  if (!url) return <div className="photo-lightbox-loading" />
  return <img src={url} alt="" onClick={(e) => e.stopPropagation()} />
}

export function PhotoLightbox({ photoPaths, initialIndex = 0, onClose }) {
  const [index, setIndex] = useState(initialIndex)
  const hasMultiple = photoPaths.length > 1

  function showPrev(e) {
    e.stopPropagation()
    setIndex((i) => (i - 1 + photoPaths.length) % photoPaths.length)
  }

  function showNext(e) {
    e.stopPropagation()
    setIndex((i) => (i + 1) % photoPaths.length)
  }

  return (
    <div className="photo-lightbox" onClick={onClose}>
      <button
        type="button"
        className="photo-lightbox-close"
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
      >
        ×
      </button>

      {hasMultiple && (
        <span className="photo-lightbox-counter">
          {index + 1} / {photoPaths.length}
        </span>
      )}

      <LightboxImage path={photoPaths[index]} />

      {hasMultiple && (
        <>
          <button
            type="button"
            className="photo-lightbox-nav photo-lightbox-prev"
            onClick={showPrev}
          >
            ‹
          </button>
          <button
            type="button"
            className="photo-lightbox-nav photo-lightbox-next"
            onClick={showNext}
          >
            ›
          </button>
        </>
      )}
    </div>
  )
}
