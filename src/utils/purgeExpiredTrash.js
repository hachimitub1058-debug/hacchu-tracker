import { getDocs } from 'firebase/firestore'
import { casesCollection, hardDeleteCase } from '../firebase/firestore'

const TRASH_RETENTION_MS = 30 * 24 * 60 * 60 * 1000

export async function purgeExpiredTrash() {
  const snap = await getDocs(casesCollection)
  const now = Date.now()

  const expired = snap.docs.filter((d) => {
    const trashedAt = d.data().trashedAt
    if (!trashedAt) return false
    const trashedMs = trashedAt.toMillis ? trashedAt.toMillis() : new Date(trashedAt).getTime()
    return now - trashedMs > TRASH_RETENTION_MS
  })

  await Promise.allSettled(expired.map((d) => hardDeleteCase(d.id)))
}
