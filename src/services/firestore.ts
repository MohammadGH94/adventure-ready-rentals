import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  where,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore";

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

export type EquipmentRecord = {
  id: string;
  title: string;
  description: string;
  pricePerDay: number;
  rating: number;
  reviewCount: number;
  location: string;
  imageUrls: string[];
  category?: string;
};

const getNumericValue = (value: unknown): number => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);

    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
};

const mapEquipmentSnapshot = (
  snapshot: QueryDocumentSnapshot<DocumentData>,
): EquipmentRecord => {
  const data = snapshot.data();

  const ratingValue = getNumericValue(data.rating ?? data.averageRating);
  const reviewCountValue = Math.max(0, Math.trunc(getNumericValue(data.reviewCount ?? data.reviews)));
  const rawCategory = typeof data.category === "string" ? data.category.trim() : undefined;

  const imageUrls = Array.isArray(data.imageUrls)
    ? data.imageUrls.filter((url): url is string => typeof url === "string" && url.length > 0)
    : [];

  return {
    id: snapshot.id,
    title: typeof data.title === "string" ? data.title : "",
    description: typeof data.description === "string" ? data.description : "",
    pricePerDay: getNumericValue(data.pricePerDay ?? data.price ?? data.dailyRate),
    rating: ratingValue > 0 ? ratingValue : 0,
    reviewCount: Number.isFinite(reviewCountValue) ? reviewCountValue : 0,
    location: typeof data.location === "string" ? data.location : "",
    imageUrls,
    category: rawCategory ? rawCategory.toLowerCase() : undefined,
  };
};

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

export const getEquipmentList = async (): Promise<EquipmentRecord[]> => {
  const snapshot = await getDocs(collection(db, "equipment"));

  return snapshot.docs.map(mapEquipmentSnapshot);
};

export const getFeaturedEquipment = async (): Promise<EquipmentRecord[]> => {
  const equipmentRef = collection(db, "equipment");

  const featuredFields = ["isFeatured", "featured"] as const;

  for (const field of featuredFields) {
    const featuredQuery = query(equipmentRef, where(field, "==", true));
    const snapshot = await getDocs(featuredQuery);

    if (!snapshot.empty) {
      return snapshot.docs.map(mapEquipmentSnapshot);
    }
  }

  const equipment = await getEquipmentList();

  return equipment.slice(0, 6);
};
