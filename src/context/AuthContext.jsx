/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { getRedirectResult, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import {
  getUserDocument,
  syncUserDocument,
} from '../services/userProfileFirestore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(() => Boolean(auth))

  useEffect(() => {
    if (!auth) return undefined

    let unsubscribe = () => {}

    void (async () => {
      try {
        await getRedirectResult(auth)
      } catch {
        // No pending redirect, cancelled flow, or stale handler params — safe to ignore.
      }

      unsubscribe = onAuthStateChanged(auth, (nextUser) => {
        // Unblock the navbar immediately — profile fills in asynchronously below.
        setUser(nextUser)
        setLoading(false)

        if (nextUser) {
          // Fire-and-forget: don't await so the navbar renders right away.
          ;(async () => {
            try {
              await syncUserDocument(nextUser)
              const data = await getUserDocument(nextUser.uid)
              setProfile(data)
            } catch (err) {
              console.warn('[auth] profile sync failed', err)
            }
          })()
        } else {
          setProfile(null)
        }
      })
    })()

    return () => {
      unsubscribe()
    }
  }, [])

  const refreshProfile = useCallback(async () => {
    if (!auth) return
    const u = auth.currentUser
    if (!u) return
    try {
      await syncUserDocument(u)
      const data = await getUserDocument(u.uid)
      setProfile(data)
    } catch (err) {
      console.warn('[auth] refreshProfile failed', err)
    }
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      firebaseReady: !!auth,
      refreshProfile,
    }),
    [user, profile, loading, refreshProfile],
  )

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
