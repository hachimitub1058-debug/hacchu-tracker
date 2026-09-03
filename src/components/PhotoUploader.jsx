import { useRef } from 'react'

export function PhotoUploader({ onFilesSelected }) {
  const cameraInputRef = useRef(null)
  const galleryInputRef = useRef(null)

  function handleChange(e) {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) onFilesSelected(files)
    e.target.value = ''
  }

  return (
    <div className="photo-uploader">
      <button
        type="button"
        className="photo-uploader-primary"
        onClick={() => cameraInputRef.current?.click()}
      >
        撮影する
      </button>
      <button
        type="button"
        className="photo-uploader-secondary"
        onClick={() => galleryInputRef.current?.click()}
      >
        アルバムから選ぶ
      </button>
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        hidden
        onChange={handleChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={handleChange}
      />
    </div>
  )
}
