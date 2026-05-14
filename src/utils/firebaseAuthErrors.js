/** Readable copy for Firebase Auth error codes. */

const MESSAGES = {
  'auth/invalid-email': 'That email doesn’t look valid.',
  'auth/user-disabled': 'This account has been disabled.',
  'auth/user-not-found': 'No account found for this email.',
  'auth/wrong-password': 'Incorrect password.',
  'auth/invalid-credential':
    'Sign-in failed. Check your email and password and try again.',
  'auth/email-already-in-use': 'That email is already registered.',
  'auth/weak-password': 'Use a stronger password (at least 6 characters).',
  'auth/operation-not-allowed': 'This sign-in method isn’t enabled in Firebase.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
  'auth/network-request-failed': 'Network error. Check your connection.',
  'auth/too-many-requests': 'Too many attempts. Try again later.',
  'auth/requires-recent-login': 'Please sign in again and retry.',
}

/**
 * @param {unknown} err
 */
export function formatAuthError(err) {
  const code =
    err && typeof err === 'object' && 'code' in err ? String(err.code) : ''
  const fallback =
    err && typeof err === 'object' && 'message' in err
      ? String(err.message)
      : 'Something went wrong. Please try again.'
  return MESSAGES[code] ?? fallback
}
