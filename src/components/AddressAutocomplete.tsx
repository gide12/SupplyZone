import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin } from 'lucide-react';

interface NominatimResult {
  lat: string;
  lon: string;
  display_name: string;
  place_id: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
  lang?: string;
  placeholder?: string;
  required?: boolean;
}

export function AddressAutocomplete({ value, onChange, lang = "en", placeholder = "Cari Alamat...", required = false }: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchAddress = async (searchText: string) => {
    if (!searchText || searchText.length < 3) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}`);
      const data = await res.json();
      setResults(data);
      setIsOpen(true);
    } catch (err) {
      console.error("Geocoding fetch error:", err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelect = (item: NominatimResult) => {
    setQuery(item.display_name);
    setIsOpen(false);
    onChange(item.display_name, parseFloat(item.lat), parseFloat(item.lon));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      searchAddress(query);
    }
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative flex items-start w-full">
        <textarea
           value={query}
           onChange={(e) => {
              setQuery(e.target.value);
              onChange(e.target.value); 
           }}
           onKeyDown={handleKeyDown}
           className="w-full p-3 pr-14 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#00AA13] focus:ring-1 focus:ring-[#00AA13] outline-none transition-all game-text text-lg"
           required={required}
           rows={2}
           placeholder={placeholder}
        />
        <button 
          type="button"
          onClick={() => searchAddress(query)}
          className="absolute right-2 top-2 p-2 bg-[#00AA13] text-white rounded-lg hover:bg-[#00880f] transition-colors flex items-center justify-center cursor-pointer shadow-sm"
          title="Search Location on Map"
        >
          {isSearching ? <div className="w-5 h-5 border-2 border-white rounded-full border-t-transparent animate-spin"/> : <Search className="w-5 h-5" />}
        </button>
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto custom-scrollbar">
          {results.map((result) => (
            <div 
              key={result.place_id}
              onClick={() => handleSelect(result)}
              className="p-3 hover:bg-[#00AA13] hover:text-white cursor-pointer border-b border-gray-100 flex items-start gap-3 transition-colors group"
            >
              <MapPin className="w-5 h-5 text-gray-400 group-hover:text-white mt-0.5 shrink-0" />
              <p className="text-sm game-text text-gray-700 group-hover:text-white">{result.display_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
