import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { storage } from './config'

function buildPhotoPath(caseId, orderId, file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const rand = Math.random().toString(36).slice(2, 8)
  return `case-photos/${caseId}/${orderId}/${Date.now()}_${rand}.${ext}`
}

export async function uploadOrderPhoto(caseId, orderId, file) {
  const path = buildPhotoPath(caseId, orderId, file)
  await uploadBytes(ref(storage, path), file)
  return path
}

export function deleteOrderPhoto(path) {
  return deleteObject(ref(storage, path))
}

export function getOrderPhotoUrl(path) {
  return getDownloadURL(ref(storage, path))
}
