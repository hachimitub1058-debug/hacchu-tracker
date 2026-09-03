import { getCountFromServer, query, updateDoc, where } from 'firebase/firestore'
import { caseDocRef, ordersCollection } from '../firebase/firestore'

export async function recalcCaseFlag(caseId) {
  const q = query(ordersCollection(caseId), where('ordered', '==', false))
  const snapshot = await getCountFromServer(q)
  await updateDoc(caseDocRef(caseId), { unorderedCount: snapshot.data().count })
}
