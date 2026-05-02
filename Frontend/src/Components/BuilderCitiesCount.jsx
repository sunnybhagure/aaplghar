import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API from "../aap";

const BuilderCitiesCount = ({ builderId }) => {
  const [citiesCount, setCitiesCount] = useState(0);

  useEffect(() => {
    const fetchProperties = async () => {
  try {
    const res = await axios.get(`${API}/api/property/builder/${builderId}`);
    
    
    const actualData = res.data.data; 

    if (actualData && Array.isArray(actualData)) {
      
      const allCities = actualData.map(p => p.location?.city).filter(Boolean);
      const uniqueCities = [...new Set(allCities)];
      setCitiesCount(uniqueCities.length);
    }
  } catch (err) {
    console.error("City Count Fetch Error:", err);
  }
};
    if (builderId) fetchProperties();
  }, [builderId]);

  return <span>{citiesCount}</span>;
};

export default BuilderCitiesCount;