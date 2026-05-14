import { GoogleAuthProvider, signInWithRedirect } from 'firebase/auth'

/**
 * Full-page Google OAuth (redirect). More reliable than popups when
 * sessionStorage is partitioned or third-party cookies are restricted.
 *
 * @param {import('firebase/auth').Auth} authInst
 */
export async function signInWithGoogle(authInst) {
  const provider = new GoogleAuthProvider()
  provider.setCustomParameters({ prompt: 'select_account' })
  await signInWithRedirect(authInst, provider)
}
