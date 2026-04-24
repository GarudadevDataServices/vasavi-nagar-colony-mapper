# User Guide: Serverless Field Mapping

This application now runs entirely in your browser. No backend server is required.

## 🚀 How to Deploy to GitHub Pages

1. **Build the App**:
   Run this command in your terminal:
   ```bash
   npm run build
   ```
2. **Deploy**:
   The easiest way is to use the `gh-pages` package:
   ```bash
   npm install gh-pages --save-dev
   ```
   Add these scripts to your `package.json`:
   ```json
   "predeploy": "npm run build",
   "deploy": "gh-pages -d dist"
   ```
   Then run:
   ```bash
   npm run deploy
   ```
3. Your app will be live at `https://<your-username>.github.io/vasavi_nagar_conlony_2/`.

---

## 📂 Handling the GeoJSON File (Important)

### The "Fixed Path" Constraint
For security reasons, web browsers (on both mobile and desktop) **cannot** automatically read files from a fixed folder like `C:\Downloads` without you selecting them first. This prevents malicious websites from stealing your files.

### The Solution: Import Once, Work Anywhere
- **First Time**: Use the **Import** button or **Drag & Drop** your file onto the map.
- **Persistence**: Once imported, the app saves everything to the browser's **Local Storage**. You can close the tab or turn off your device, and your edits will still be there when you return to the URL.
- **Switching Devices**: If you want to move your work from your computer to your phone:
  1. **Export** from your computer.
  2. Send the file to your phone.
  3. **Import** it once on your phone.
  4. Now you can work on your phone offline as long as you want.

---

## Workflow: Switching Between Devices

### 1. Starting a Session
1. Open the application.
2. Drag and drop your `vasavi_nagar_colony.geojson` anywhere on the screen.
3. The map will load all plots instantly.

### 2. Working in the Field (Mobile)
- As you edit plots, the app automatically saves your progress.
- The **Centered Modal** design ensures that editing property details is easy even on a small phone screen.

### 3. Ending a Session & Syncing
1. Click **Export** to download the updated file.
2. Share/Send this file back to your master storage to keep your records updated.
