import { useEffect, useState } from 'react'
import { getOrderPhotoUrl } from '../firebase/storage'

export function usePhotoUrl(path) {
  const [url, setUrl] = useState(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    if (!path) {
      setUrl(null)
      setFailed(false)
      return
    }
    let active = true
    setUrl(null)
    setFailed(false)
    getOrderPhotoUrl(path)
      .then((resolved) => {
        if (active) setUrl(resolved)
      })
      .catch(() => {
        if (active) setFailed(true)
      })
    return () => {
      active = false
    }
  }, [path])

  return { url, failed }
}
