import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MapView = ({ data, selectedFid, onPlotClick, baseLayer, showMortgageBorders = true }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const popup = useRef(null);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (map.current) return;

    try {
      popup.current = new maplibregl.Popup({
        closeButton: false,
        closeOnClick: false,
        offset: 12,
        className: 'map-plot-hover-popup'
      });

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
        map.current.addSource('plots', {
          type: 'geojson',
          data: data || { type: 'FeatureCollection', features: [] }
        });

        // 1. Fill layer by land_status
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

        // 2. White boundary line
        map.current.addLayer({
          id: 'plots-border',
          type: 'line',
          source: 'plots',
          paint: { 'line-color': '#ffffff', 'line-width': 1.5 }
        });

        // 3. Mortgaged plots indicator line (red/orange dashed boundary)
        map.current.addLayer({
          id: 'plots-mortgaged',
          type: 'line',
          source: 'plots',
          layout: {
            visibility: showMortgageBorders ? 'visible' : 'none'
          },
          paint: {
            'line-color': '#e11d48',
            'line-width': 2.5,
            'line-dasharray': [2, 2]
          },
          filter: [
            'any',
            ['==', ['get', 'is_mortgaged'], true],
            ['==', ['get', 'is_mortgaged'], 'true']
          ]
        });

        // 4. Yellow highlight line for currently selected plot
        map.current.addLayer({
          id: 'plots-highlight',
          type: 'line',
          source: 'plots',
          paint: { 'line-color': '#ffeb3b', 'line-width': 4 },
          filter: ['==', ['get', 'fid'], -1]
        });

        // Click handler
        map.current.on('click', 'plots-fill', (e) => {
          if (popup.current) popup.current.remove();
          const fid = e.features[0].properties.fid;
          const coords = e.lngLat;
          
          onPlotClick(fid);

          map.current.flyTo({
            center: coords,
            zoom: 18
          });
        });

        // Hover handlers & tooltip
        map.current.on('mousemove', 'plots-fill', (e) => {
          if (e.features && e.features.length > 0) {
            map.current.getCanvas().style.cursor = 'pointer';
            const p = e.features[0].properties;
            const isMortgaged = p.is_mortgaged === true || p.is_mortgaged === 'true';
            const mortAmount = p.mortgage_amount ? Number(p.mortgage_amount).toLocaleString('en-IN') : null;
            const hasEc = !!(p.ec_timeline || p.ec_notes);

            const mortgageHtml = isMortgaged 
              ? `<div style="margin-top: 4px; padding: 2px 6px; background: #fff7ed; border: 1px solid #fed7aa; border-radius: 4px; color: #c2410c; font-weight: 700; font-size: 11px;">⚠️ Mortgaged${mortAmount ? ': ₹' + mortAmount : ''}</div>` 
              : '';

            const ecHtml = hasEc 
              ? `<div style="margin-top: 3px; font-size: 10px; color: #2563eb; font-weight: 700;">📜 EC History Available</div>` 
              : '';

            const statusColor = p.land_status === 'House' ? '#2563eb' : p.land_status === 'Empty Plot' ? '#16a34a' : '#d97706';

            popup.current.setLngLat(e.lngLat)
              .setHTML(`
                <div style="font-family: system-ui, -apple-system, sans-serif; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 10px 14px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); min-width: 160px; max-width: 260px;">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px;">
                    <span style="font-weight: 900; font-size: 13px; color: #0f172a;">Plot #${p.fid}</span>
                    <span style="font-size: 10px; font-weight: 800; color: ${statusColor}; background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${p.land_status || 'Plot'}</span>
                  </div>
                  <div style="font-size: 12px; font-weight: 700; color: #334155; margin-top: 3px;">
                    ${p.owner_name || 'Anonymous Owner'}
                  </div>
                  ${p.reg_doc_no ? `<div style="font-size: 10px; color: #2563eb; font-weight: 700; margin-top: 2px;">Doc: ${p.reg_doc_no}</div>` : ''}
                  ${p.nature_of_land ? `<div style="font-size: 10px; color: #64748b; margin-top: 1px;">${p.nature_of_land}</div>` : ''}
                  ${mortgageHtml}
                  ${ecHtml}
                </div>
              `)
              .addTo(map.current);
          }
        });

        map.current.on('mouseleave', 'plots-fill', () => {
          map.current.getCanvas().style.cursor = '';
          if (popup.current) popup.current.remove();
        });
      });

    } catch (err) {
      console.error('[Map] Init error:', err);
    }

    return () => { 
      if (popup.current) popup.current.remove();
      if (map.current) map.current.remove(); 
    };
  }, []);

  // Toggle base layer
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    try {
      map.current.setLayoutProperty('osm-layer', 'visibility', baseLayer === 'osm' ? 'visible' : 'none');
      map.current.setLayoutProperty('satellite-layer', 'visibility', baseLayer === 'satellite' ? 'visible' : 'none');
    } catch (e) {}
  }, [baseLayer]);

  // Toggle mortgaged borders visibility
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    try {
      if (map.current.getLayer('plots-mortgaged')) {
        map.current.setLayoutProperty(
          'plots-mortgaged', 
          'visibility', 
          showMortgageBorders ? 'visible' : 'none'
        );
      }
    } catch (e) {}
  }, [showMortgageBorders]);

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
  }, [selectedFid]);

  return (
    <div ref={mapContainer} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, background: '#f0f0f0' }} />
  );
};

export default MapView;
