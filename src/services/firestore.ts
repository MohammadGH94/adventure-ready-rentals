import { doc, getDoc, serverTimestamp, setDoc, Timestamp } from "firebase/firestore";

import { db } from "@/lib/firebase";

export type UserProfile = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  photoURL?: string | null;
  createdAt?: Timestamp | null;
  updatedAt?: Timestamp | null;
};

export type CreateUserProfile = Omit<UserProfile, "id" | "createdAt" | "updatedAt">;

export const addUser = async (uid: string, data: CreateUserProfile) => {
  const userRef = doc(db, "users", uid);

  await setDoc(
    userRef,
    {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
};

export const getUser = async (uid: string): Promise<UserProfile | null> => {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  const data = snapshot.data() as Omit<UserProfile, "id">;

  return {
    id: snapshot.id,
    ...data,
  };
};
