import { GoogleAuthProvider, signInWithPopup, browserPopupRedirectResolver } from 'firebase/auth'

/**
 * Google OAuth via popup. Works reliably on localhost and on non-Firebase
 * Hosting deployments (Railway, Vercel, etc.) where signInWithRedirect breaks
 * due to third-party cookie restrictions and storage partitioning.
 *
 * @param {import('firebase/auth').Auth} authInst
 * @returns {Promise<import('firebase/auth').UserCredential>}
 */
export async function signInWithGoogle(authInst) {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  return signInWithPopup(authInst, provider, browserPopupRedirectResolver)
}
