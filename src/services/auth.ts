import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
} from "firebase/auth";

import { auth } from "@/lib/firebase";

export const signUpWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const signInWithEmail = async (email: string, password: string): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = () => signOut(auth);

export const getCurrentUser = (): User | null => auth.currentUser;

export const sendVerificationEmail = async (user?: User) => {
  const targetUser = user ?? getCurrentUser();

  if (!targetUser) {
    throw new Error("No authenticated user available to send verification email.");
  }

  await sendEmailVerification(targetUser);
};
