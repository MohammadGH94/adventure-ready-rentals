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

export function isDateAvailable(
  date: Date,
  unavailableDates: string[],
  blockOutTimes: any,
  existingBookings: Array<{
    rental_start_date: string;
    rental_end_date: string;
    status: string;
  }>
): boolean {
  const dateString = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD

  // Check if date is in unavailable_dates array
  if (unavailableDates.includes(dateString)) {
    return false;
  }

  // Check if date falls within any existing booking
  for (const booking of existingBookings) {
    const startDate = new Date(booking.rental_start_date);
    const endDate = new Date(booking.rental_end_date);
    
    if (date >= startDate && date <= endDate) {
      return false;
    }
  }

  // Check block_out_times if they exist
  if (blockOutTimes && Array.isArray(blockOutTimes)) {
    for (const blockOut of blockOutTimes) {
      if (blockOut.start && blockOut.end) {
        const blockStart = new Date(blockOut.start);
        const blockEnd = new Date(blockOut.end);
        
        if (date >= blockStart && date <= blockEnd) {
          return false;
        }
      }
    }
  }

  return true;
}

export function isDateRangeValid(
  startDate: Date | undefined,
  endDate: Date | undefined,
  minDays: number,
  maxDays: number | null,
  availabilityData: {
    unavailable_dates: string[];
    block_out_times: any;
    existing_bookings: Array<{
      rental_start_date: string;
      rental_end_date: string;
      status: string;
    }>;
  }
): boolean {
  if (!startDate || !endDate) return false;

  // Check minimum and maximum rental days
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysDiff < minDays) return false;
  if (maxDays && daysDiff > maxDays) return false;

  // Check if all dates in the range are available
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    if (!isDateAvailable(
      currentDate,
      availabilityData.unavailable_dates,
      availabilityData.block_out_times,
      availabilityData.existing_bookings
    )) {
      return false;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return true;
}
