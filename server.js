import express from 'express';
import cors from 'cors';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const GEOJSON_PATH = resolve(__dirname, 'vasavi_nagar_colony.geojson');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Read GeoJSON
app.get('/api/geodata', (req, res) => {
  try {
    const raw = readFileSync(GEOJSON_PATH, 'utf-8');
    res.json(JSON.parse(raw));
  } catch (err) {
    console.error('Error reading GeoJSON:', err.message);
    res.status(500).json({ error: 'Failed to read GeoJSON file' });
  }
});

// Write GeoJSON
app.post('/api/geodata', (req, res) => {
  try {
    const data = JSON.stringify(req.body, null, 2);
    writeFileSync(GEOJSON_PATH, data, 'utf-8');
    res.json({ success: true, message: 'GeoJSON saved successfully' });
  } catch (err) {
    console.error('Error writing GeoJSON:', err.message);
    res.status(500).json({ error: 'Failed to write GeoJSON file' });
  }
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`[Server] GeoJSON API running on http://localhost:${PORT}`);
  console.log(`[Server] File path: ${GEOJSON_PATH}`);
});
