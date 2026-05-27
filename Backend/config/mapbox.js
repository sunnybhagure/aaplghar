import Map, { Marker, NavigationControl } from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useEffect } from 'react';


const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;

const PropertyMap = ({ area, city }) => {
  const [viewState, setViewState] = useState({
    latitude: 20.5937,
    longitude: 78.9629,
    zoom: 10
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoords = async () => {
      if (!area || !city) return;
      
      try {
        const query = encodeURIComponent(`${area}, ${city}, India`);
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${query}.json?access_token=${MAPBOX_TOKEN}`
        );
        const data = await response.json();
        
        if (data.features?.length > 0) {
          const [lng, lat] = data.features[0].center;
          setViewState({
            longitude: lng,
            latitude: lat,
            zoom: 14 
          });
        }
      } catch (err) {
        console.error("Mapbox Geocoding Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCoords();
  }, [area, city]);

  if (loading) return (
    <div className="h-80 w-full bg-slate-100 rounded-2xl flex items-center justify-center border border-dashed border-slate-300">
      <p className="text-[10px] font-black uppercase tracking-[2px] text-slate-400">Locating Property...</p>
    </div>
  );

  return (
    <div className="h-80 w-full rounded-2xl overflow-hidden border border-slate-200 shadow-inner relative">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
      >
        <NavigationControl position="top-right" />
        <Marker 
          longitude={viewState.longitude} 
          latitude={viewState.latitude} 
          anchor="bottom"
        >
          {/* Custom Red Pin Icon */}
          <div className="relative flex items-center justify-center">
             <div className="w-8 h-8 bg-rose-500 rounded-full opacity-20 animate-ping absolute"></div>
             <div className="w-4 h-4 bg-rose-600 rounded-full border-2 border-white shadow-lg"></div>
          </div>
        </Marker>
      </Map>
    </div>
  );
};

export default PropertyMap;