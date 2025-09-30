import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { geocodeAddress } from "@/lib/geocoding";
import { useToast } from "@/hooks/use-toast";

interface LocationInputProps {
  value: string;
  onChange: (address: string, coordinates?: { latitude: number; longitude: number }) => void;
  placeholder?: string;
  className?: string;
}

export function LocationInput({ value, onChange, placeholder = "Enter address", className }: LocationInputProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const { toast } = useToast();

  const handleGeocode = async () => {
    if (!value || !value.trim()) {
      toast({
        variant: "destructive",
        title: "No address provided",
        description: "Please enter an address to geocode"
      });
      return;
    }

    setIsGeocoding(true);
    try {
      const result = await geocodeAddress(value);
      
      if (result) {
        onChange(result.formattedAddress, result.coordinates);
        toast({
          title: "Address verified",
          description: "Location coordinates have been saved"
        });
      } else {
        toast({
          variant: "destructive",
          title: "Address not found",
          description: "Please check the address and try again"
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Geocoding failed",
        description: "Unable to verify address location"
      });
    } finally {
      setIsGeocoding(false);
    }
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Input
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1"
      />
      <Button
        type="button"
        variant="outline"
        onClick={handleGeocode}
        disabled={isGeocoding || !value || !value.trim()}
        className="px-3"
      >
        {isGeocoding ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <MapPin className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}