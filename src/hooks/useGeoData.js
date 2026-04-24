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

  // Load initial data from LocalStorage or FileHandle
  useEffect(() => {
    const init = async () => {
      try {
        // 1. Try to recover the file handle from IndexedDB
        if ('showOpenFilePicker' in window) {
          const savedHandle = await getHandle();
          if (savedHandle) {
            // Check if we still have permission
            const status = await savedHandle.queryPermission({ mode: 'readwrite' });
            if (status === 'granted') {
              setFileHandle(savedHandle);
              setOriginalFileName(savedHandle.name);
            }
          }
        }

        // 2. Load the actual data from LocalStorage
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          setGeoData(JSON.parse(saved));
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
    fileHandle,
    filteredData,
    setFilters,
    filters
  };
}
