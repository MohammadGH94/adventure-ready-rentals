import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { geocodeAddress, autocompleteAddress, AutocompleteSuggestion } from "@/lib/geocoding";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface LocationInputProps {
  value: string;
  onChange: (address: string, coordinates?: { latitude: number; longitude: number }) => void;
  placeholder?: string;
  className?: string;
}

export function LocationInput({ value, onChange, placeholder = "Enter address", className }: LocationInputProps) {
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [suggestions, setSuggestions] = useState<AutocompleteSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const { toast } = useToast();
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!inputValue || inputValue.trim().length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setIsLoadingSuggestions(true);
    debounceTimerRef.current = setTimeout(async () => {
      const results = await autocompleteAddress(inputValue);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setIsLoadingSuggestions(false);
    }, 300);
  };

  const handleSelectSuggestion = (suggestion: AutocompleteSuggestion) => {
    onChange(suggestion.displayName, {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude
    });
    setShowSuggestions(false);
    setSuggestions([]);
  };

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
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Input
            value={value || ''}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={placeholder}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
          />
          {isLoadingSuggestions && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
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
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectSuggestion(suggestion)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-start gap-2"
            >
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <span className="flex-1">{suggestion.displayName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}