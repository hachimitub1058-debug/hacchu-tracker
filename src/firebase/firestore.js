import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from './config'
import { deleteOrderPhoto } from './storage'

export const casesCollection = collection(db, 'cases')

export function caseDocRef(caseId) {
  return doc(db, 'cases', caseId)
}

export function ordersCollection(caseId) {
  return collection(db, 'cases', caseId, 'orders')
}

export function orderDocRef(caseId, orderId) {
  return doc(db, 'cases', caseId, 'orders', orderId)
}

export function createCase({ clientName, funeralDate }) {
  return addDoc(casesCollection, {
    clientName,
    funeralDate,
    archived: false,
    trashedAt: null,
    unorderedCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

// 新規発注フォームで写真を先にアップロードできるよう、保存前にIDだけ確定させる
export function newOrderId(caseId) {
  return doc(ordersCollection(caseId)).id
}

export function setOrder(caseId, orderId, { category, memo, ordered = false }) {
  return setDoc(orderDocRef(caseId, orderId), {
    category,
    memo,
    ordered,
    photoPaths: [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function updateOrder(caseId, orderId, data) {
  return updateDoc(orderDocRef(caseId, orderId), {
    ...data,
    updatedAt: serverTimestamp(),
  })
}

export function deleteOrder(caseId, orderId) {
  return deleteDoc(orderDocRef(caseId, orderId))
}

export function archiveCase(caseId, archived) {
  return updateDoc(caseDocRef(caseId), { archived, updatedAt: serverTimestamp() })
}

export function trashCase(caseId) {
  return updateDoc(caseDocRef(caseId), {
    trashedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export function restoreCase(caseId) {
  return updateDoc(caseDocRef(caseId), { trashedAt: null, updatedAt: serverTimestamp() })
}

export async function hardDeleteCase(caseId) {
  const ordersSnap = await getDocs(ordersCollection(caseId))
  const photoDeletes = ordersSnap.docs.flatMap((d) =>
    (d.data().photoPaths || []).map((path) => deleteOrderPhoto(path))
  )
  await Promise.allSettled(photoDeletes)
  await Promise.allSettled(ordersSnap.docs.map((d) => deleteDoc(d.ref)))
  await deleteDoc(caseDocRef(caseId))
}

export function addOrderPhoto(caseId, orderId, path) {
  return updateDoc(orderDocRef(caseId, orderId), {
    photoPaths: arrayUnion(path),
    updatedAt: serverTimestamp(),
  })
}

export function removeOrderPhoto(caseId, orderId, path) {
  return updateDoc(orderDocRef(caseId, orderId), {
    photoPaths: arrayRemove(path),
    updatedAt: serverTimestamp(),
  })
}
