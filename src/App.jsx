import React, { useState } from 'react';
import { 
  Map as MapIcon, 
  Layers, 
  Filter, 
  FileUp,
  Save,
  X,
  Upload,
  Info
} from 'lucide-react';
import MapView from './components/MapView';
import Modal from './components/Modal';
import PropertyForm from './components/PropertyForm';
import { useGeoData } from './hooks/useGeoData';

function App() {
  const {
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
  } = useGeoData();

  const [baseLayer, setBaseLayer] = useState('osm'); 
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handlePlotClick = (fid) => {
    setSelectedFid(fid);
    setShowForm(true);
  };

  const handleFileImport = async (e) => {
    // 1. Try modern File System Access API first
    if ('showOpenFilePicker' in window) {
      try {
        const [handle] = await window.showOpenFilePicker({
          types: [{
            description: 'GeoJSON Files',
            accept: { 'application/json': ['.geojson', '.json'] },
          }],
        });
        if (handle) await loadFromFile(handle);
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('File picker failed:', err);
      }
    }

    // 2. Fallback to standard input
    const file = e.target.files[0];
    if (file) loadFromFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);

    const items = e.dataTransfer.items;
    if (items && items[0].getAsFileSystemHandle) {
      const handle = await items[0].getAsFileSystemHandle();
      if (handle.kind === 'file') {
        await loadFromFile(handle);
        return;
      }
    }

    const file = e.dataTransfer.files[0];
    if (file && (file.name.endsWith('.geojson') || file.name.endsWith('.json'))) {
      loadFromFile(file);
    } else {
      alert('Please drop a valid GeoJSON file.');
    }
  };

  if (loading) return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid #3b82f6', borderTopColor: 'transparent', borderRadius: '50%', margin: '0 auto 16px' }}></div>
        <p style={{ fontWeight: 'bold', color: '#666' }}>Loading Vasavi Nagar Map...</p>
      </div>
    </div>
  );

  return (
    <div 
      className="app-container"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <header className="app-header flex items-center justify-between px-6 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3">
          <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '12px', color: '#3b82f6' }}>
            <MapIcon size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 900, letterSpacing: '-0.02em' }}>VASAVI NAGAR</h1>
            <span style={{ fontSize: '10px', fontWeight: 900, color: '#999', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Colony Mapper</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Form Toggle (if plot selected) */}
          {selectedFid && (
            <button 
              onClick={() => setShowForm(true)}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                background: '#eff6ff',
                color: '#3b82f6',
                fontWeight: 'bold',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <Info size={18} />
              Plot #{selectedFid}
            </button>
          )}

          <button 
            onClick={() => setShowFilters(!showFilters)} 
            disabled={!geoData}
            style={{ 
              padding: '10px', 
              borderRadius: '12px', 
              background: showFilters ? '#3b82f6' : '#f3f4f6',
              color: showFilters ? 'white' : '#666',
              border: 'none',
              cursor: 'pointer',
              opacity: !geoData ? 0.3 : 1
            }}
            title="Filter Plots"
          >
            <Filter size={20} />
          </button>

          <label 
            onClick={handleFileImport}
            style={{ 
              padding: '10px 20px', 
              borderRadius: '100px', 
              background: '#f3f4f6', 
              color: '#666', 
              fontWeight: 'bold', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FileUp size={18} />
            Import
            <input type="file" accept=".geojson,application/json" onChange={handleFileImport} style={{ display: 'none' }} />
          </label>

          <button 
            onClick={saveFile} 
            disabled={!geoData}
            style={{
              padding: '10px 20px',
              borderRadius: '100px',
              background: '#3b82f6',
              color: 'white',
              fontWeight: 'bold',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: !geoData ? 0.5 : 1
            }}
          >
            <Save size={18} />
            {fileHandle ? 'Save' : 'Export'}
          </button>
        </div>
      </header>

      <main className="app-main">
        {geoData ? (
          <>
            <MapView 
              data={filteredData} 
              selectedFid={selectedFid}
              onPlotClick={handlePlotClick}
              baseLayer={baseLayer}
              updateFeature={updateFeature}
              selectedFeature={selectedFeature}
            />

            {/* Floating Toggle */}
            <div style={{ position: 'absolute', top: '24px', right: '24px', zIndex: 10 }}>
              <button 
                onClick={() => setBaseLayer(baseLayer === 'osm' ? 'satellite' : 'osm')}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  padding: '12px 20px', 
                  background: 'rgba(255,255,255,0.9)', 
                  backdropFilter: 'blur(8px)',
                  border: '1px solid #eee',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  cursor: 'pointer'
                }}
              >
                <Layers size={16} />
                {baseLayer === 'osm' ? 'Satellite View' : 'Map View'}
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full bg-gray-50 px-6 text-center">
            <div style={{ background: 'white', padding: '48px', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' }}>
              <div style={{ width: '80px', height: '80px', background: '#eff6ff', color: '#3b82f6', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                <Upload size={40} />
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: 900, marginBottom: '12px', letterSpacing: '-0.02em' }}>Welcome Mapper</h2>
              <p style={{ color: '#666', fontSize: '14px', lineHeight: 1.6, marginBottom: '32px' }}>
                To start, drag and drop your <b>GeoJSON</b> file anywhere or use the import button above.
              </p>
              
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', display: 'flex', gap: '12px', alignItems: 'flex-start', textAlign: 'left' }}>
                <Info size={18} style={{ color: '#94a3b8', marginTop: '2px', flexShrink: 0 }} />
                <p style={{ fontSize: '12px', color: '#64748b' }}>
                  Your data stays in your browser. No files are uploaded to any server.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Filters Overlay */}
        {showFilters && geoData && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid #eee', padding: '24px', zIndex: 30, boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
             <div className="flex items-center justify-between" style={{ marginBottom: '16px' }}>
              <h3 style={{ fontSize: '12px', fontWeight: 900, color: '#999', textTransform: 'uppercase' }}>Filter Plots</h3>
              <div className="flex gap-1" style={{ background: '#eee', padding: '4px', borderRadius: '8px' }}>
                {['AND', 'OR'].map(l => (
                  <button 
                    key={l}
                    onClick={() => setFilters({ ...filters, logic: l })}
                    style={{ 
                      padding: '4px 12px', 
                      borderRadius: '6px', 
                      fontSize: '10px', 
                      fontWeight: 'bold',
                      background: filters.logic === l ? 'white' : 'transparent',
                      border: 'none',
                      boxShadow: filters.logic === l ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                      color: filters.logic === l ? '#3b82f6' : '#999',
                      cursor: 'pointer'
                    }}
                  >{l}</button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {filters.rules.map((rule, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f9fafb', border: '1px solid #eee', padding: '8px 12px', borderRadius: '12px' }}>
                  <select 
                    value={rule.field} 
                    onChange={(e) => {
                      const nr = [...filters.rules]; nr[idx].field = e.target.value; setFilters({...filters, rules: nr});
                    }}
                    style={{ background: 'transparent', border: 'none', fontWeight: 'bold', fontSize: '12px' }}
                  >
                    <option value="owner_name">Owner</option>
                    <option value="land_status">Status</option>
                    <option value="house_condition">Condition</option>
                  </select>
                  <input 
                    type="text" 
                    value={rule.value} 
                    onChange={(e) => {
                      const nr = [...filters.rules]; nr[idx].value = e.target.value; setFilters({...filters, rules: nr});
                    }}
                    style={{ width: '100px', border: '1px solid #ddd', borderRadius: '4px', padding: '2px 6px', fontSize: '12px' }}
                    placeholder="..."
                  />
                  <button 
                    onClick={() => setFilters({...filters, rules: filters.rules.filter((_,i) => i !== idx)})}
                    style={{ background: 'none', border: 'none', color: '#ff4d4d', cursor: 'pointer' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button 
                onClick={() => setFilters({...filters, rules: [...filters.rules, {field:'owner_name', operator:'contains', value:''}]})}
                style={{ padding: '8px 16px', border: '2px dashed #ccc', borderRadius: '12px', color: '#999', fontSize: '12px', fontWeight: 'bold', background: 'none', cursor: 'pointer' }}
              >
                + Add Rule
              </button>
            </div>
          </div>
        )}
      </main>

      <Modal 
        isOpen={showForm} 
        onClose={() => setShowForm(false)}
      >
        <PropertyForm 
          feature={selectedFeature} 
          onUpdate={updateFeature} 
        />
      </Modal>

      {/* Drag Overlay */}
      {isDragging && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 2000, 
          background: 'rgba(59, 130, 246, 0.1)', 
          backdropFilter: 'blur(4px)',
          border: '4px dashed #3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <div style={{ background: 'white', padding: '24px 48px', borderRadius: '100px', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Upload className="animate-bounce" style={{ color: '#3b82f6' }} />
            <span style={{ fontWeight: 900, color: '#3b82f6' }}>Drop GeoJSON to Load</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
