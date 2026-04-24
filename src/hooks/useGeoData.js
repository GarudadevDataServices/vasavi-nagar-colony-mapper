import { useState, useEffect, useCallback, useMemo } from 'react';

export function useGeoData() {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFid, setSelectedFid] = useState(null);
  const [filters, setFilters] = useState({ rules: [], logic: 'AND' });

  // Fetch data on mount
  useEffect(() => {
    fetch('/api/geodata')
      .then(res => res.json())
      .then(data => {
        console.log('[Data] GeoJSON loaded successfully:', data.features?.length, 'features');
        setGeoData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Fetch error:', err);
        setError('Failed to load map data');
        setLoading(false);
      });
  }, []);

  const selectedFeature = useMemo(() => {
    if (!geoData || !selectedFid) return null;
    return geoData.features.find(f => f.properties.fid === selectedFid);
  }, [geoData, selectedFid]);

  const updateFeature = useCallback((fid, properties) => {
    setGeoData(prev => {
      if (!prev) return prev;
      const newFeatures = prev.features.map(f => {
        if (f.properties.fid === fid) {
          return { ...f, properties: { ...f.properties, ...properties } };
        }
        return f;
      });
      return { ...prev, features: newFeatures };
    });
  }, []);

  const saveToServer = useCallback(async () => {
    try {
      const res = await fetch('/api/geodata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geoData),
      });
      return await res.json();
    } catch (err) {
      console.error('Save error:', err);
      throw err;
    }
  }, [geoData]);

  const exportFile = useCallback(() => {
    if (!geoData) return;
    const blob = new Blob([JSON.stringify(geoData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vasavi_nagar_colony_updated.geojson';
    a.click();
    URL.revokeObjectURL(url);
  }, [geoData]);

  const filteredData = useMemo(() => {
    if (!geoData || filters.rules.length === 0) return geoData;

    const newFeatures = geoData.features.filter(feature => {
      const results = filters.rules.map(rule => {
        const val = feature.properties[rule.field];
        const target = rule.value;

        switch (rule.operator) {
          case 'equals': return String(val) === String(target);
          case 'not_equals': return String(val) !== String(target);
          case 'contains': return String(val).toLowerCase().includes(String(target).toLowerCase());
          case 'is_empty': return !val || val === '';
          case 'is_not_empty': return !!val && val !== '';
          case 'gt': return Number(val) > Number(target);
          case 'lt': return Number(val) < Number(target);
          default: return true;
        }
      });

      if (filters.logic === 'AND') return results.every(r => r);
      return results.some(r => r);
    });

    return { ...geoData, features: newFeatures };
  }, [geoData, filters]);

  return {
    geoData,
    loading,
    error,
    selectedFid,
    setSelectedFid,
    selectedFeature,
    updateFeature,
    saveToServer,
    exportFile,
    filteredData,
    setFilters,
    filters
  };
}
