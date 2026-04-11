import { Map, Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useEffect } from 'react';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const PropertyMap = ({ area, city }) => {
  const [viewState, setViewState] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    zoom: 12 // Default zoom thoda jast thevla aahe
  });
  
  const [markerCoords, setMarkerCoords] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getCoordinates = async () => {
      // Area aani City donhi vaprun search query banavli
      const cleanArea = area.trim(); 
        const cleanCity = city.trim();
        const searchQuery = encodeURIComponent(`${cleanArea}, ${cleanCity}, India`);
      
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${searchQuery}.json?access_token=${MAPBOX_TOKEN}&limit=1`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          
          // 1. Map cha view tithe shift kara
          setViewState({
            latitude: lat,
            longitude: lng,
            zoom: 15 // Exact location sathi 15 zoom best aahe
          });

          // 2. Marker che coordinates set kara
          setMarkerCoords({ latitude: lat, longitude: lng });
        }
      } catch (error) {
        console.error("Location sapdat nahiye:", error);
      } finally {
        setLoading(false);
      }
    };

    if (area && city) {
      getCoordinates();
    }
  }, [area, city]);

  if (loading) return (
    <div className="h-80 w-full bg-slate-100 rounded-2xl flex items-center justify-center border border-dashed border-slate-300">
      <p className="text-sm font-bold text-slate-400 animate-pulse">LOCATION SHOODHAT AAHE...</p>
    </div>
  );

  return (
    <div className="h-[450px] w-full rounded-2xl overflow-hidden border-2 border-white shadow-xl relative">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />

        {/* FIX MARKER LOGIC */}
        {markerCoords && (
          <Marker 
            longitude={markerCoords.longitude} 
            latitude={markerCoords.latitude} 
            anchor="bottom"
          >
            {/* Custom Marker UI */}
            <div className="flex flex-col items-center">
              {/* Marker chya aatla label */}
                    <div className="px-3 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-full mb-1 shadow-lg uppercase">
                    {area.split(',')[0]} {/* 'Sector 15, Near Park' madhla fakt 'Sector 15' dakhavel */}
                    </div>
                <div className="relative flex items-center justify-center">
                <div className="w-8 h-8 bg-rose-500 rounded-full opacity-30 animate-ping absolute"></div>
                <div className="w-5 h-5 bg-rose-600 rounded-full border-2 border-white shadow-md"></div>
              </div>
            </div>
          </Marker>
        )}
      </Map>
    </div>
  );
};

export default PropertyMap;