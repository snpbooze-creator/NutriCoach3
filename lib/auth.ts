import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export type UserRole = "nutritionist" | "client";

export async function signUp(
  email: string,
  password: string,
  role: UserRole
): Promise<void> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  const { uid } = credential.user;

  await setDoc(doc(db, "users", uid), {
    uid,
    email,
    role,
    createdAt: new Date().toISOString(),
  });
}

export async function signIn(
  email: string,
  password: string
): Promise<{ role: UserRole }> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  const { uid } = credential.user;

  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) {
    throw new Error("User profile not found.");
  }

  const role = snap.data().role as UserRole;
  return { role };
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}

export async function getUserRole(uid: string): Promise<UserRole | null> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data().role as UserRole;
}
