import {
  addDoc,
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
import { getDownloadURL, ref, uploadBytesResumable } from "firebase/storage";

import { db, storage } from "@/lib/firebase";

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

export type NewEquipmentInput = {
  title: string;
  description: string;
  category: string;
  pricePerDay: number;
  ownerId: string;
  imageUrls: string[];
  location: string;
  availability?: boolean;
  weeklyRate?: number;
  availabilityNote?: string;
};

export type GearImageUploadUpdate = {
  file: File;
  progress: number;
};

export type UploadGearImagesOptions = {
  files: File[];
  ownerId: string;
  onProgress?: (update: GearImageUploadUpdate) => void;
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

export const addEquipment = async (equipment: NewEquipmentInput): Promise<string> => {
  const {
    title,
    description,
    category,
    pricePerDay,
    ownerId,
    imageUrls,
    location,
    availability,
    weeklyRate,
    availabilityNote,
  } = equipment;

  if (!ownerId || ownerId.trim().length === 0) {
    throw new Error("An authenticated owner is required to list gear.");
  }

  if (!Number.isFinite(pricePerDay) || pricePerDay <= 0) {
    throw new Error("Daily rate must be a positive number.");
  }

  const sanitizedImageUrls = imageUrls
    .map((url) => (typeof url === "string" ? url.trim() : ""))
    .filter((url) => url.length > 0);

  if (sanitizedImageUrls.length === 0) {
    throw new Error("At least one image must be uploaded for the listing.");
  }

  const payload: Record<string, unknown> = {
    title: title.trim(),
    description: description.trim(),
    category: category.trim(),
    pricePerDay,
    ownerId: ownerId.trim(),
    imageUrls: sanitizedImageUrls,
    location: location.trim(),
    availability: typeof availability === "boolean" ? availability : true,
    listedAt: serverTimestamp(),
  };

  if (typeof weeklyRate === "number" && Number.isFinite(weeklyRate) && weeklyRate > 0) {
    payload.weeklyRate = weeklyRate;
  }

  if (typeof availabilityNote === "string" && availabilityNote.trim().length > 0) {
    payload.availabilityNote = availabilityNote.trim();
  }

  try {
    const docRef = await addDoc(collection(db, "equipment"), payload);
    return docRef.id;
  } catch (error) {
    console.error("Error adding equipment document:", error);
    throw new Error("Failed to create the equipment listing. Please try again.");
  }
};

export const uploadGearImages = async ({
  files,
  ownerId,
  onProgress,
}: UploadGearImagesOptions): Promise<string[]> => {
  if (!files || files.length === 0) {
    return [];
  }

  if (!ownerId || ownerId.trim().length === 0) {
    throw new Error("An authenticated owner is required to upload images.");
  }

  const normalizedOwnerId = ownerId.trim();

  const uploadPromises = files.map(
    (file) =>
      new Promise<string>((resolve, reject) => {
        const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
        const safeName = file.name.replace(/\s+/g, "-");
        const storageRef = ref(storage, `equipment/${normalizedOwnerId}/${uniqueSuffix}-${safeName}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = snapshot.totalBytes > 0 ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 : 0;
            onProgress?.({ file, progress });
          },
          (error) => {
            onProgress?.({ file, progress: 0 });
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              onProgress?.({ file, progress: 100 });
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          },
        );
      }),
  );

  try {
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error("Error uploading gear images:", error);
    throw new Error("Failed to upload one or more images. Please try again.");
  }
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
