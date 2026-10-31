import { useState, useEffect, useCallback, useMemo } from 'react';

// Simple IndexedDB helper to persist the File System Handle
const dbPromise = new Promise((resolve) => {
  const request = indexedDB.open('VasaviMapperDB', 1);
  request.onupgradeneeded = () => {
    if (!request.result.objectStoreNames.contains('handles')) {
      request.result.createObjectStore('handles');
    }
  };
  request.onsuccess = () => resolve(request.result);
});

const saveHandle = async (handle) => {
  const db = await dbPromise;
  const tx = db.transaction('handles', 'readwrite');
  tx.objectStore('handles').put(handle, 'last_file');
};

const getHandle = async () => {
  const db = await dbPromise;
  return new Promise((resolve) => {
    const req = db.transaction('handles').objectStore('handles').get('last_file');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
  });
};

const STORAGE_KEY = 'vasavi_mapper_data';

export function useGeoData() {
  const [geoData, setGeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFid, setSelectedFid] = useState(null);
  const [fileHandle, setFileHandle] = useState(null);
  const [originalFileName, setOriginalFileName] = useState('vasavi_map.geojson');

  // Filters state
  const [filters, setFilters] = useState({
    logic: 'AND',
    rules: []
  });

  // Load initial data from LocalStorage, FileHandle, or default vasavi_map.geojson
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Try to recover the file handle from IndexedDB
        if ('showOpenFilePicker' in window) {
          const savedHandle = await getHandle();
          if (savedHandle) {
            const status = await savedHandle.queryPermission({ mode: 'readwrite' });
            if (status === 'granted') {
              setFileHandle(savedHandle);
              setOriginalFileName(savedHandle.name);
            }
          }
        }

        // 2. Load the actual data from LocalStorage or default to vasavi_map.geojson
        const saved = localStorage.getItem(STORAGE_KEY);
        const dataVersion = localStorage.getItem('vasavi_data_version');
        
        let loadedFromStorage = false;
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            const hasRichData = parsed.features?.some(f => f.properties?.mortgage_amount || f.properties?.ec_timeline);
            if (hasRichData && dataVersion === 'v2_mortgage_ec') {
              setGeoData(parsed);
              loadedFromStorage = true;
            }
          } catch (e) {
            console.error('Error parsing stored geo data:', e);
          }
        }

        if (!loadedFromStorage) {
          try {
            const res = await fetch('./vasavi_map.geojson');
            if (res.ok) {
              const data = await res.json();
              if (data && data.type === 'FeatureCollection') {
                setGeoData(data);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
                localStorage.setItem('vasavi_data_version', 'v2_mortgage_ec');
                setOriginalFileName('vasavi_map.geojson');
              }
            } else if (saved) {
              setGeoData(JSON.parse(saved));
            }
          } catch (fetchErr) {
            console.warn('Could not load vasavi_map.geojson via fetch:', fetchErr);
            if (saved) setGeoData(JSON.parse(saved));
          }
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // Persistence: Save to LocalStorage whenever geoData changes
  useEffect(() => {
    if (geoData) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(geoData));
    }
  }, [geoData]);

  const loadFromFile = useCallback(async (fileOrHandle) => {
    setLoading(true);
    try {
      let file;
      let handle = null;

      if (fileOrHandle.getFile) {
        // It's a FileSystemFileHandle
        handle = fileOrHandle;
        file = await handle.getFile();
        setFileHandle(handle);
        setOriginalFileName(handle.name);
        await saveHandle(handle);
      } else {
        // It's a regular File object (from <input type="file">)
        file = fileOrHandle;
        setFileHandle(null); // Clear handle if manually imported via input
        setOriginalFileName(file.name);
      }

      const text = await file.text();
      const json = JSON.parse(text);
      
      if (json.type !== 'FeatureCollection') {
        throw new Error('Invalid GeoJSON: Must be a FeatureCollection');
      }

      setGeoData(json);
      setError(null);
      setSelectedFid(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveFile = useCallback(async () => {
    if (!geoData) return;

    try {
      // If we have a handle and permission, try direct save
      if (fileHandle) {
        let status = await fileHandle.queryPermission({ mode: 'readwrite' });
        if (status !== 'granted') {
          status = await fileHandle.requestPermission({ mode: 'readwrite' });
        }

        if (status === 'granted') {
          const writable = await fileHandle.createWritable();
          await writable.write(JSON.stringify(geoData, null, 2));
          await writable.close();
          alert('Saved directly to file!');
          return;
        }
      }

      // Fallback: Standard Export (Download)
      const blob = new Blob([JSON.stringify(geoData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = originalFileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Save failed:', err);
      alert('Save failed. Try exporting instead.');
    }
  }, [geoData, fileHandle, originalFileName]);

  const resetToDefault = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('./vasavi_map.geojson');
      if (res.ok) {
        const data = await res.json();
        setGeoData(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        localStorage.setItem('vasavi_data_version', 'v2_mortgage_ec');
        setOriginalFileName('vasavi_map.geojson');
        setSelectedFid(null);
        setFileHandle(null);
        alert('Map data reloaded successfully from vasavi_map.geojson!');
      } else {
        alert('Could not reload vasavi_map.geojson (HTTP ' + res.status + ')');
      }
    } catch (err) {
      console.error('Reset error:', err);
      alert('Failed to reload default map.');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateFeature = useCallback((fid, newProps) => {
    setGeoData(prev => {
      if (!prev) return null;
      const newFeatures = prev.features.map(f => {
        if (f.properties.fid === fid) {
          return { ...f, properties: { ...f.properties, ...newProps } };
        }
        return f;
      });
      return { ...prev, features: newFeatures };
    });
  }, []);

  const selectedFeature = useMemo(() => {
    if (!geoData || !selectedFid) return null;
    return geoData.features.find(f => f.properties.fid === selectedFid);
  }, [geoData, selectedFid]);

  const filteredData = useMemo(() => {
    if (!geoData) return null;
    if (filters.rules.length === 0) return geoData;

    const filteredFeatures = geoData.features.filter(feature => {
      const results = filters.rules.map(rule => {
        const val = feature.properties[rule.field];
        const target = rule.value;

        switch (rule.operator) {
          case 'equals': 
            if (typeof val === 'boolean') return String(val).toLowerCase() === String(target).toLowerCase();
            return String(val || '').toLowerCase() === String(target || '').toLowerCase();
          case 'not_equals': 
            return String(val || '').toLowerCase() !== String(target || '').toLowerCase();
          case 'contains': 
            return String(val || '').toLowerCase().includes(String(target || '').toLowerCase());
          case 'is_empty': 
            return val === null || val === undefined || val === '';
          case 'is_not_empty': 
            return val !== null && val !== undefined && val !== '';
          case 'gt': 
            return Number(val || 0) > Number(target || 0);
          case 'lt': 
            return Number(val || 0) < Number(target || 0);
          default: return true;
        }
      });

      if (filters.logic === 'AND') return results.every(r => r);
      return results.some(r => r);
    });

    return { ...geoData, features: filteredFeatures };
  }, [geoData, filters]);

  return {
    geoData,
    loading,
    error,
    selectedFid,
    setSelectedFid,
    selectedFeature,
    updateFeature,
    loadFromFile,
    saveFile,
    resetToDefault,
    fileHandle,
    filteredData,
    setFilters,
    filters
  };
}
