// Simple hash function to generate deterministic pseudo-random numbers from a string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

// Fuzzes coordinates for privacy by adding a deterministic offset based on listing ID
// This makes the location approximate (neighborhood level) rather than exact
export function fuzzCoordinates(lat: number, lng: number, seed: string): { latitude: number; longitude: number } {
  // Use seed to generate deterministic offsets
  const hash = hashString(seed);
  const latSeed = (hash % 1000) / 1000; // Normalize to 0-1
  const lngSeed = ((hash * 7) % 1000) / 1000; // Different seed for longitude
  
  // Add offset of ~0.01-0.015 degrees (roughly 1-1.5km)
  const latOffset = (latSeed - 0.5) * 0.025;
  const lngOffset = (lngSeed - 0.5) * 0.025;
  
  return {
    latitude: lat + latOffset,
    longitude: lng + lngOffset
  };
}

// Extracts approximate location (city, state) from full address
export function getApproximateLocation(fullAddress: string): string {
  // Try to extract city and state/province from address
  const parts = fullAddress.split(',').map(p => p.trim());
  
  if (parts.length >= 2) {
    // Return last 2-3 parts (typically city, state, country)
    return parts.slice(-3).join(', ');
  }
  
  return fullAddress;
}
