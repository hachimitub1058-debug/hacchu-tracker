import { useEffect, useState } from 'react'
import { onSnapshot, orderBy, query } from 'firebase/firestore'
import { casesCollection } from '../firebase/firestore'

export function useCases() {
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(casesCollection, orderBy('funeralDate', 'asc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCases(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })))
      setLoading(false)
    })
    return unsubscribe
  }, [])

  return { cases, loading }
}
