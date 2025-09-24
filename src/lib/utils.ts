import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/integrations/supabase/client";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStorageImageUrl(path: string | null | undefined): string {
  if (!path || path === "/placeholder.svg") {
    return "/placeholder.svg";
  }
  
  // If it's already a full URL, return as is
  if (path.startsWith("http")) {
    return path;
  }
  
  // Get public URL from Supabase Storage
  const { data } = supabase.storage
    .from('gear-photos')
    .getPublicUrl(path);
    
  return data.publicUrl;
}
