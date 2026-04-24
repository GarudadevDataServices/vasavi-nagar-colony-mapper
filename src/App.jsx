import React, { useState } from 'react';
import { 
  Map as MapIcon, 
  Layers, 
  Filter, 
  Save, 
  X
} from 'lucide-react';
import MapView from './components/MapView';
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
    saveToServer,
    filteredData,
    setFilters,
    filters
  } = useGeoData();

  const [baseLayer, setBaseLayer] = useState('osm'); 
  const [showFilters, setShowFilters] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveToServer();
      alert('Saved successfully!');
    } catch (err) {
      alert('Error saving data');
    } finally {
      setIsSaving(false);
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
    <div className="app-container">
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
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            style={{ 
              padding: '10px', 
              borderRadius: '12px', 
              background: showFilters ? '#3b82f6' : '#f3f4f6',
              color: showFilters ? 'white' : '#666',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <Filter size={20} />
          </button>
          <button 
            onClick={handleSave} 
            disabled={isSaving} 
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
              opacity: isSaving ? 0.5 : 1
            }}
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <MapView 
          data={filteredData} 
          selectedFid={selectedFid}
          onPlotClick={setSelectedFid}
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

        {/* Filters Overlay */}
        {showFilters && (
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
    </div>
  );
}

export default App;
