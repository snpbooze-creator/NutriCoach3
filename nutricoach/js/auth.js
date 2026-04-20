// auth.js — Firebase Auth session management, login, logout, route protection

function requireRole(role) {
  return new Promise((resolve) => {
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        window.location.href = '/app/index.html';
        return resolve(null);
      }
      try {
        const doc = await db.collection('users').doc(user.uid).get();
        if (!doc.exists) {
          window.location.href = '/app/index.html';
          return resolve(null);
        }
        const data = doc.data();
        if (data.role !== role) {
          window.location.href = data.role === 'nutritionist'
            ? '/app/nutritionist.html'
            : '/app/client.html';
          return resolve(null);
        }
        resolve({ userId: user.uid, name: data.name, email: data.email, role: data.role });
      } catch (err) {
        console.error('requireRole error:', err);
        window.location.href = '/app/index.html';
        resolve(null);
      }
    });
  });
}

async function login(email, password) {
  try {
    const cred = await auth.signInWithEmailAndPassword(email, password);
    const doc = await db.collection('users').doc(cred.user.uid).get();
    if (!doc.exists) return { ok: false, error: 'User profile not found.' };
    const data = doc.data();
    const session = { userId: cred.user.uid, name: data.name, email: data.email, role: data.role };
    return { ok: true, session };
  } catch (err) {
    return { ok: false, error: _authError(err.code) };
  }
}

async function createUser({ name, email, password, role }) {
  try {
    const cred = await auth.createUserWithEmailAndPassword(email, password);
    const uid = cred.user.uid;

    await db.collection('users').doc(uid).set({ name, email, role });

    if (role === 'client') {
      const clientRef = db.collection('clients').doc();
      await clientRef.set({
        userId: uid,
        nutritionistId: null,
        name,
        age: null,
        height: '',
        goal: '',
        allergies: '',
        notes: '',
        currentWeight: null
      });
    }

    return { ok: true, user: { uid, name, email, role } };
  } catch (err) {
    return { ok: false, error: _authError(err.code) };
  }
}

async function logout() {
  await auth.signOut();
  window.location.href = '/app/index.html';
}

function _authError(code) {
  switch (code) {
    case 'auth/user-not-found':       return 'No account found with that email.';
    case 'auth/wrong-password':       return 'Incorrect password.';
    case 'auth/invalid-email':        return 'Please enter a valid email address.';
    case 'auth/email-already-in-use': return 'An account with this email already exists.';
    case 'auth/weak-password':        return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':    return 'Too many attempts. Please try again later.';
    case 'auth/invalid-credential':   return 'Invalid email or password.';
    default:                          return 'An error occurred. Please try again.';
  }
}
