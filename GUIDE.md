# Vasavi Nagar Colony Mapper - Field Guide

This application is designed for **offline-first field data collection**. It runs entirely in your browser and syncs with your local GeoJSON files.

## 🚀 Live Access
The application is deployed and accessible at:
**[https://GarudadevDataServices.github.io/vasavi-nagar-colony-mapper/](https://GarudadevDataServices.github.io/vasavi-nagar-colony-mapper/)**

---

## 💾 Modern "Smart Save" Workflow

We use the **File System Access API** to make the browser behave like a professional desktop application.

### Desktop (Chrome / Edge)
1.  **Import**: Click **Import** and select your `vasavi_map.geojson` file.
2.  **Permission**: The browser will ask for permission to "View files". Click **Allow**.
3.  **Edit**: Click on any plot and update the details in the compact form.
4.  **Save**: Click the **💾 Save** button. 
    -   The first time, the browser will ask for "Edit" permission. Click **Allow**.
    -   After that, every click of **Save** will **directly update the file on your computer**.
    -   No download prompts, no duplicate files.

### Mobile (Android / iOS)
1.  **Import**: Use the **Import** button to load your file.
2.  **Edit**: Perform your field survey. All changes are **auto-saved** to your phone's local storage instantly.
3.  **Export**: Since mobile browsers block direct file writing, click **Export** to download the updated GeoJSON.
4.  **Sync**: Move the exported file back to your master folder when you return to the office.

---

## 📋 New Fields & Feature Capabilities

-   **Registration Documents `[ Doc / Year ] - [ SRO Code (default 803) ] (+)`**:
    -   Supports the standard format where doc numbers are appended with the Sub-Registrar Office (SRO) code (e.g., `3220/2002-803`).
    -   **SRO Code**: Automatically defaults to `803` (Chirala SRO).
    -   **Multiple Registrations `(+)`**: Allows adding multiple registration documents per property (e.g., `2410/1974-803,10129/2025-803`).
    -   **Smart Pasting**: Pasting `3220/2002-803` into the document input automatically extracts and populates both the doc/year and SRO code.
-   **Mortgage Details & Amount**:
    -   Toggle "Mortgaged Property" to record bank name, mortgage registration deed document number, and **Mortgage Amount (₹)**.
    -   Auto-formats currency (e.g. `₹ 5,26,877 (5.27 Lakhs)`).
    -   Mortgaged plots are visibly indicated on the map with a red dashed boundary and hover tooltips.
    -   **Toggle Option**: Use the floating map controls button (`Mortgage Borders: ON / OFF`) to turn on or off the red dashed borders at any time (persists in your browser).
    -   Colony header displays quick statistics for mortgaged plots and total colony mortgage value.
-   **EC Notes & Timeline (Encumbrance Certificate)**:
    -   Rich historical tracking of all registration events (Sale Deeds, Settlement Deeds, Mortgage Deeds, etc.).
    -   **Timeline Cards View**: Auto-parses deeds, dates, parties, and plot/door/extent details with colored deed badges.
    -   **Edit Mode**: Textarea for quickly modifying or adding new registration events.
    -   **One-Click Copy**: Easily copy full EC history to the clipboard.
-   **Map Hover Tooltip**:
    -   Hover over any plot to view plot number, owner name, status, land nature, mortgage status/amount, and EC availability.
-   **Multi-Field Advanced Filtering**:
    -   Filter by Owner Name, Mortgaged status, Mortgage Amount (`>`, `<`, equals), Mortgage Bank, EC Notes (contains, has value), Status, Condition, Reg Doc #, and more.
    -   Quick Preset filter buttons in the header: **All Plots**, **Mortgaged**, and **EC Notes**.
-   **Reload Default Map**:
    -   Quick reload button in header (`🔄`) to reset or refresh map data directly from `vasavi_map.geojson`.

---

## 🛠 Developer Commands

If you are working locally:
- `npm run dev`: Start local development server.
- `npm run build`: Build production assets into `dist/`.
- `npm run deploy`: Build and deploy the latest version to GitHub Pages.
