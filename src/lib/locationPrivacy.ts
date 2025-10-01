// Fuzzes coordinates for privacy by adding a random offset
// This makes the location approximate (neighborhood level) rather than exact
export function fuzzCoordinates(lat: number, lng: number): { latitude: number; longitude: number } {
  // Add random offset of ~0.01-0.015 degrees (roughly 1-1.5km)
  // This is enough to hide exact location but keep neighborhood accuracy
  const latOffset = (Math.random() - 0.5) * 0.025;
  const lngOffset = (Math.random() - 0.5) * 0.025;
  
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
