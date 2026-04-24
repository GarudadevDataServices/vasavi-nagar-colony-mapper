import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import PropertyForm from './PropertyForm';
import { X } from 'lucide-react';

const MapView = ({ data, selectedFid, onPlotClick, baseLayer, updateFeature, selectedFeature }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popupRef = useRef(null);
  const [popupContainer, setPopupContainer] = useState(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    console.log('[Map] Init...');
    
    try {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap'
            },
            'satellite': {
              type: 'raster',
              tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
              tileSize: 256,
              attribution: 'Esri'
            }
          },
          layers: [
            {
              id: 'osm-layer',
              type: 'raster',
              source: 'osm',
              layout: { visibility: baseLayer === 'osm' ? 'visible' : 'none' }
            },
            {
              id: 'satellite-layer',
              type: 'raster',
              source: 'satellite',
              layout: { visibility: baseLayer === 'satellite' ? 'visible' : 'none' }
            }
          ]
        },
        center: [80.3294, 15.8048],
        zoom: 17,
        bearing: -40,
        pitch: 0,
        antialias: true
      });

      map.current.addControl(new maplibregl.NavigationControl(), 'top-left');

      map.current.on('load', () => {
        console.log('[Map] Load');
        
        map.current.addSource('plots', {
          type: 'geojson',
          data: data || { type: 'FeatureCollection', features: [] }
        });

        map.current.addLayer({
          id: 'plots-fill',
          type: 'fill',
          source: 'plots',
          paint: {
            'fill-color': [
              'case',
              ['==', ['get', 'land_status'], 'Empty Plot'], '#22c55e',
              ['==', ['get', 'land_status'], 'House'], '#3b82f6',
              ['==', ['get', 'land_status'], 'Commercial'], '#f59e0b',
              '#94a3b8'
            ],
            'fill-opacity': 0.6
          }
        });

        map.current.addLayer({
          id: 'plots-border',
          type: 'line',
          source: 'plots',
          paint: { 'line-color': '#ffffff', 'line-width': 1.5 }
        });

        map.current.addLayer({
          id: 'plots-highlight',
          type: 'line',
          source: 'plots',
          paint: { 'line-color': '#ffeb3b', 'line-width': 4 },
          filter: ['==', ['get', 'fid'], -1]
        });

        map.current.on('click', 'plots-fill', (e) => {
          const fid = e.features[0].properties.fid;
          const coords = e.lngLat;
          
          onPlotClick(fid);

          if (popupRef.current) popupRef.current.remove();

          const el = document.createElement('div');
          // Use a very specific class to avoid any layout issues
          el.style.width = '380px';
          el.style.maxWidth = '90vw';
          setPopupContainer(el);

          popupRef.current = new maplibregl.Popup({ 
            closeButton: false, 
            maxWidth: 'none',
            anchor: 'bottom',
            offset: [0, -15]
          })
            .setLngLat(coords)
            .setDOMContent(el)
            .addTo(map.current);
            
          popupRef.current.on('close', () => {
            onPlotClick(null);
            setPopupContainer(null);
          });
          
          // Move map so the click is in the bottom center, giving room for popup above
          map.current.flyTo({
            center: coords,
            zoom: 18,
            padding: { top: 200 } 
          });
        });

        map.current.on('mouseenter', 'plots-fill', () => { map.current.getCanvas().style.cursor = 'pointer'; });
        map.current.on('mouseleave', 'plots-fill', () => { map.current.getCanvas().style.cursor = ''; });
      });

    } catch (err) {
      console.error('[Map] Init error:', err);
    }

    return () => { if (map.current) map.current.remove(); };
  }, []);

  // Toggle base layer
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    try {
      map.current.setLayoutProperty('osm-layer', 'visibility', baseLayer === 'osm' ? 'visible' : 'none');
      map.current.setLayoutProperty('satellite-layer', 'visibility', baseLayer === 'satellite' ? 'visible' : 'none');
    } catch (e) {}
  }, [baseLayer]);

  // Sync data
  useEffect(() => {
    if (map.current && map.current.getSource('plots') && data) {
      map.current.getSource('plots').setData(data);
    }
  }, [data]);

  // Sync highlight
  useEffect(() => {
    if (map.current && map.current.getLayer('plots-highlight')) {
      map.current.setFilter('plots-highlight', ['==', ['get', 'fid'], selectedFid || -1]);
    }
    if (!selectedFid && popupRef.current) popupRef.current.remove();
  }, [selectedFid]);

  return (
    <div ref={mapContainer} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, background: '#f0f0f0' }}>
      {popupContainer && createPortal(
        <div className="modern-card animate-fade-in" style={{ width: '380px', maxWidth: '90vw' }}>
          <div className="modern-card-header">
            <button onClick={() => popupRef.current?.remove()} className="modern-close-btn">
              <X size={20} />
            </button>
          </div>
          <div className="modern-card-content custom-scrollbar">
            <PropertyForm feature={selectedFeature} onUpdate={updateFeature} />
          </div>
        </div>,
        popupContainer
      )}
    </div>
  );
};

export default MapView;
