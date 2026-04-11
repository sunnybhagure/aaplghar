import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BuilderProjectCount = ({ builderId }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchProjectCount = async () => {
      if (!builderId) return;
      try {
        // dynamic builderId pass kara (:id nahi)
        const res = await axios.get(`http://localhost:5000/api/admin/builder-details/${builderId}`);
        
        // Tujhya controller nusar data 'res.data.data.stats.totalProjects' madhe aahe
        if (res.data.success && res.data.data.stats) {
          setCount(res.data.data.stats.totalProjects);
        } else {
          setCount(0);
        }
      } catch (err) {
        console.error("Error fetching project count:", err);
        setCount(0);
      }
    };

    fetchProjectCount();
  }, [builderId]);

  return <span>{count}</span>;
};

export default BuilderProjectCount;