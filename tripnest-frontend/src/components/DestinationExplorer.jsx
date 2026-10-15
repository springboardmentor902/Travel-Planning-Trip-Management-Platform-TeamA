import { useState } from 'react';
import { searchByCategory,
         getStaticMapUrl } from '../utils/mapboxAPI';
import MapboxSearch from './MapboxSearch';

const CATEGORIES = [
    { type: 'tourist attraction', label: '🏛️ Attractions' },
    { type: 'restaurant',         label: '🍽️ Restaurants' },
    { type: 'hotel',              label: '🏨 Hotels'      },
    { type: 'museum',             label: '🏛️ Museums'     },
    { type: 'shopping',           label: '🛍️ Shopping'    },
    { type: 'park',               label: '🌳 Parks'       },
    { type: 'beach',              label: '🏖️ Beaches'     },
    { type: 'temple',             label: '🛕 Temples'     },
];

const DestinationExplorer = ({
    destination,
    onAddToItinerary,
}) => {
    const [results,       setResults]       = useState([]);
    const [loading,       setLoading]       = useState(false);
    const [activeCategory, setActiveCategory] = useState(null);
    const [selectedPlace, setSelectedPlace] = useState(null);
    const [error,         setError]         = useState('');
    const [searched,      setSearched]      = useState(false);

    const handleCategorySearch = async (category) => {
        setActiveCategory(category.type);
        setLoading(true);
        setError('');
        setResults([]);
        setSelectedPlace(null);

        try {
            const places = await searchByCategory(
                category.type, destination);
            setResults(places.slice(0, 12));
            setSearched(true);
        } catch {
            setError('Search failed. Check Mapbox token.');
        } finally {
            setLoading(false);
        }
    };

    const handlePlaceSearch = async (place) => {
        setSelectedPlace(place);
    };

    return (
        <div className="bg-white border border-slate-200
                        rounded-2xl p-5">

            <h3 className="font-semibold text-slate-800 mb-1">
                🔍 Explore {destination}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
                Search places to add to your itinerary
            </p>

            {/* Custom Search */}
            <div className="mb-4">
                <MapboxSearch
                    placeholder={`Search in ${destination}...`}
                    onPlaceSelect={handlePlaceSearch}
                />
            </div>

            {/* Category Buttons */}
            <div className="flex flex-wrap gap-2 mb-5">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.type}
                        onClick={() =>
                            handleCategorySearch(cat)}
                        disabled={loading}
                        className={`px-3 py-1.5 rounded-full
                            text-xs font-semibold transition
                            disabled:opacity-50
                            ${activeCategory === cat.type
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600'}`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Loading */}
            {loading && (
                <div className="text-center py-8">
                    <div className="w-8 h-8 border-2
                        border-blue-600 border-t-transparent
                        rounded-full animate-spin mx-auto
                        mb-2" />
                    <p className="text-sm text-slate-400">
                        Searching places...
                    </p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 text-red-600
                                rounded-xl p-3 text-sm mb-4">
                    {error}
                </div>
            )}

            {/* Selected Place Detail */}
            {selectedPlace && (
                <div className="bg-blue-50 border border-blue-200
                                rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">

                        {/* Map Thumbnail */}
                        {selectedPlace.lat && (
                            <img
                                src={getStaticMapUrl(
                                    selectedPlace.lat,
                                    selectedPlace.lng,
                                    14, 120, 80)}
                                alt="map"
                                className="w-24 h-16 rounded-lg
                                           object-cover shrink-0"
                            />
                        )}

                        <div className="flex-1 min-w-0">
                            <p className="font-semibold
                                          text-slate-800 text-sm">
                                {selectedPlace.name}
                            </p>
                            <p className="text-xs text-slate-500
                                          mt-0.5 line-clamp-2">
                                📍 {selectedPlace.address}
                            </p>
                            {selectedPlace.category && (
                                <span className="text-[10px]
                                    bg-blue-100 text-blue-700
                                    px-2 py-0.5 rounded-full
                                    mt-1 inline-block">
                                    {selectedPlace.category}
                                </span>
                            )}
                        </div>
                    </div>

                    {onAddToItinerary && (
                        <button
                            onClick={() => {
                                onAddToItinerary(selectedPlace);
                                setSelectedPlace(null);
                            }}
                            className="mt-3 w-full bg-blue-600
                                text-white text-sm py-2
                                rounded-xl hover:bg-blue-700
                                transition font-medium"
                        >
                            + Add to Itinerary
                        </button>
                    )}
                </div>
            )}

            {/* Results Grid */}
            {!loading && results.length > 0 && (
                <>
                    <p className="text-xs text-slate-400 mb-3">
                        {results.length} places found
                    </p>
                    <div className="grid grid-cols-2
                                    sm:grid-cols-3 gap-3">
                        {results.map((place, idx) => (
                            <div
                                key={place.placeId || idx}
                                onClick={() =>
                                    setSelectedPlace(place)}
                                className="bg-slate-50 rounded-xl
                                    overflow-hidden cursor-pointer
                                    hover:shadow-md transition
                                    border border-transparent
                                    hover:border-blue-200"
                            >
                                {/* Map Thumbnail */}
                                {place.lat && (
                                    <img
                                        src={getStaticMapUrl(
                                            place.lat,
                                            place.lng,
                                            13, 300, 100)}
                                        alt={place.name}
                                        className="w-full h-20
                                                   object-cover"
                                        onError={e => {
                                            e.target.style
                                                .display = 'none';
                                        }}
                                    />
                                )}

                                <div className="p-2">
                                    <p className="text-xs
                                        font-semibold text-slate-800
                                        line-clamp-1">
                                        {place.name}
                                    </p>
                                    <p className="text-[10px]
                                        text-slate-400 mt-0.5
                                        line-clamp-1">
                                        {place.address
                                            ?.split(',')[0]}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Empty */}
            {!loading && searched
                    && results.length === 0 && (
                <div className="text-center py-6
                                text-slate-400">
                    <p className="text-sm">
                        No places found.
                        Try another category.
                    </p>
                </div>
            )}
        </div>
    );
};

export default DestinationExplorer;