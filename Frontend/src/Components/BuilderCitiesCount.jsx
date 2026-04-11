import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BuilderCitiesCount = ({ builderId }) => {
  const [citiesCount, setCitiesCount] = useState(0);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/property/builder/${builderId}`);
        if (res.data.data) {
          const properties = res.data.data;
          const allCities = properties.map(p => p.location?.city || p.city).filter(Boolean);
          const uniqueCities = [...new Set(allCities)];
          setCitiesCount(uniqueCities.length);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (builderId) fetchProperties();
  }, [builderId]);

  return <span>{citiesCount}</span>;
};

export default BuilderCitiesCount;