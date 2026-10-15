import { useState, useRef, useEffect } from 'react';
import { searchPlaces } from '../utils/mapboxAPI';

const MapboxSearch = ({
    onPlaceSelect,
    placeholder = 'Search places...',
    className   = '',
    proximity   = null,
}) => {
    const [query,       setQuery]       = useState('');
    const [results,     setResults]     = useState([]);
    const [loading,     setLoading]     = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const debounceRef   = useRef(null);
    const wrapperRef    = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (wrapperRef.current
                    && !wrapperRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        return () =>
            document.removeEventListener(
                'mousedown', handleClick);
    }, []);

    const handleInput = (e) => {
        const val = e.target.value;
        setQuery(val);

        if (debounceRef.current) {
            clearTimeout(debounceRef.current);
        }

        if (val.length < 2) {
            setResults([]);
            setShowDropdown(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const places = await searchPlaces(
                    val, proximity);
                setResults(places);
                setShowDropdown(true);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 400);
    };

    const handleSelect = (place) => {
        setQuery(place.name);
        setShowDropdown(false);
        setResults([]);
        onPlaceSelect(place);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <div className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={handleInput}
                    placeholder={placeholder}
                    className={`w-full border border-slate-200
                        rounded-xl px-4 py-2.5 text-sm
                        focus:outline-none focus:ring-2
                        focus:ring-blue-500 pr-10
                        ${className}`}
                />
                <span className="absolute right-3 top-2.5
                                 text-slate-400">
                    {loading ? (
                        <span className="inline-block w-4 h-4
                            border-2 border-slate-300
                            border-t-blue-500 rounded-full
                            animate-spin" />
                    ) : '📍'}
                </span>
            </div>

            {/* Dropdown */}
            {showDropdown && results.length > 0 && (
                <div className="absolute top-full left-0 right-0
                                mt-1 bg-white border border-slate-200
                                rounded-xl shadow-xl z-50
                                overflow-hidden">
                    {results.map((place, idx) => (
                        <button
                            key={place.placeId || idx}
                            onClick={() => handleSelect(place)}
                            className="w-full text-left px-4 py-3
                                border-b border-slate-50 last:border-0
                                hover:bg-blue-50 transition"
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-lg mt-0.5
                                                 shrink-0">
                                    📍
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium
                                                  text-slate-800
                                                  truncate">
                                        {place.name}
                                    </p>
                                    <p className="text-xs
                                                  text-slate-400
                                                  truncate mt-0.5">
                                        {place.address}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}

                    {/* Mapbox Attribution */}
                    <div className="px-4 py-2 bg-slate-50
                                    border-t border-slate-100">
                        <p className="text-[10px] text-slate-400
                                      text-right">
                            Powered by Mapbox
                        </p>
                    </div>
                </div>
            )}

            {/* No results */}
            {showDropdown && !loading
                    && results.length === 0
                    && query.length >= 2 && (
                <div className="absolute top-full left-0 right-0
                                mt-1 bg-white border border-slate-200
                                rounded-xl shadow-xl z-50 p-4
                                text-center">
                    <p className="text-sm text-slate-400">
                        No places found for "{query}"
                    </p>
                </div>
            )}
        </div>
    );
};

export default MapboxSearch;