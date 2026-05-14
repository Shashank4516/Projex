import { initializeApp } from 'firebase/app'
import {
  browserLocalPersistence,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
} from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getAnalytics, isSupported } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
}

const firebaseReady =
  Boolean(firebaseConfig.apiKey) &&
  Boolean(firebaseConfig.authDomain) &&
  Boolean(firebaseConfig.projectId) &&
  Boolean(firebaseConfig.appId)

/** @type {import('firebase/app').FirebaseApp | null} */
let app = null
if (firebaseReady) {
  app = initializeApp(firebaseConfig)
}

/**
 * Prefer IndexedDB + local persistence so Google redirect / popup auth survives
 * storage-partitioned browsers better than sessionStorage-only defaults.
 *
 * @type {import('firebase/auth').Auth | null}
 */
export const auth = app
  ? (() => {
      try {
        return initializeAuth(app, {
          persistence: [indexedDBLocalPersistence, browserLocalPersistence],
        })
      } catch (e) {
        if (/** @type {{ code?: string }} */ (e)?.code === 'auth/already-initialized') {
          return getAuth(app)
        }
        throw e
      }
    })()
  : null

/** Firestore instance, or null if Firebase wasn’t initialized. */
export const db = app ? getFirestore(app) : null

export function isFirebaseConfigured() {
  return firebaseReady
}

if (app && typeof window !== 'undefined') {
  isSupported()
    .then((supported) => {
      if (supported) getAnalytics(app)
    })
    .catch(() => {})
}
